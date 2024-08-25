import express from "express";
import { callbackGoogleController } from "../controllers/callback-google.controller.js";
import { ytAuth } from "../modules/yt-auth.js";
import { env } from "../utils/env.js";
import { ENV_KEYS } from "../const.js";
import { log } from "../modules/log.js";

const app = express();
app.use("/callback/google", callbackGoogleController);
const server = app.listen(env(ENV_KEYS.APPLICATION_PORT));

try {
  await ytAuth.promptUserForAuthorization();
  log.log("Authorization with google successful");
  server.close(() => process.exit(0));
} catch (error) {
  console.error("Authorization with google failed", error);
  process.exit(1);
}
