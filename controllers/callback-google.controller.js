import express from "express";
import { callbackGoogleService } from "../services/callback-google.service.js";

export const callbackGoogleController = express.Router();

callbackGoogleController.get("/auth", async (req, res) =>
  callbackGoogleService.handleAuthRedirect(req, res)
);

callbackGoogleController.post("/eventsub", async (req, res) =>
  callbackGoogleService.handleEventSub(req, res)
);
