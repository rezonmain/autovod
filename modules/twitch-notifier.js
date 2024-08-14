import { TWITCH_API_URLS, TWITCH_EVENTSUB_TYPES } from "../const";
import { empty } from "../utils";

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
        broadcaster_user_id: channelId,
      },
      transport: {
        method: "webhook",
        callback: `${process.env.DOMAIN}/callback/twitch/eventsub`,
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
        return new Error(
          `Error subscribing to Twitch stream online events: ${response.statusText}`
        );
      }

      return null;
    } catch {
      return new Error("Error subscribing to Twitch stream online events");
    }
  },
};
