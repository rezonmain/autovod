/** @import { Request as ExpressRequest, Response as ExpressResponse} from "express" */
import crypto from "crypto";
import {
  ENV_KEYS,
  TWITCH_EVENT_MESSAGE_TYPE,
  TWITCH_WEBHOOK_HEADERS,
  TWITCH_WEBHOOK_HMAC_PREFIX,
} from "../const.js";
import { twitchNotifier } from "../modules/twitch-notifier.js";
import { env } from "../env.js";

/**
 * https://dev.twitch.tv/docs/eventsub/handling-webhook-events/#processing-an-event
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
async function handleEventSub(req, res) {
  const verified = verifyMessage(req);

  if (!verified) {
    res.sendStatus(403);
    return;
  }

  let notification = {};

  try {
    notification = JSON.parse(req.rawBody);
  } catch (error) {
    console.log(
      "[twitchNotifier.handleEventSub] Error parsing notification",
      error
    );
    res.sendStatus(400);
    return;
  }

  switch (req.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_TYPE]) {
    case TWITCH_EVENT_MESSAGE_TYPE.VERIFICATION:
      res
        .set("Content-Type", "text/plain")
        .status(200)
        .send(notification.challenge);
      console.log(
        `[twitchNotifier.handleEventSub] Verification challenge: ${notification.challenge}`
      );
      return;
    case TWITCH_EVENT_MESSAGE_TYPE.NOTIFICATION:
      res.sendStatus(204);
      console.log(
        `[${new Date().toISOString()}][twitchNotifier.handleEventSub] Notification | ${
          notification.event.broadcaster_user_name
        } | ${notification.event.type}`
      );
      await twitchNotifier.handleNotification(notification);
      return;
    case TWITCH_EVENT_MESSAGE_TYPE.REVOCATION:
      res.sendStatus(204);
      console.log(
        `[twitchNotifier.handleEventSub] ${notification.subscription.type} notifications revoked!`
      );
      console.log(`reason: ${notification.subscription.status}`);
      return;
    default:
      res.sendStatus(204);
      console.log("[twitchNotifier.handleEventSub] Unknown message type");
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
    console.log(
      "[twitchNotifier.verifyMessage] Error verifying message",
      error
    );
    return false;
  }
}

export const callbackTwitchService = {
  handleEventSub,
  verifyMessage,
};
