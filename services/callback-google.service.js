/** @import { Request as ExpressRequest, Response as ExpressResponse} from "express" */
import { store } from "../modules/store.js";
import { eventBus } from "../modules/event-bus.js";
import { log } from "../modules/log.js";
import { empty } from "../utils/utils.js";
import {
  APPLICATION_EVENT_TYPES,
  APPLICATION_STORE_KEYS,
  ENV_KEYS,
  YT_ACCESS_TOKEN_URL,
} from "../const.js";
import { env } from "../utils/env.js";

/**
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
async function handleAuthRedirect(req, res) {
  const { state, error = "", code } = req.query;

  if (!empty(error)) {
    log.error(`[handleAuthRedirect] Google OAuth error: ${error}`);
    res.sendStatus(204);
    return;
  }

  if (empty(state)) {
    log.error("[handleAuthRedirect] Missing state in query parameters");
    res.sendStatus(400);
    return;
  }

  if (state !== store.get(APPLICATION_STORE_KEYS.GOOGLE_AUTH_STATE)) {
    log.error("[handleAuthRedirect] State mismatch");
    res.sendStatus(400);
    return;
  }
  // delete the generated state after use, avoids replay attacks
  store.delete(APPLICATION_STORE_KEYS.GOOGLE_AUTH_STATE);

  if (empty(code)) {
    log.error("[handleAuthRedirect] Missing code in query parameters");
    res.sendStatus(400);
    return;
  }

  res.sendStatus(200);

  try {
    const url = new URL(YT_ACCESS_TOKEN_URL);
    url.searchParams.append("client_id", env(ENV_KEYS.GOOGLE_CLIENT_ID));
    url.searchParams.append("client_secret", env(ENV_KEYS.GOOGLE_SECRET));
    url.searchParams.append("code", code);
    url.searchParams.append("grant_type", "authorization_code");
    url.searchParams.append("redirect_uri", env(ENV_KEYS.GOOGLE_REDIRECT_URI));

    const response = await fetch(url.toString(), {
      method: "POST",
      "Content-Type": "application/x-www-form-urlencoded",
    });

    if (!response.ok) {
      const json = await response.json();
      throw new Error(json);
    }

    const { access_token, expires_in, refresh_token } = await response.json();

    eventBus.publish(
      APPLICATION_EVENT_TYPES.GOOGLE_AUTH_REDIRECT,
      Date.now() + expires_in * 1000,
      access_token,
      refresh_token
    );
  } catch (error) {
    log.error(
      `[handleAuthRedirect] Error exchanging authorization code for refresh and access token: ${error}`
    );
  }
}

export const callbackGoogleService = {
  handleAuthRedirect,
};
