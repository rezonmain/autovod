import express from "express";
import { rawBodyParser } from "../modules/raw-body-parser.js";
import { callbackGoogleService } from "../services/callback-google.service.js";

export const callbackGoogleController = express.Router();

callbackGoogleController.get("/auth", async (req, res) =>
  callbackGoogleService.handleAuthRedirect(req, res)
);

callbackGoogleController.put("/auth", rawBodyParser, async (req, res) =>
  callbackGoogleService.handleTokenPayload(req, res)
);
