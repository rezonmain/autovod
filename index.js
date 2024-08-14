import express from "express";
import { callbackTwitchController } from "./controllers/callback-twitch.controller.js";
import { pingController } from "./controllers/ping.controller.js";

const server = express();

server.use("/callback/twitch", callbackTwitchController);
server.use("/ping", pingController);

server.listen(6666, () => {
  console.log("Server started on http://localhost:6666");
});
