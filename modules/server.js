import express from "express";
import { callbackTwitchController } from "../controllers/callback-twitch.controller.js";
import { pingController } from "../controllers/ping.controller.js";
import { empty } from "../utils.js";
import { env } from "../env.js";
import { ENV_KEYS } from "../const.js";

const expressServer = express();

expressServer.use("/ping", pingController);
expressServer.use("/callback/twitch", callbackTwitchController);

const port = env(ENV_KEYS.LISTEN_PORT);

if (empty(port)) {
  console.error("LISTEN_PORT is not set");
  process.exit(1);
}

function start() {
  expressServer.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

export const server = {
  start,
};
