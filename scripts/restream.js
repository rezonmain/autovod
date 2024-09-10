import express from "express";
import { ENV_KEYS } from "../const.js";
import { TwitchApi } from "../modules/twitch-api.js";
import { YTStreamManager } from "../modules/youtube-stream-manager.js";
import { twitchAuth } from "../modules/twitch-auth.js";
import { env } from "../utils/env.js";
import { callbackGoogleController } from "../controllers/callback-google.controller.js";

const [, , login] = process.argv;

if (!login) {
  console.log("login not provided");
  console.error("Usage: SCRIPT <login> <streamKey>");
  process.exit(1);
}

const [twitchAccessTokenError, twitchAccessToken] =
  await twitchAuth.getAccessToken();

if (twitchAccessTokenError) {
  console.error(twitchAccessTokenError);
  process.exit(1);
}

const twitchApi = new TwitchApi(twitchAccessToken);

const [channelError, channel] = await twitchApi.getChannel(login);

if (channelError) {
  console.error(channelError);
  process.exit(1);
}

if (!channel.isLive) {
  console.log("Channel is not live");
  process.exit(1);
}

const app = express();
app.use("/callback/google", callbackGoogleController);

// boot up server to listen for the google auth redirect
const server = app.listen(env(ENV_KEYS.APPLICATION_PORT));

const streamManager = YTStreamManager.getInstance();
const initError = await streamManager.init();

if (initError) {
  console.error("Error initializing YoutubeStreamManager", initError);
  process.exit(1);
}

const [scheduleError, scheduleBroadcast] =
  await streamManager.scheduleBroadcast(login);

if (scheduleError) {
  console.error(scheduleError);
  process.exit(1);
}

server.close();

const childProcess = await streamManager.restreamToYT(
  scheduleBroadcast.stream,
  login
);

if (childProcess instanceof Error) {
  console.error(childProcess);
  process.exit(1);
}

// TODO: allow for graceful shutdown
process.once("SIGINT", () => {
  childProcess.kill("SIGINT");
});
