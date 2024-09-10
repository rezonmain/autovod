import {
  APPLICATION_EVENT_TYPES,
  APPLICATION_STORE_KEYS,
  CACHE_KEYS,
  GOOGLE_API_SCOPES,
  ENV_KEYS,
  YT_ACCESS_TOKEN_URL,
} from "../const.js";
import { googleAuth } from "./google-auth.js";
import { log } from "./log.js";
import { eventBus } from "./event-bus.js";
import { store } from "./store.js";
import { Telegram } from "./telegram.js";
import { fileCache } from "./file-cache.js";
import { env } from "../utils/env.js";

export const ytAuth = {
  /**
   * @param {(ttl, token) => void} callback
   * @returns {Promise<string>}
   */
  promptUserForAuthorization: () => {
    const state = googleAuth.generateStateToken();
    const scopes = [GOOGLE_API_SCOPES.YT];
    const url = googleAuth.buildAuthorizationURL(scopes, state);
    store.set(APPLICATION_STORE_KEYS.GOOGLE_AUTH_STATE, state);

    log.log(
      `Open the following URL in your browser and grant access to YouTube:\n\n${url}\n`
    );
    ytAuth.sendTelegramMessage(url);

    return new Promise((resolve, reject) => {
      eventBus.subscribe(
        APPLICATION_EVENT_TYPES.GOOGLE_AUTH_REDIRECT,
        (ttl, accessToken, refreshToken) => {
          ytAuth._setAccessToken(ttl, accessToken);
          ytAuth._setRefreshToken(refreshToken);
          resolve(accessToken);
        }
      );

      // reject after 5 minutes
      setTimeout(() => {
        reject("Authorization with google timed out");
      }, 5 * 60 * 1000);
    });
  },

  /**
   * @returns {Promise<[Error, string]>}
   */
  getAccessToken: async () => {
    const [accessTokenError, token] = fileCache.get(CACHE_KEYS.YT_ACCESS);

    if (accessTokenError === null) {
      // cache hit, return the access token
      return [null, token[0]];
    }

    const [refreshTokenError, refreshToken] = fileCache.get(
      CACHE_KEYS.YT_REFRESH
    );

    if (accessTokenError && refreshTokenError) {
      // no data in cache, prompt user for authorization
      try {
        const accessToken = await ytAuth.promptUserForAuthorization();
        return [null, accessToken];
      } catch (error) {
        return [error, null];
      }
    }

    if (accessTokenError && !refreshTokenError) {
      // access token is expired, but refresh token is available
      const [refreshAccessTokenError, payload] =
        await ytAuth.refreshAccessToken(refreshToken[0]);
      if (refreshAccessTokenError) {
        return [refreshAccessTokenError, null];
      }

      log.info("[ytAuth.getAccessToken] Refreshed access token");

      const ttl = Date.now() + payload.expires_in * 1000;
      ytAuth._setAccessToken(ttl, payload.access_token);

      return [null, payload.access_token];
    }

    // refresh token has expired for some reason
    try {
      const accessToken = await ytAuth.promptUserForAuthorization();
      return [null, accessToken];
    } catch (error) {
      return [error, null];
    }
  },

  _setAccessToken: (ttl, accessToken) => {
    return fileCache.set(CACHE_KEYS.YT_ACCESS, ttl, accessToken);
  },

  _setRefreshToken: (refreshToken) => {
    const ttl = Date.now() + 10 * 356 * 24 * 60 * 60 * 1000; // 10 years
    return fileCache.set(CACHE_KEYS.YT_REFRESH, ttl, refreshToken);
  },

  /**
   * @param {string} refreshToken
   * @returns {Promise<[Error, {access_token: string, expires_in: number}]>}
   */
  async refreshAccessToken(refreshToken) {
    const url = new URL(YT_ACCESS_TOKEN_URL);
    url.searchParams.append("client_id", env(ENV_KEYS.GOOGLE_CLIENT_ID));
    url.searchParams.append("client_secret", env(ENV_KEYS.GOOGLE_SECRET));
    url.searchParams.append("grant_type", "refresh_token");
    url.searchParams.append("refresh_token", refreshToken);

    try {
      const response = await fetch(url.toString(), {
        method: "POST",
        "Content-Type": "application/x-www-form-urlencoded",
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(
          "[yt-auth.refreshAccessToken] Error refreshing token: " +
            JSON.stringify(json)
        );
      }

      return [null, await response.json()];
    } catch (error) {
      return [error, null];
    }
  },

  sendTelegramMessage: async (url) => {
    try {
      const telegram = Telegram.getInstance();
      const message = `🔐 *autovod* needs your permission to manage live streams on your behalf\\. Please [click on this link to do so](${url})`;
      await telegram.sendMessage(message);
    } catch (error) {
      log.error(
        "[ytAuth.sendTelegramMessage] Error sending auth URL to Telegram",
        error
      );
    }
  },
};
