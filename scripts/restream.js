import express from "express";
import { ENV_KEYS } from "../const.js";
import { twitchPlaylist } from "../modules/twitch-playlist.js";
import { TwitchApi } from "../modules/twitch-api.js";
import { YoutubeStreamManager } from "../modules/youtube-stream-manager.js";
import { twitchAuth } from "../modules/twitch-auth.js";
import { env } from "../utils/env.js";
import { empty } from "../utils/utils.js";
import { callbackGoogleController } from "../controllers/callback-google.controller.js";

const [, , login] = process.argv;

if (empty(login)) {
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

const streamManager = YoutubeStreamManager.getInstance();
const initError = await streamManager.init();

if (initError) {
  console.error("Error initializing YoutubeStreamManager", initError);
  process.exit(1);
}

const [scheduleError, streamKey] = await streamManager.scheduleBroadcast(login);

if (scheduleError) {
  console.error(scheduleError);
  process.exit(1);
}

server.close();

const [playbackTokenError, playbackToken] =
  await twitchPlaylist.getPlaybackAccessToken(
    login,
    env(ENV_KEYS.TWITCH_PERSONAL_OAUTH_TOKEN)
  );

if (playbackTokenError) {
  console.error(playbackTokenError);
  process.exit(1);
}

const m3u8Url = twitchPlaylist.buildM3u8Url(login, playbackToken);

streamManager.restreamToYT(m3u8Url, streamKey, login);
