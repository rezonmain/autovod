import express from "express";
import { callbackGoogleService } from "../services/callback-google.service.js";

export const callbackGoogleController = express.Router();

callbackGoogleController.get("/auth", async (req, res) =>
  callbackGoogleService.handleAuthRedirect(req, res)
);

// https://www.w3.org/TR/websub/#subscriber-sends-subscription-request
callbackGoogleController.get("/eventsub", async (req, res) =>
  callbackGoogleService.handleGetEventSubVerification(req, res)
);

callbackGoogleController.post("/eventsub", async (req, res) =>
  callbackGoogleService.handleEventSub(req, res)
);
