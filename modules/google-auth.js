import crypto from "node:crypto";
import { env } from "../utils/env.js";
import { YT_OAUTH_URL, ENV_KEYS } from "../const.js";

export const googleAuth = {
  /**
   * @param {string[]} scopes
   * @param {string} state
   * @returns {string}
   */
  buildAuthorizationURL(scopes, state) {
    const url = new URL(YT_OAUTH_URL);
    url.searchParams.append("client_id", env(ENV_KEYS.GOOGLE_AUTH_CLIENT_ID));
    url.searchParams.append(
      "redirect_uri",
      env(ENV_KEYS.GOOGLE_AUTH_REDIRECT_URI)
    );
    url.searchParams.append("scope", scopes.join(" "));
    url.searchParams.append("response_type", "token");
    url.searchParams.append("state", state);
    return url.toString();
  },

  generateStateToken() {
    return encodeURIComponent(
      crypto.createHash("sha256").update(crypto.randomBytes(8)).digest("hex")
    );
  },
};
