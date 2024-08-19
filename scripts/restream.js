import { ffmpeg } from "../modules/ffmpeg.js";
import { twitchPlaylist } from "../modules/twitch-playlist.js";
import { empty } from "../utils/utils.js";
import { log } from "../modules/log.js";

const [, , login] = process.argv;

if (empty(login)) {
  log.log("login not provided");
  log.error("Usage: SCRIPT <login>");
  process.exit(1);
}

const [accessError, accessToken] = await twitchPlaylist.getPlaybackAccessToken(
  login
);

if (accessError) {
  log.error(accessError);
  process.exit(1);
}

const m3u8Url = twitchPlaylist.buildM3u8Url(login, accessToken);

ffmpeg.restreamToTY(m3u8Url, true);
