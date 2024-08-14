import express from "express";
import { callbackTwitchService } from "../services/callback-twitch.services.js";

export const callbackTwitchController = express.Router();

callbackTwitchController.post("/eventsub", async (req, res) =>
  callbackTwitchService.handleEventSub(req, res)
);
