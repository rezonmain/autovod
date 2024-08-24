/** @import { Request as ExpressRequest, Response as ExpressResponse} from "express" */
import { store } from "../modules/store.js";
import { eventBus } from "../modules/event-bus.js";
import { log } from "../modules/log.js";
import { empty } from "../utils/utils.js";
import { APPLICATION_EVENT_TYPES, APPLICATION_STORE_KEYS } from "../const.js";

/**
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
async function handleAuthRedirect(req, res) {
  // serve small payload to get the parameters in the fragment
  res.send(
    `
    <html>
      <head>Authenticating with Google...</head>
      <body>
        <script>
          const params = new URLSearchParams(window.location.hash.substring(1));
          const json = JSON.stringify(Object.fromEntries(params));
          fetch("/callback/google/auth", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: json,
          });
        </script>
    </html>
    `
  );
}

/**
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
async function handleTokenPayload(req, res) {
  let payload;
  try {
    payload = JSON.parse(req.rawBody);
  } catch {
    log.error("[handleAuthRedirect] Error parsing payload");
    res.sendStatus(400);
    return;
  }

  const { access_token, expires_in, state } = payload;

  if (empty(access_token)) {
    log.error("[handleAuthRedirect] Missing code in query parameters");
    res.sendStatus(400);
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

  store.delete(APPLICATION_STORE_KEYS.GOOGLE_AUTH_STATE);

  eventBus.publish(
    APPLICATION_EVENT_TYPES.GOOGLE_AUTH_REDIRECT,
    access_token,
    Date.now() + expires_in * 1000
  );
  res.send("Authenticated with Google.\n You can close this tab now");
  log.info("[handleAuthRedirect] Successfully authenticated with Google");
}

export const callbackGoogleService = {
  handleAuthRedirect,
  handleTokenPayload,
};
