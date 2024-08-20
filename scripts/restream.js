import { ENV_KEYS } from "../const.js";
import { ffmpeg } from "../modules/ffmpeg.js";
import { twitchPlaylist } from "../modules/twitch-playlist.js";
import { env } from "../utils/env.js";
import { empty } from "../utils/utils.js";

const [, , login] = process.argv;

if (empty(login)) {
  console.log("login not provided");
  console.error("Usage: SCRIPT <login>");
  process.exit(1);
}

const [accessError, accessToken] = await twitchPlaylist.getPlaybackAccessToken(
  login,
  env(ENV_KEYS.TWITCH_PERSONAL_OAUTH_TOKEN)
);

if (accessError) {
  console.error(accessError);
  process.exit(1);
}

const m3u8Url = twitchPlaylist.buildM3u8Url(login, accessToken);

ffmpeg.restreamToTY(m3u8Url, true);
