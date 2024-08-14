import { CACHE_KEYS, TWITCH_TOKEN_URL } from "../const.js";
import { empty } from "../utils.js";
import { fileCache } from "./file-cache.js";

/**
 * @typedef {Object} TwitchAccess
 * @property {string} accessToken
 * @property {number} expiresAt
 * @property {string} tokenType
 */

export const twitchAuth = {
  /**
   * @param {string} clientId
   * @param {string} clientSecret
   * @returns {Promise<[Error, string]>}
   */
  getAccessToken: async (
    clientId = process.env.TWITCH_CLIENT_ID,
    clientSecret = process.env.TWITCH_CLIENT_SECRET
  ) => {
    const cachedToken = fileCache.getOne(CACHE_KEYS.TWITCH_ACCESS);

    if (cachedToken) {
      return [null, cachedToken];
    }

    if (empty(clientId) || empty(clientSecret)) {
      throw new Error("Client ID and Client Secret are required");
    }

    const url = `${TWITCH_TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "x-www-form-urlencoded" },
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const responseJson = await response.json();

      const expiresAt = Date.now() + responseJson.expires_in;

      fileCache.set(
        CACHE_KEYS.TWITCH_ACCESS,
        expiresAt,
        responseJson.access_token
      );
      return [null, responseJson.access_token];
    } catch (error) {
      return [error, null];
    }
  },
};
