import {
  ENV_KEYS,
  TWITCH_GQL_URL,
  TWITCH_M3U8_URL,
  TWITCH_PUBLIC_CLIENT_ID,
} from "../const.js";
import { env } from "../utils/env.js";
/**
 * @typedef {Object} PlaybackAccessToken
 * @property {string} value
 * @property {string} signature
 */

export const twitchPlaylist = {
  /**
   *
   * @param {string} login
   * @param {string} [personalOAuthToken]
   * @return {Promise<[Error, PlaybackAccessToken>]}
   */
  getPlaybackAccessToken: async (
    login,
    personalOAuthToken = env(ENV_KEYS.TWITCH_PERSONAL_OAUTH_TOKEN)
  ) => {
    const url = new URL(TWITCH_GQL_URL);
    const requestBody = {
      operationName: "PlaybackAccessToken",
      variables: {
        login: login,
        isLive: true,
        isVod: false,
        vodID: "",
        playerType: "embed",
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash:
            "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712",
        },
      },
    };
    const headers = {
      "Client-Id": TWITCH_PUBLIC_CLIENT_ID,
      "Content-Type": "application/json",
    };

    if (personalOAuthToken) {
      headers["Authorization"] = `OAuth ${personalOAuthToken}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        return [
          new Error(`[getPlaybackAccessToken] bad request: ${response.status}`),
          null,
        ];
      }

      const responseJson = await response.json();
      return [null, responseJson.data.streamPlaybackAccessToken];
    } catch (error) {
      return [error, null];
    }
  },

  buildM3u8Url: (login, accessToken) => {
    const queryParams = {
      client_id: TWITCH_PUBLIC_CLIENT_ID,
      token: accessToken.value,
      sig: accessToken.signature,
      allow_source: true,
      allow_audio_only: true,
    };
    const url = new URL(`${TWITCH_M3U8_URL}/${login}.m3u8`);
    url.search = new URLSearchParams(queryParams).toString();
    return url.toString();
  },

  /**
   * @param {string} login
   * @param {PlaybackAccessToken} playbackAccessToken
   * @return {Promise<[Error, string]>}
   */
  getM3U8Playlist: async (login, playbackAccessToken) => {
    const queryParams = {
      client_id: TWITCH_PUBLIC_CLIENT_ID,
      token: playbackAccessToken.value,
      sig: playbackAccessToken.signature,
      allow_source: true,
      allow_audio_only: true,
    };
    const url = new URL(`${TWITCH_M3U8_URL}/${login}.m3u8`);
    url.search = new URLSearchParams(queryParams).toString();

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return [
            new Error(
              `[getM3U8Playlist] stream for ${login} is offline or does not exist`
            ),
            null,
          ];
        }
        return [
          new Error(`[getM3U8Playlist] bad request: ${response.status}`),
          null,
        ];
      }

      return [null, await response.text()];
    } catch (error) {
      return [error, null];
    }
  },
};
