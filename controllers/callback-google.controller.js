import express from "express";
import { callbackGoogleService } from "../services/callback-google.service.js";

export const callbackGoogleController = express.Router();

callbackGoogleController.get("/auth", async (req, res) =>
  callbackGoogleService.handleAuthRedirect(req, res)
);
