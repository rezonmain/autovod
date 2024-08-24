import { YT_API_URLS } from "../const.js";
import { empty } from "../utils/utils.js";
import { ytAuth } from "./yt-auth.js";

export class YtApi {
  /**
   * @type {() => [Error, string]}
   */
  accessTokenResolver;
  isWaitingForAuthorization = false;

  /**
   *
   * @param {() => [Error, string]} accessTokenResolver
   */
  constructor(accessTokenResolver) {
    this.accessTokenResolver = accessTokenResolver;
  }

  authorize = () => {
    this.isWaitingForAuthorization = true;
    ytAuth.authorize();
  };

  /**
   * @returns {Promise<[Error, string]>}
   */
  getBroadcastId = async () => {
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
          Authorization: `Bearer ${this.accessToken}`,
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
  };

  /**
   * @param {string} broadcastId
   * @param {string} title
   * @return Promise<Error | null>
   */
  updateBroadcastTitle = async (broadcastId, title) => {
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
          Authorization: `Bearer ${this.accessToken}`,
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
  };
}
