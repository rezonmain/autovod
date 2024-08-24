import {
  APP_ENV,
  APPLICATION_EVENT_TYPES,
  APPLICATION_STORE_KEYS,
  CACHE_KEYS,
  ENV_KEYS,
  GOOGLE_API_SCOPES,
} from "../const.js";
import { googleAuth } from "./google-auth.js";
import { fileCache } from "./file-cache.js";
import { log } from "./log.js";
import { eventBus } from "./event-bus.js";
import { store } from "./store.js";
import { empty } from "../utils/utils.js";
import { Telegram } from "./telegram.js";
import { env } from "../utils/env.js";

export const ytAuth = {
  authorize: async () => {
    const state = googleAuth.generateStateToken();
    const scopes = [GOOGLE_API_SCOPES.YT];
    const url = googleAuth.buildAuthorizationURL(scopes, state);
    store.set(APPLICATION_STORE_KEYS.GOOGLE_AUTH_STATE, state);

    const callback = (token, ttl) => {
      fileCache.set(CACHE_KEYS.YT_ACCESS, ttl, token);
      log.info("Successfully authenticated with Google");
    };

    eventBus.subscribe(APPLICATION_EVENT_TYPES.GOOGLE_AUTH_REDIRECT, callback);

    log.log(
      `Open the following URL in your browser and grant access to YouTube:\n\n${url}\n`
    );

    await ytAuth.sendTelegramMessage(url);
  },

  /**
   * @returns {[Error, string]>}
   */
  getAccessToken: async () => {
    const cachedToken = fileCache.getOne(CACHE_KEYS.YT_ACCESS);

    if (empty(cachedToken)) {
      return [new Error("Youtube access token not found in cache"), null];
    }

    return [null, cachedToken];
  },

  sendTelegramMessage: async (url) => {
    if (env(ENV_KEYS.NODE_ENV) === APP_ENV.PROD) {
      return;
    }
    log.info("Sending auth URL as a message to Telegram");
    try {
      const telegram = new Telegram();
      await telegram.start();
      const htmlMessage = `
        <b>autovod</b> needs your permission to manage live streams on your behalf.
        Please click on the following link to do so:
        </br/>
        <a href="${url}">Authenticate with Google</a>
        `;
      await telegram.sendMessage(htmlMessage, "HTML");
      await telegram.stop();
    } catch (error) {
      log.error(
        "[ytAuth.sendTelegramMessage] Error sending auth URL to Telegram",
        error
      );
    }
  },
};
