/** @import { Request as ExpressRequest, Response as ExpressResponse} from "express" */
import { googleAuth } from "../modules/google-auth.js";
import jwt from "jsonwebtoken";
import {
  APP_COOKIES,
  ENV_KEYS,
  TEMPLATES,
  YT_ACCESS_TOKEN_URL,
} from "../const.js";
import { eventLog } from "../modules/event-log.js";
import { log } from "../modules/log.js";
import { empty } from "../utils/utils.js";
import { env } from "../utils/env.js";
import { eventsRepository } from "../repositories/events.repository.js";
import { YTStreamManager } from "../modules/youtube-stream-manager.js";
import { ytApi } from "../modules/yt-api.js";
import { ytAuth } from "../modules/yt-auth.js";

export const dashboardService = {
  /**
   * @param {ExpressRequest} req
   * @param {ExpressResponse} res
   */
  async handleGetHome(req, res) {
    const { k: action, eventsPage = 0 } = req.query;

    try {
      switch (action) {
        case "event-logs": {
          const {
            page,
            total,
            data: events,
          } = eventsRepository.getPaginatedEvents(5, parseInt(eventsPage));

          const lastPage = Math.ceil(total / 5);
          const nextPage = page < lastPage ? page + 1 : lastPage;
          const previousPage = page > 1 ? page - 1 : 1;

          return res.render(TEMPLATES.DASHBOARD_EVENT_LOG, {
            layout: false,
            events: events.map((event) => ({
              ...event,
              metadata: JSON.stringify(JSON.parse(event.metadata), null, 2),
            })),
            page,
            lastPage,
            nextPage,
            previousPage,
          });
        }
        case "restream": {
          const streamManager = YTStreamManager.getInstance();
          const availableStreams = streamManager.streams.difference(
            streamManager.scheduledBroadcasts
          );
          return res.render(TEMPLATES.DASHBOARD_RESTREAM, {
            layout: false,
            availableStreams: availableStreams.size,
          });
        }
        case "stop-stream": {
          const streamManager = YTStreamManager.getInstance();
          const logins = streamManager.logins;
          return res.render(TEMPLATES.DASHBOARD_STOP_STREAM, {
            layout: false,
            logins: logins.keys(),
          });
        }
        case "active-streams": {
          const [accessError, accessToken] = await ytAuth.getAccessToken();
          if (accessError) {
            return res.sendStatus(500);
          }

          const [broadcastError, broadcasts] = await ytApi.listBroadcasts(
            accessToken,
            {
              part: ["snippet", "id"],
              broadcastStatus: "active",
            }
          );
          if (broadcastError) {
            return res.sendStatus(500);
          }

          return res.render(TEMPLATES.DASHBOARD_ACTIVE_BROADCASTS, {
            layout: false,
            broadcasts,
          });
        }
        default:
          return res.render(TEMPLATES.DASHBOARD_HOME);
      }
    } catch (error) {
      log.error(`[dashboardService.handleGetHome] Error: ${error}`);
      return res.sendStatus(500);
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

    res.render(TEMPLATES.SIGN_IN, { googleAuthUrl: clientAuthUrl });
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
        eventLog.log(
          "[dashboardService.handleAuthRedirect] Failed to exchange authorization code for tokens",
          "error",
          {
            responseJson: JSON.stringify(json),
            responseCode: response.status,
            responseText: response.statusText,
            queryParams: url.searchParams.toString(),
          }
        );
        throw new Error(json);
      }

      const { id_token, expires_in } = await response.json();

      if (!googleAuth.verifyToken(id_token)) {
        log.error(`[dashboardService.handleAuthRedirect] Invalid token`);
        return res.sendStatus(401);
      }

      const payload = jwt.decode(id_token);

      if (empty(payload.email)) {
        return res.sendStatus(401);
      }

      // Only allow the email specified in the .env file
      if (payload.email !== env(ENV_KEYS.GOOGLE_AUTH_HINT)) {
        return res.sendStatus(401);
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

  /**
   * @param {ExpressRequest} req
   * @param {ExpressResponse} res
   */
  async handlePostActionRestream(req, res) {
    const body = new URLSearchParams(req.rawBody);

    if (!body.has("login")) {
      return res.sendStatus(400);
    }

    const login = body.get("login");

    const streamManager = YTStreamManager.getInstance();

    if (streamManager.logins.has(login)) {
      return res.sendStatus(409);
    }

    const [error, scheduled] = await streamManager.scheduleBroadcast(login);
    if (error) {
      log.error(
        "[dashboardService.handlePostActionRestream] Error scheduling broadcast",
        error
      );
      return res.sendStatus(500);
    }

    streamManager.restreamToYT(scheduled.stream, login);
    res.sendStatus(200);
  },

  /**
   * @param {ExpressRequest} req
   * @param {ExpressResponse} res
   */
  handlePostActionStopStream(req, res) {
    const body = new URLSearchParams(req.rawBody);

    if (!body.has("login")) {
      return res.sendStatus(400);
    }

    const login = body.get("login");

    const streamManager = YTStreamManager.getInstance();

    if (!streamManager.logins.has(login)) {
      return res.sendStatus(404);
    }

    const error = streamManager.stopStream(login);
    if (error) {
      log.error(
        "[dashboardService.handlePostActionStopStream] Error stopping stream",
        error
      );
      return res.sendStatus(500);
    }

    res.sendStatus(200);
  },
};
