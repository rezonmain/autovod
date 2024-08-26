import express from "express";
import { log } from "../modules/log.js";
import { getDateForSteamTitle } from "../utils/dates.js";

export const pingController = express.Router();

pingController.get("/", (_, res) => {
  const date = getDateForSteamTitle();
  res.send(date);
  log.log(`[pingController] ${date}`);
});
