/** @import { TwitchSubscription, TwitchUser } from '../jsdoc.types.js'*/
import { ENV_KEYS, TWITCH_API_URLS, TWITCH_EVENTSUB_TYPES } from "../const.js";
import { env, envs } from "../env.js";
import { nil } from "../utils.js";

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
   *  @returns {Promise<[Error, {data: TwitchSubscription[], total: number, total_cost: number, max_total_cost: number}]>}
   */
  getSubscriptions = async (options) => {
    const url = new URL(TWITCH_API_URLS.EVENTSUB);
    const queryParams = new URLSearchParams(options);
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
      return [null, responseJson];
    } catch (error) {
      return [error, null];
    }
  };

  /**
   * @param {string} subscriptionId
   * @return {Promise<Error | null>}
   */
  deleteSubscription = async (subscriptionId) => {
    const url = new URL(TWITCH_API_URLS.EVENTSUB);
    const queryParams = new URLSearchParams({ id: subscriptionId });
    url.search = queryParams.toString();

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Client-Id": this.clientId,
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return null;
    } catch (error) {
      return error;
    }
  };

  /**
   * @param {string[]} userIds
   * @return {Promise<[Error, TwitchUser[]]>}
   */
  getUsers = async (userIds) => {
    const url = new URL(TWITCH_API_URLS.USERS);
    const queryParams = `id=${userIds.join("&id=")}`;
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
      return [null, responseJson.data];
    } catch (error) {
      return [error, null];
    }
  };

  /**
   *
   * @returns {Promise<[Error, {id: string, channel: string, eventsubType: string, status: string}[]]>}
   */
  listFormattedSubscriptions = async () => {
    const [subError, subscriptions] = await this.getSubscriptions();
    if (subError) {
      return [subError, null];
    }

    const broadcasterIds = subscriptions.data.map(
      (sub) => sub.condition.broadcaster_user_id
    );

    if (!broadcasterIds.length) {
      return [null, []];
    }

    if (broadcasterIds.length > 100) {
      return [new Error("Method supports up to 100 subscriptions"), null];
    }

    const [usersError, users] = await this.getUsers(broadcasterIds);
    if (usersError) {
      return [usersError, null];
    }

    const formattedSubscriptions = subscriptions.data.map((sub) => {
      const user = users.find(
        (user) => user.id === sub.condition.broadcaster_user_id
      );
      if (nil(user)) {
        return { id: ",", channel: "", eventsubType: "", status: "" };
      }
      return {
        id: sub.id,
        channel: user.display_name,
        eventsubType: sub.type,
        status: sub.status,
      };
    });

    return [null, formattedSubscriptions];
  };

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

  /**
   * @param {number} channelId
   * @return {Promise<Error | null>}
   */
  subscribeToStreamOfflineEvents = async (channelId) => {
    const [callbackBaseUrl, webhookSecret, clientId] = envs(
      ENV_KEYS.DOMAIN_BASE_URL,
      ENV_KEYS.TWITCH_WEBHOOK_SECRET,
      ENV_KEYS.TWITCH_CLIENT_ID
    );

    const requestBody = {
      type: TWITCH_EVENTSUB_TYPES.STREAM_OFFLINE.type,
      version: TWITCH_EVENTSUB_TYPES.STREAM_OFFLINE.version,
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
      return new Error(`[subscribeToStreamOfflineEvents] something went wrong`);
    }
  };
}
