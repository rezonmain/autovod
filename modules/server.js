import express from "express";
import { callbackTwitchController } from "../controllers/callback-twitch.controller.js";
import { pingController } from "../controllers/ping.controller.js";
import { env } from "../utils/env.js";
import { ENV_KEYS } from "../const.js";
import { log } from "./log.js";

const expressServer = express();

expressServer.use("/ping", pingController);
expressServer.use("/callback/twitch", callbackTwitchController);

const port = env(ENV_KEYS.APPLICATION_PORT);
const domainBaseUrl = env(ENV_KEYS.DOMAIN_BASE_URL);

function start() {
  expressServer.listen(port, () => {
    log.log(`Server listening on ${domainBaseUrl}:${port}`);
  });
}

export const server = {
  start,
};
