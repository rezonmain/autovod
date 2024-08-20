import { twitchPlaylist } from "./modules/twitch-playlist.js";
import { env } from "./utils/env.js";
import { ENV_KEYS } from "./const.js";

// Restreamer.getInstance().init();
// server.start();

const [tokenError, token] = await twitchPlaylist.getPlaybackAccessToken(
  "h3h3productions",
  env(ENV_KEYS.TWITCH_PERSONAL_OAUTH_TOKEN)
);

if (tokenError) {
  console.error(tokenError);
  process.exit(1);
}

const url = twitchPlaylist.buildM3u8Url("h3h3productions", token);

console.log(url);
