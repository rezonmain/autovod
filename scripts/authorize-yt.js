import express from "express";
import { callbackGoogleController } from "../controllers/callback-google.controller.js";
import { ytAuth } from "../modules/yt-auth.js";
import { env } from "../utils/env.js";
import { ENV_KEYS } from "../const.js";

const app = express();
app.use("/callback/google", callbackGoogleController);
const server = app.listen(env(ENV_KEYS.APPLICATION_PORT));

const [error] = await ytAuth.getAccessToken();
if (error) {
  console.error(`Authorization with google failed: ${error}`);
  server.close(() => process.exit(1));
}

console.log("Authorization with google successful");
server.close(() => process.exit(0));
