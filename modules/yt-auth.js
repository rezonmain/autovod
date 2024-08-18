import jwt from "jsonwebtoken";
import { CACHE_KEYS, ENV_KEYS, SECRETS, YT_TOKEN_URL } from "../const.js";
import { readPrivateKey } from "../utils/secrets.js";
import { env } from "../utils/env.js";
import { fileCache } from "./file-cache.js";

export const ytAuth = {
  /**
   * @returns {Promise<[Error, string]>}
   */
  buildJWT: async () => {
    const jwtHeader = {
      alg: "RS256",
      typ: "JWT",
    };

    const scopes = ["https://www.googleapis.com/auth/youtube"];

    const jwtClaim = {
      iss: env(ENV_KEYS.YT_SERVICE_ACCOUNT_EMAIL),
      scope: scopes.join(" "),
      aud: "https://oauth2.googleapis.com/token",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    };

    try {
      const [keyError, key] = await readPrivateKey(
        SECRETS.GOOGLE_SERVICE_ACCOUNT_KEY,
        false
      );
      if (keyError) {
        return [keyError, null];
      }

      return [
        null,
        jwt.sign(jwtClaim, key, {
          header: jwtHeader,
        }),
      ];
    } catch (error) {
      return [error, null];
    }
  },

  /**
   * @returns {Promise<[Error, string]>}
   */
  getAccessToken: async () => {
    const cachedToken = fileCache.getOne(CACHE_KEYS.YT_ACCESS);

    if (cachedToken) {
      return [null, cachedToken];
    }

    const [error, jwt] = await ytAuth.buildJWT();
    if (error) {
      return [error, null];
    }
    const url = new URL(YT_TOKEN_URL);
    const body = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const responseJson = await response.json();
      const expiresAt = Date.now() + responseJson.expires_in * 1000;
      fileCache.set(CACHE_KEYS.YT_ACCESS, expiresAt, responseJson.access_token);

      return [null, responseJson.access_token];
    } catch (error) {
      return [error, null];
    }
  },
};
