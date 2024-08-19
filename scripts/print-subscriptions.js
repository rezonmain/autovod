import { twitchAuth } from "../modules/twitch-auth.js";
import { TwitchApi } from "../modules/twitch-api.js";
import { log } from "../modules/log.js";

const [accessError, accessToken] = await twitchAuth.getAccessToken();

if (accessError) {
  log.error("Error getting Twitch access token", accessError);
  process.exit(1);
}

const twitchApi = new TwitchApi(accessToken);

const [subsError, subscriptions] = await twitchApi.listFormattedSubscriptions();

if (subsError) {
  log.error("Error getting subscriptions", subsError);
  process.exit(1);
}

subscriptions.forEach((sub, index) => {
  log.log(
    `${index + 1}. ${sub.id} | ${sub.channel} | ${sub.eventsubType} | ${
      sub.status
    }`
  );
});
