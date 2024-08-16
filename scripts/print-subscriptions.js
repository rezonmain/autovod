import { twitchAuth } from "../modules/twitch-auth.js";
import { TwitchApi } from "../modules/twitch-api.js";

const [accessError, accessToken] = await twitchAuth.getAccessToken();

if (accessError) {
  console.error("Error getting Twitch access token", accessError);
  process.exit(1);
}

const twitchApi = new TwitchApi(accessToken);

const [subsError, subscriptions] = await twitchApi.listFormattedSubscriptions();

if (subsError) {
  console.error("Error getting subscriptions", subsError);
  process.exit(1);
}

subscriptions.forEach((sub, index) => {
  console.log(
    `${index + 1}. ${sub.id} | ${sub.channel} | ${sub.eventsubType} | ${
      sub.status
    }`
  );
});
