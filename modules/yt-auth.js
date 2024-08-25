import {
  APPLICATION_EVENT_TYPES,
  APPLICATION_STORE_KEYS,
  CACHE_KEYS,
  GOOGLE_API_SCOPES,
} from "../const.js";
import { googleAuth } from "./google-auth.js";
import { log } from "./log.js";
import { eventBus } from "./event-bus.js";
import { store } from "./store.js";
import { Telegram } from "./telegram.js";
import { fileCache } from "./file-cache.js";
import { empty } from "../utils/utils.js";

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
        (ttl, accessToken) => {
          ytAuth._setAccessToken(ttl, accessToken);
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
    const token = fileCache.getOne(CACHE_KEYS.YT_ACCESS);

    if (!empty(token)) {
      return [null, token];
    }

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

  // TODO: this is not working???
  sendTelegramMessage: async (url) => {
    try {
      const telegram = new Telegram();
      await telegram.start();
      const message = `🔐 *autovod* needs your permission to manage live streams on your behalf\\. Please [click on this link to do so](${url})`;
      await telegram.sendMessage(message);
      await telegram.stop();
    } catch (error) {
      log.error(
        "[ytAuth.sendTelegramMessage] Error sending auth URL to Telegram",
        error
      );
    }
  },
};
