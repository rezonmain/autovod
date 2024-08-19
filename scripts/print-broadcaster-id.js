import { twitchAuth } from "../modules/twitch-auth.js";
import { TwitchApi } from "../modules/twitch-api.js";
import { log } from "../modules/log.js";

const [, , ...channelNames] = process.argv;

const [accessError, accessToken] = await twitchAuth.getAccessToken();

if (accessError) {
  log.error("Error getting Twitch access token", accessError);
  process.exit(1);
}

const twitchApi = new TwitchApi(accessToken);

const [apiError, channel] = await twitchApi.getChannel(channelNames[0]);

if (apiError) {
  log.error("Error getting channel", apiError);
  process.exit(1);
}

log.log(channel.id);
