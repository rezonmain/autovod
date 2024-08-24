/** @import { Request as ExpressRequest, Response as ExpressResponse} from "express" */
import path from "node:path";
import { store } from "../modules/store.js";
import { eventBus } from "../modules/event-bus.js";
import { log } from "../modules/log.js";
import { empty } from "../utils/utils.js";
import {
  APPLICATION_EVENT_TYPES,
  APPLICATION_STORE_KEYS,
  DOCUMENTS,
} from "../const.js";

const DIRNAME = process.cwd();
const ASSETS_PATH = path.resolve(DIRNAME, "assets");

/**
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
async function handleAuthRedirect(_, res) {
  // serve small payload to get the parameters in the fragment
  const documentPath = path.resolve(
    ASSETS_PATH,
    DOCUMENTS.CALLBACK_GOOGLE_REDIRECT
  );
  res.sendFile(documentPath);
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

  // delete the generate state after use, avoids replay attacks
  store.delete(APPLICATION_STORE_KEYS.GOOGLE_AUTH_STATE);

  eventBus.publish(
    APPLICATION_EVENT_TYPES.GOOGLE_AUTH_REDIRECT,
    Date.now() + expires_in * 1000,
    access_token
  );
  res.send("Authenticated with Google.\n You can close this tab now");
}

export const callbackGoogleService = {
  handleAuthRedirect,
  handleTokenPayload,
};
