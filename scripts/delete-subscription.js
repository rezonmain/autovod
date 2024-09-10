import { TwitchApi } from "../modules/twitch-api.js";
import { twitchAuth } from "../modules/twitch-auth.js";

const [, , subscriptionId] = process.argv;

if (!subscriptionId) {
  console.error("No subscription ID provided");
  process.exit(1);
}

const [accessError, accessToken] = await twitchAuth.getAccessToken();

if (accessError) {
  console.error("Error getting Twitch access token", accessError);
  process.exit(1);
}

const twitchApi = new TwitchApi(accessToken);

const deleteError = await twitchApi.deleteSubscription(subscriptionId);

if (deleteError) {
  console.error("Error deleting subscription", deleteError);
  process.exit(1);
}

console.log("Subscription with id", subscriptionId, "deleted");
