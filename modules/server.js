import express from "express";
import { callbackTwitchController } from "../controllers/callback-twitch.controller.js";
import { pingController } from "../controllers/ping.controller.js";
import { empty } from "../utils.js";

const expressServer = express();

expressServer.use("/ping", pingController);
expressServer.use("/callback/twitch", callbackTwitchController);

const port = process.env.LISTEN_PORT;

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
