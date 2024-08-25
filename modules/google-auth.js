import crypto from "node:crypto";
import { env } from "../utils/env.js";
import { YT_OAUTH_URL, ENV_KEYS } from "../const.js";

export const googleAuth = {
  /**
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

  generateStateToken() {
    return encodeURIComponent(
      crypto.createHash("sha256").update(crypto.randomBytes(8)).digest("hex")
    );
  },
};
