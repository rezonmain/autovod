/** @import { YTGetStreamsOptions, YTInsertBroadcastBody, YTInsertBroadcastOptions, YTBroadcast, YTStream, YTTransitionBroadcastOptions, YTListBroadcastsOptions } from '../jsdoc.types.js' */
import { BROADCAST_DEFAULT_BODY, YT_API_URLS } from "../const.js";
import { eventLog } from "./event-log.js";
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
        eventLog.log("[ytApi.getStreams] Failed to get streams", "error", {
          responseJson: JSON.stringify(responseBody),
          responseCode: response.status,
          responseText: response.statusText,
          queryParams: queryParams.toString(),
        });
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
        eventLog.log(
          "[ytApi.insertBroadcast] Failed to insert broadcast",
          "error",
          {
            responseJson: JSON.stringify(responseBody),
            responseCode: response.status,
            responseText: response.statusText,
            requestBody: JSON.stringify(body),
            queryParams: queryParams.toString(),
          }
        );
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
      part: "id,snippet",
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
        eventLog.log(
          "[ytApi.bindBroadcast] Failed to bind broadcast",
          "error",
          {
            responseJson: JSON.stringify(responseBody),
            responseCode: response.status,
            responseText: response.statusText,
            queryParams: queryParams.toString(),
            options: JSON.stringify(options),
          }
        );
        throw new Error(JSON.stringify(responseBody));
      }

      return [null, await response.json()];
    } catch (error) {
      return [error, null];
    }
  },

  /**
   *
   * @param {string} accessToken
   * @param {YTTransitionBroadcastOptions} options
   * @returns {Promise<[Error, YTBroadcast]>}
   */
  async transitionBroadcast(accessToken, options) {
    const url = new URL(YT_API_URLS.TRANSITION);
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
        },
      });

      if (!response.ok) {
        const responseBody = await response.json();
        eventLog.log(
          "[ytApi.transitionBroadcast] Failed to transition broadcast",
          "error",
          {
            responseJson: JSON.stringify(responseBody),
            responseCode: response.status,
            responseText: response.statusText,
            queryParams: queryParams.toString(),
            options: JSON.stringify(options),
          }
        );
        throw new Error(JSON.stringify(responseBody));
      }

      return [null, await response.json()];
    } catch (error) {
      return [error, null];
    }
  },

  /**
   * @param {string} accessToken
   * @param {YTListBroadcastsOptions} options
   * @returns {Promise<[Error, YTBroadcast[]]>}
   */
  async listBroadcasts(accessToken, options) {
    const url = new URL(YT_API_URLS.BROADCAST);
    const queryParams = new URLSearchParams({
      ...options,
      part: options?.part.join(",") ?? "",
    });
    url.search = queryParams.toString();

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const responseBody = await response.json();
        eventLog.log("[ytApi.listBroadcasts] Failed to get streams", "error", {
          responseJson: responseBody,
          responseCode: response.status,
          responseText: response.statusText,
          queryParams: queryParams.toString(),
        });
        throw new Error(JSON.stringify(responseBody));
      }

      const data = await response.json();

      return [null, data.items];
    } catch (error) {
      return [error, null];
    }
  },
};
