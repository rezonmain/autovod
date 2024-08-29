import express from "express";
import { dashboardService } from "../services/dashboard.service.js";
import cookieParser from "cookie-parser";
import { withAuth } from "../middleware/withAuth.js";

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

dashboardController.get(
  "/event-log",
  cookieParser(),
  withAuth,
  async (req, res) => dashboardService.handleGetEventLog(req, res)
);

dashboardController.get(
  "/restream",
  cookieParser(),
  withAuth,
  async (req, res) => dashboardService.handleGetRestream(req, res)
);

dashboardController.get(
  "/stop-stream",
  cookieParser(),
  withAuth,
  async (req, res) => dashboardService.handleStopStream(req, res)
);

dashboardController.get(
  "/active-streams",
  cookieParser(),
  withAuth,
  async (req, res) => {
    dashboardService.handleGetActiveStreams(req, res);
  }
);
