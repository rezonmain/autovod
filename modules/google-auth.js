import crypto from "node:crypto";
import { fileCache } from "../modules/file-cache.js";
import { getPem } from "./rsa-pem.js";
import jwt from "jsonwebtoken";
import { env } from "../utils/env.js";
import {
  YT_OAUTH_URL,
  ENV_KEYS,
  CACHE_KEYS,
  GOOGLE_DISCOVERY_DOC_URL,
  JWKS_URI_KEY,
} from "../const.js";
import { empty } from "../utils/utils.js";
import { log } from "./log.js";

export const googleAuth = {
  /**
   * Use for application authorization (performing requests to google api's on behalf of the user)
   * https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient
   * @param {string[]} scopes
   * @param {string} state
   * @returns {string}
   */
  buildAuthorizationURL(scopes, state) {
    const url = new URL(YT_OAUTH_URL);
    url.searchParams.append("client_id", env(ENV_KEYS.GOOGLE_CLIENT_ID));
    url.searchParams.append("redirect_uri", env(ENV_KEYS.GOOGLE_REDIRECT_URI));
    url.searchParams.append("response_type", "code");
    url.searchParams.append("scope", scopes.join(" "));
    url.searchParams.append("access_type", "offline");
    url.searchParams.append("state", state);
    url.searchParams.append("login_hint", env(ENV_KEYS.GOOGLE_AUTH_HINT));
    return url.toString();
  },

  /**
   * https://developers.google.com/identity/openid-connect/openid-connect#sendauthrequest
   * Use for client authorization flow (authenticating requests to autovod)
   * @param {string[]} scopes
   * @param {string} state
   * @returns {string}
   */
  buildClientAuthorizationURL(state) {
    const url = new URL(YT_OAUTH_URL);
    url.searchParams.append("client_id", env(ENV_KEYS.GOOGLE_CLIENT_ID));
    url.searchParams.append("response_type", "code");
    url.searchParams.append("scope", "openid email");
    url.searchParams.append(
      "redirect_uri",
      env(ENV_KEYS.GOOGLE_CLIENT_REDIRECT_URI)
    );
    url.searchParams.append("state", state);
    url.searchParams.append("nonce", googleAuth.generateNonce());
    return url.toString();
  },

  generateStateToken() {
    return encodeURIComponent(
      crypto.createHash("sha256").update(crypto.randomBytes(8)).digest("hex")
    );
  },

  generateNonce() {
    return encodeURIComponent(crypto.randomBytes(4).toString("hex"));
  },

  /**
   * @typedef {Object} GoogleCert
   * @property {string} kty
   * @property {string} n
   * @property {string} alg
   * @property {string} use
   * @property {string} e
   * @property {string} kid
   */
  /**
   * @returns {Promise<[Error, GoogleCert[]]}
   */
  async getCerts() {
    const [error, cachedCerts] = fileCache.get(CACHE_KEYS.GOOGLE_CERTS);

    if (empty(error)) {
      return [null, cachedCerts.map((cert) => JSON.parse(cert))];
    }

    try {
      const discoveryResponse = await fetch(GOOGLE_DISCOVERY_DOC_URL);

      if (!discoveryResponse.ok) {
        throw new Error("Failed to fetch google discovery document");
      }

      const discoveryJson = await discoveryResponse.json();

      const jwksUri = discoveryJson[JWKS_URI_KEY];

      const jwksResponse = await fetch(jwksUri);

      if (!jwksResponse.ok) {
        throw new Error("Failed to fetch jwks from google");
      }

      const jwksJson = await jwksResponse.json();

      /** @type {GoogleCert[]} */
      const certs = jwksJson.keys;

      fileCache.set(
        CACHE_KEYS.GOOGLE_CERTS,
        Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
        ...certs.map((cert) => JSON.stringify(cert))
      );

      return [null, certs];
    } catch (error) {
      return [error, null];
    }
  },

  /**
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async verifyToken(token) {
    const [error, certs] = await googleAuth.getCerts();

    if (error) {
      log.error(
        "[googleAuth.verifyToken] Failed to get certs for verification",
        error
      );
      return false;
    }

    try {
      const payload = jwt.decode(token, { complete: true });

      const certToUse = certs.find((cert) => cert.kid === payload.header.kid);

      if (empty(certToUse)) {
        log.error(
          "[googleAuth.verifyToken] Failed to find cert to use for verification"
        );
        return false;
      }

      const pem = getPem(certToUse.n, certToUse.e);

      return !!jwt.verify(token, pem, { algorithms: ["RS256"] });
    } catch (error) {
      log.error("[googleAuth.verifyToken] Failed to verify token", error);
      return false;
    }
  },
};
