import express from "express";
import { dashboardService } from "../services/dashboard.service.js";
import cookieParser from "cookie-parser";

export const dashboardController = express.Router();

dashboardController.get("/", async (req, res) =>
  dashboardService.handleGetHome(req, res)
);

dashboardController.get("/auth", async (req, res) =>
  dashboardService.handleGetAuth(req, res)
);

dashboardController.get("/auth/callback", cookieParser(), async (req, res) =>
  dashboardService.handleAuthRedirect(req, res)
);
