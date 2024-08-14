import express from "express";
import { callbackTwitchController } from "./controllers/callback-twitch.controller.js";
import { pingController } from "./controllers/ping.controller.js";
import { empty } from "./utils.js";

const server = express();

server.use("/callback/twitch", callbackTwitchController);
server.use("/ping", pingController);

const port = process.env.LISTEN_PORT;

if (empty(port)) {
  console.error("LISTEN_PORT is not set");
  process.exit(1);
}

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
