import express from "express";
import { callbackTwitchService } from "../services/callback-twitch.services.js";
import { rawBodyParser } from "../modules/raw-body-parser.js";

export const callbackTwitchController = express.Router();

callbackTwitchController.post("/eventsub", rawBodyParser, async (req, res) =>
  callbackTwitchService.handleEventSub(req, res)
);
