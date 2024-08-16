import { ENV_KEYS, TWITCH_API_URLS, TWITCH_EVENTSUB_TYPES } from "../const.js";
import { env, envs } from "../env.js";

export class TwitchApi {
  accessToken;
  clientId;
  constructor(accessToken, clientId = env(ENV_KEYS.TWITCH_CLIENT_ID)) {
    this.accessToken = accessToken;
    this.clientId = clientId;
  }

  /**
   * @param {string} channelName
   * @return {Promise<[Error, {id: number, isLive: boolean}]>}
   */
  getChannel = async (channelName) => {
    const queryObject = {
      query: channelName,
      first: 1,
    };
    const url = new URL(TWITCH_API_URLS.SEARCH_CHANNELS);
    const queryParams = new URLSearchParams(queryObject);
    url.search = queryParams.toString();

    try {
      const response = await fetch(url, {
        headers: {
          "Client-Id": this.clientId,
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const responseJson = await response.json();
      const channel = responseJson.data[0];

      if (!channel) {
        throw new Error("Channel not found");
      }

      return [null, { id: channel.id, isLive: channel.is_live }];
    } catch (error) {
      return [error, null];
    }
  };

  /**
   *
   */
  listSubscriptions = async () => {};

  /**
   * @param {number} channelId
   * @return {Promise<Error | null>}
   */
  subscribeToStreamOnlineEvents = async (channelId) => {
    const [callbackBaseUrl, webhookSecret, clientId] = envs(
      ENV_KEYS.DOMAIN_BASE_URL,
      ENV_KEYS.TWITCH_WEBHOOK_SECRET,
      ENV_KEYS.TWITCH_CLIENT_ID
    );

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
          Authorization: `Bearer ${this.accessToken}`,
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
  };
}
