/** @import { Request as ExpressRequest, Response as ExpressResponse} from "express" */
import { googleAuth } from "../modules/google-auth.js";
import jwt from "jsonwebtoken";
import { APP_COOKIES, ENV_KEYS, YT_ACCESS_TOKEN_URL } from "../const.js";
import { Database } from "../modules/database.js";
import { log } from "../modules/log.js";
import { empty } from "../utils/utils.js";
import { env } from "../utils/env.js";

export const dashboardService = {
  /**
   * @param {ExpressRequest} req
   * @param {ExpressResponse} res
   */
  handleGetHome(req, res) {
    try {
      const db = Database.getInstance();

      const query = db.prepare("SELECT * FROM events");
      const rows = query.all();
      res.send(`
        <html>
          <head>
            <title>autovod | events</title>
          </head>
          <body style='width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif;'>
            <h1>Events</h1>
            <ul>
              ${rows.map((row) => `<li>${row.title}</li>`).join("")}
            </ul>
          </body>
        </html>
        `);
    } catch (error) {
      log.error(`[dashboardService.handleGetHome] Error: ${error}`);
      res.sendStatus(500);
    }
  },

  /**
   * @param {ExpressRequest} req
   * @param {ExpressResponse} res
   */
  async handleGetAuth(req, res) {
    const authToken = req.cookies?.[APP_COOKIES.CLIENT_AUTH_TOKEN] ?? "";

    if (await googleAuth.verifyToken(authToken)) {
      return res.redirect("/dashboard");
    }

    const state = googleAuth.generateStateToken();
    const clientAuthUrl = googleAuth.buildClientAuthorizationURL(state);

    res.cookie(APP_COOKIES.CLIENT_AUTH_STATE, state, {
      httpOnly: true,
      maxAge: 1000 * 60 * 5, // 5 minutes,
    });

    res.send(`
      <html>
        <head>
          <title>autovod | login</title>
        </head>
        <body style='width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif;'>
          <p>sign in with google</p>
          <a href=${clientAuthUrl}>sign in</a>
        </body>
      </html>
      `);
  },

  /**
   * @param {ExpressRequest} req
   * @param {ExpressResponse} res
   */
  async handleAuthRedirect(req, res) {
    const { code, state, error = "" } = req.query;

    if (!empty(error)) {
      log.error(
        `[dashboardService.handleAuthRedirect] Google OAuth error: ${error}`
      );
      return res.send("Google OAuth error").status(204);
    }

    if (empty(state)) {
      log.error(
        "[dashboardService.handleAuthRedirect] Missing state in query parameters"
      );
      return res.sendStatus(401);
    }

    if (state !== req.cookies[APP_COOKIES.CLIENT_AUTH_STATE]) {
      log.error("[dashboardService.handleAuthRedirect] State mismatch");
      return res.sendStatus(401);
    }

    const url = new URL(YT_ACCESS_TOKEN_URL);
    url.searchParams.append("code", code);
    url.searchParams.append("client_id", env(ENV_KEYS.GOOGLE_CLIENT_ID));
    url.searchParams.append("client_secret", env(ENV_KEYS.GOOGLE_SECRET));
    url.searchParams.append(
      "redirect_uri",
      env(ENV_KEYS.GOOGLE_CLIENT_REDIRECT_URI)
    );
    url.searchParams.append("grant_type", "authorization_code");

    try {
      const response = await fetch(url.toString(), {
        method: "POST",
        "Content-Type": "application/x-www-form-urlencoded",
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json);
      }

      const { id_token, expires_in } = await response.json();

      if (!googleAuth.verifyToken(id_token)) {
        log.error(`[dashboardService.handleAuthRedirect] Invalid token`);
        return res.send(401);
      }

      const payload = jwt.decode(id_token);

      if (empty(payload.email)) {
        return res.send(401);
      }

      // Only allow the email specified in the .env file
      if (payload.email !== env(ENV_KEYS.GOOGLE_AUTH_HINT)) {
        return res.send(401);
      }

      res.clearCookie(APP_COOKIES.CLIENT_AUTH_STATE);
      res.cookie(APP_COOKIES.CLIENT_AUTH_TOKEN, id_token, {
        httpOnly: true,
        maxAge: expires_in * 1000,
      });

      res.redirect("/dashboard");
    } catch (error) {
      log.error(
        `[dashboardService.handleAuthRedirect] Error getting access token: ${error}`
      );
      res.sendStatus(500);
    }
  },
};
