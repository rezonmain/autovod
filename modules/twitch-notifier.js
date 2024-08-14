import crypto from "crypto";
import { TWITCH_WEBHOOK_HEADERS, TWITCH_WEBHOOK_HMAC_PREFIX } from "../const";
import { empty } from "../utils";

export const twitchNotifier = {
  subscribeToWebhook: () => {},

  /**
   * https://dev.twitch.tv/docs/eventsub/handling-webhook-events/#verifying-the-event-message
   * @param {Response} response
   * @returns {Promise<[Error, boolean]>}
   */
  verifyMessage: (response) => {
    const secret = process.env.TWITCH_WEBHOOK_SECRET;

    try {
      if (empty(secret)) {
        throw new Error("Webhook Secret is required");
      }

      const message =
        response.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_ID] +
        response.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_TIMESTAMP] +
        response.body;

      const hmac =
        TWITCH_WEBHOOK_HMAC_PREFIX +
        crypto.createHmac("sha256", secret).update(message).digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(hmac),
        Buffer.from(response.headers[TWITCH_WEBHOOK_HEADERS.MESSAGE_SIGNATURE])
      );
    } catch (error) {
      return [error, false];
    }
  },
};
