/** @import { YTGetStreamsOptions, YTInsertBroadcastBody, YTInsertBroadcastOptions, YTBroadcast, YTStream } from '../jsdoc.types.js' */

import { BROADCAST_DEFAULT_BODY, YT_API_URLS } from "../const.js";
import { empty } from "../utils/utils.js";

export const ytApi = {
  /**
   * @param {string} accessToken
   * @param {YTGetStreamsOptions} options
   * @returns {Promise<[Error, YTStream[]]>}
   */
  async getStreams(accessToken, options) {
    const url = new URL(YT_API_URLS.STREAM);
    const queryParams = new URLSearchParams({
      ...options,
      part: options?.part.join(",") ?? "",
    });
    url.search = queryParams.toString();

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const responseBody = await response.json();
        throw new Error(JSON.stringify(responseBody));
      }

      const data = await response.json();

      if (empty(data?.items)) {
        throw new Error("No streams found");
      }

      return [null, data.items];
    } catch (error) {
      return [error, null];
    }
  },

  /**
   *
   * @param {string} accessToken
   * @param {YTInsertBroadcastOptions} [options]
   * @param {YTInsertBroadcastBody} [body]
   * @returns {Promise<[Error, YTBroadcast]>}
   *
   */
  async insertBroadcast(
    accessToken,
    options = { part: ["contentDetails", "snippet", "status"] },
    body = BROADCAST_DEFAULT_BODY
  ) {
    const url = new URL(YT_API_URLS.BROADCAST);
    const queryParams = new URLSearchParams({
      ...options,
      part: options.part.join(","),
    });
    url.search = queryParams.toString();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const responseBody = await response.json();
        throw new Error(JSON.stringify(responseBody));
      }

      const data = await response.json();

      return [null, data];
    } catch (error) {
      return [error, null];
    }
  },

  /**
   *
   * @param {string} accessToken
   * @param {{id: string, streamId: string}} options
   * @returns {Promise<[Error, YTBroadcast]>}
   */
  async bindBroadcast(accessToken, options) {
    const url = new URL(YT_API_URLS.BROADCAST_BIND);
    const queryParams = new URLSearchParams({
      part: "snippet",
      ...options,
    });
    url.search = queryParams.toString();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const responseBody = await response.json();
        throw new Error(JSON.stringify(responseBody));
      }

      return [null, await response.json()];
    } catch (error) {
      return [error, null];
    }
  },

  /**
   * @returns {Promise<[Error, string]>}
   */
  getBroadcastId: async (accessToken) => {
    const url = new URL(YT_API_URLS.BROADCAST);
    const queryParams = new URLSearchParams({
      part: "id",
      mine: true,
      maxResults: 1,
    });
    url.search = queryParams.toString();

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();

      if (empty(data?.items?.[0]?.id)) {
        throw new Error("No broadcast found");
      }

      return [null, data.items[0].id];
    } catch (error) {
      return [error, null];
    }
  },

  /**
   * @param {string} broadcastId
   * @param {string} title
   * @return Promise<Error | null>
   */
  updateBroadcastTitle: async (accessToken, broadcastId, title) => {
    const url = new URL(YT_API_URLS.BROADCAST);
    const queryParams = new URLSearchParams({
      part: "snippet",
    });
    url.search = queryParams.toString();
    const body = {
      id: broadcastId,
      snippet: {
        title,
        scheduledStartTime: "",
      },
    };

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return null;
    } catch (error) {
      return error;
    }
  },
};
