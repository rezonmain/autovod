/** @import { Request as ExpressRequest, Response as ExpressResponse} from "express" */
/** @import { TwitchWebhookNotification } from "../jsdoc.types.js" */
import crypto from "crypto";
import {
  ENV_KEYS,
  TWITCH_EVENT_MESSAGE_TYPE,
  TWITCH_EVENTSUB_TYPES,
  TWITCH_WEBHOOK_HEADERS,
  TWITCH_WEBHOOK_HMAC_PREFIX,
} from "../const.js";
import { env } from "../utils/env.js";
import { log } from "../modules/log.js";
import { YTStreamManager } from "../modules/youtube-stream-manager.js";
import { Telegram } from "../modules/telegram.js";
import { empty } from "../utils/utils.js";

/**
 * https://dev.twitch.tv/docs/eventsub/handling-webhook-events/#processing-an-event
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
async function handleEventSub(req, res) {
  const verified = verifyMessage(req);

  if (!verified) {
    log.log("[handleEventSub] Message verification failed");
    res.sendStatus(403);
    return;
  }

  let notification = {};

  try {
    notification = JSON.parse(req.rawBody);
  } catch (error) {
    log.error("[handleEventSub] Error parsing notification", error);
    res.sendStatus(400);
    return;
  }

  switch (req.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_TYPE]) {
    case TWITCH_EVENT_MESSAGE_TYPE.VERIFICATION:
      res
        .set("Content-Type", "text/plain")
        .status(200)
        .send(notification.challenge);
      log.info(
        `[handleEventSub] Verification challenge: ${notification.challenge}`
      );
      return;
    case TWITCH_EVENT_MESSAGE_TYPE.NOTIFICATION:
      res.sendStatus(204);
      log.info(
        `[handleEventSub] Notification | ${notification.event.broadcaster_user_name} | ${notification.event.type}`
      );
      await handleNotification(notification);
      return;
    case TWITCH_EVENT_MESSAGE_TYPE.REVOCATION:
      res.sendStatus(204);
      log.info(
        `[handleEventSub] ${notification.subscription.type} notifications revoked!`
      );
      log.info(`reason: ${notification.subscription.status}`);
      return;
    default:
      res.sendStatus(204);
      log.info("[handleEventSub] Unknown message type");
      return;
  }
}

/**
 * https://dev.twitch.tv/docs/eventsub/handling-webhook-events/#verifying-the-event-message
 * @param {ExpressRequest} req
 * @returns {Promise<boolean>}
 */
function verifyMessage(req) {
  const secret = env(ENV_KEYS.TWITCH_WEBHOOK_SECRET);

  try {
    const message =
      req.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_ID] +
      req.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_TIMESTAMP] +
      req.rawBody;

    const hmac =
      TWITCH_WEBHOOK_HMAC_PREFIX +
      crypto.createHmac("sha256", secret).update(message).digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(req.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_SIGNATURE])
    );
  } catch (error) {
    log.error("[verifyMessage] Error verifying message", error);
    return false;
  }
}

/**
 * @param {TwitchWebhookNotification} notification
 */
async function handleNotification(notification) {
  const notificationType = notification.subscription.type;

  switch (notificationType) {
    case TWITCH_EVENTSUB_TYPES.STREAM_ONLINE.type:
      await handleStreamOnlineEvent(notification);
      return;
    case TWITCH_EVENTSUB_TYPES.STREAM_OFFLINE.type:
      await handleStreamOfflineEvent(notification);
      return;
    default:
      return log.info(
        `[handleNotification] Unknown notification type: ${notificationType}`
      );
  }
}

/**
 * @param {TwitchWebhookNotification} notification
 */
async function handleStreamOnlineEvent(notification) {
  const login = notification.event.broadcaster_user_login;
  const telegram = Telegram.getInstance();
  try {
    await telegram.sendMessage(
      `🟣 *${notification.event.broadcaster_user_name}* is now live on [twitch](https://twitch.tv/${login})\\. 🟣`
    );
  } catch (error) {
    log.error(
      `[handleStreamOnlineEvent] Error sending message to telegram ${error}`
    );
  }
  const streamManager = YTStreamManager.getInstance();

  const [scheduleError, scheduleBroadcast] =
    await streamManager.scheduleBroadcast(login);
  if (scheduleError) {
    log.error(
      `[handleStreamOnlineEvent] Error scheduling broadcast: ${scheduleError}`
    );
    return;
  }

  if (empty(scheduleBroadcast?.stream) || empty(scheduleBroadcast?.broadcast)) {
    log.error(
      `[handleStreamOnlineEvent] Error scheduling broadcast: ${scheduleError}`
    );
    return;
  }

  streamManager.restreamToYT(scheduleBroadcast.stream, login);

  try {
    await telegram.sendMessage(
      `🔴 Restream has started for ${notification.event.broadcaster_user_name} on [youtube](https://youtube.com/watch?v=${scheduleBroadcast.broadcast.id})\\. 🔴`
    );
  } catch (error) {
    log.error(
      `[handleStreamOnlineEvent] Error sending message to telegram ${error}`
    );
  }
}

/**
 * @param {TwitchWebhookNotification} notification
 */
async function handleStreamOfflineEvent(notification) {
  const telegram = Telegram.getInstance();
  try {
    await telegram.sendMessage(
      `⬇️ *${notification.event.broadcaster_user_name}*'s stream has ended\\. ⬇️`
    );
  } catch (error) {
    log.info(
      `[handleStreamOnlineEvent] Error sending message to telegram ${error}`
    );
  }
}

export const callbackTwitchService = {
  handleEventSub,
};
