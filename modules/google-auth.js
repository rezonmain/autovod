/** @import { GoogleCert } from '../jsdoc.types.js' */
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
   * Use for client authorization flow (authenticating requests to autovod)
   * https://developers.google.com/identity/openid-connect/openid-connect#sendauthrequest
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
   * @param {string} token
   * @returns {Promise<[Error, GoogleCert]} - cert with Kid matching the token
   */
  async getCertForToken(token) {
    const [certsError, cachedCerts] = fileCache.get(CACHE_KEYS.GOOGLE_CERTS);
    const payload = jwt.decode(token, { complete: true });

    if (empty(certsError)) {
      /** @type {GoogleCert[]} */
      const certs = cachedCerts.map((cert) => JSON.parse(cert));
      const certToUse = certs.find((cert) => cert.kid === payload.header.kid);
      if (empty(certToUse)) {
        return [
          new Error(
            "[googleAuth.getCertForToken] Failed to find cert to use for verification"
          ),
          null,
        ];
      }

      return [null, certToUse];
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

      const certToUse = certs.find((cert) => cert.kid === payload.header.kid);

      if (empty(certToUse)) {
        throw new Error(
          "[googleAuth.getCertForToken] Failed to find cert to use for verification"
        );
      }

      fileCache.set(
        CACHE_KEYS.GOOGLE_CERTS,
        Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        ...certs.map((cert) => JSON.stringify(cert))
      );

      return [null, certToUse];
    } catch (error) {
      return [error, null];
    }
  },

  /**
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async verifyToken(token) {
    if (empty(token)) {
      return false;
    }

    const [error, cert] = await googleAuth.getCertForToken(token);

    if (error) {
      log.error(
        "[googleAuth.verifyToken] Failed to get cert for verification",
        error
      );
      return false;
    }

    try {
      const pem = getPem(cert.n, cert.e);
      return Boolean(jwt.verify(token, pem, { algorithms: ["RS256"] }));
    } catch (error) {
      log.error("[googleAuth.verifyToken] Failed to verify token", error);
      return false;
    }
  },
};
