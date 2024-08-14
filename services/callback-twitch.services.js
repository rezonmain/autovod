/** @import { Request as ExpressRequest, Response as ExpressResponse} from "express" */
import {
  TWITCH_EVENT_MESSAGE_TYPE,
  TWITCH_WEBHOOK_HEADERS,
  TWITCH_WEBHOOK_HMAC_PREFIX,
} from "../const.js";
import { empty } from "../utils.js";

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

  const notification = JSON.parse(req.body);

  switch (req.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_TYPE]) {
    case TWITCH_EVENT_MESSAGE_TYPE.VERIFICATION:
      res
        .set("Content-Type", "text/plain")
        .status(200)
        .send(notification.challenge);
      break;
    case TWITCH_EVENT_MESSAGE_TYPE.NOTIFICATION:
      console.log("[twitchNotifier.handleEventSub] Notification", req.body);
      // spawn process to handle notification
      res.sendStatus(204);
      return;
    case TWITCH_EVENT_MESSAGE_TYPE.REVOCATION:
      res.sendStatus(204);
      console.log(`${notification.subscription.type} notifications revoked!`);
      console.log(`reason: ${notification.subscription.status}`);
      return;
    default:
      console.log("[twitchNotifier.handleEventSub] Unknown message type");
      res.sendStatus(204);
      return;
  }
  res.sendStatus(400);
}

/**
 * https://dev.twitch.tv/docs/eventsub/handling-webhook-events/#verifying-the-event-message
 * @param {ExpressRequest} req
 * @returns {Promise<boolean>}
 */
function verifyMessage(req) {
  const secret = process.env.TWITCH_WEBHOOK_SECRET;

  try {
    if (empty(secret)) {
      throw new Error("Webhook Secret is required");
    }

    const message =
      req.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_ID] +
      req.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_TIMESTAMP] +
      req.body;

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
