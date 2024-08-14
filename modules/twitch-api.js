import { TWITCH_API_URLS } from "../const.js";

export class TwitchApi {
  accessToken;
  clientId;
  constructor(accessToken, clientId = process.env.TWITCH_CLIENT_ID) {
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
}
