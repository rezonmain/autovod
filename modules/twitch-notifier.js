/** @import { TwitchWebhookNotification } from "../jsdoc.types.js" */
import { TWITCH_API_URLS, TWITCH_EVENTSUB_TYPES } from "../const.js";
import { empty } from "../utils.js";
import { Telegram } from "./telegram.js";

export const twitchNotifier = {
  /**
   * @param {number} channelId
   * @param {string} accessToken
   * @return {Promise<Error | null>}
   */
  subscribeToStreamOnlineEvents: async (channelId, accessToken) => {
    const callbackBaseUrl = process.env.DOMAIN_BASE_URL;
    const webhookSecret = process.env.TWITCH_WEBHOOK_SECRET;
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (empty(callbackBaseUrl)) {
      return new Error("DOMAIN_BASE_URL is not set");
    }

    if (empty(webhookSecret)) {
      return new Error("TWITCH_WEBHOOK_SECRET is not set");
    }

    if (empty(clientId)) {
      return new Error("TWITCH_CLIENT_ID is not set");
    }

    const requestBody = {
      type: TWITCH_EVENTSUB_TYPES.STREAM_ONLINE.type,
      version: TWITCH_EVENTSUB_TYPES.STREAM_ONLINE.version,
      condition: {
        broadcaster_user_id: String(channelId),
      },
      transport: {
        method: "webhook",
        callback: `${callbackBaseUrl}/callback/twitch/eventsub`,
        secret: webhookSecret,
      },
    };

    try {
      const response = await fetch(TWITCH_API_URLS.EVENTSUB, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-Id": clientId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const responseJson = await response.json();
        return new Error(
          `[subscribeToStreamOnlineEvents] bad request: ${
            response.status
          } | ${JSON.stringify(responseJson, null, 4)}`
        );
      }

      return null;
    } catch {
      return new Error(`[subscribeToStreamOnlineEvents] something went wrong`);
    }
  },

  /**
   * @param {TwitchWebhookNotification} notification
   */
  handleNotification: async (notification) => {
    const notificationType = notification.subscription.type;

    switch (notificationType) {
      case TWITCH_EVENTSUB_TYPES.STREAM_ONLINE.type:
        await twitchNotifier.handleStreamOnlineEvent(notification);
        return;
      case TWITCH_EVENTSUB_TYPES.STREAM_OFFLINE.type:
        return console.log(
          "[twitchNotifier.handleNotification] Stream offline"
        );
      default:
        return console.log(
          `[twitchNotifier.handleNotification] Unknown notification type: ${notificationType}`
        );
    }
  },

  /**
   * @param {TwitchWebhookNotification} notification
   */
  handleStreamOnlineEvent: async (notification) => {
    const telegram = new Telegram();
    telegram.start();
    await telegram.sendMessage(
      `*${notification.event.broadcaster_user_name}* is live NOW\\!`
    );
    await telegram.stop();
  },
};
