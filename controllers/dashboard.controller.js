import express from "express";
import { dashboardService } from "../services/dashboard.service.js";
import cookieParser from "cookie-parser";
import { withAuth } from "../middleware/withAuth.js";
import { rawBodyParser } from "../modules/raw-body-parser.js";

export const dashboardController = express.Router();

dashboardController.get("/", cookieParser(), withAuth, async (req, res) =>
  dashboardService.handleGetHome(req, res)
);

dashboardController.get("/auth", async (req, res) =>
  dashboardService.handleGetAuth(req, res)
);

dashboardController.get("/auth/callback", cookieParser(), async (req, res) =>
  dashboardService.handleAuthRedirect(req, res)
);

dashboardController.post(
  "/action/restream",
  cookieParser(),
  withAuth,
  rawBodyParser,
  async (req, res) => dashboardService.handlePostActionRestream(req, res)
);

dashboardController.post(
  "/action/stop-stream",
  cookieParser(),
  withAuth,
  rawBodyParser,
  async (req, res) => dashboardService.handlePostActionStopStream(req, res)
);
