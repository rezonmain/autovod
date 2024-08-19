import { twitchAuth } from "../modules/twitch-auth.js";
import { TwitchApi } from "../modules/twitch-api.js";

const [, , ...channelNames] = process.argv;

const [accessError, accessToken] = await twitchAuth.getAccessToken();

if (accessError) {
  console.error("Error getting Twitch access token", accessError);
  process.exit(1);
}

const twitchApi = new TwitchApi(accessToken);

const [apiError, channel] = await twitchApi.getChannel(channelNames[0]);

if (apiError) {
  console.error("Error getting channel", apiError);
  process.exit(1);
}

console.log(channel.id);
