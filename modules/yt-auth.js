import {
  APPLICATION_EVENT_TYPES,
  APPLICATION_STORE_KEYS,
  CACHE_KEYS,
  GOOGLE_API_SCOPES,
} from "../const.js";
import { googleAuth } from "./google-auth.js";
import { fileCache } from "./file-cache.js";
import { log } from "./log.js";
import { eventBus } from "./event-bus.js";
import { store } from "./store.js";

export const ytAuth = {
  authorize: async () => {
    const state = googleAuth.generateStateToken();
    const scopes = [GOOGLE_API_SCOPES.YT];
    const url = googleAuth.buildAuthorizationURL(scopes, state);
    store.set(APPLICATION_STORE_KEYS.GOOGLE_AUTH_STATE, state);

    log.log(
      `Open the following URL in your browser and grant access to YouTube:\n\n${url}\n`
    );

    const callback = (token, ttl) => {
      fileCache.set(CACHE_KEYS.YT_ACCESS, ttl, token);
      log.info("Successfully authenticated with Google");
    };

    eventBus.subscribe(APPLICATION_EVENT_TYPES.GOOGLE_AUTH_REDIRECT, callback);
  },

  /**
   * @returns {Promise<[Error, string]>}
   */
  getAccessToken: async () => {
    const cachedToken = fileCache.getOne(CACHE_KEYS.YT_ACCESS);

    if (cachedToken) {
      return [null, cachedToken];
    }

    log.error(
      "YT access token not found in cache, please authorize this app first"
    );
  },
};
