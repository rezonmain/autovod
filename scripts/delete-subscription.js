import { TwitchApi } from "../modules/twitch-api.js";
import { twitchAuth } from "../modules/twitch-auth.js";
import { empty } from "../utils/utils.js";
import { log } from "../modules/log.js";

const [, , subscriptionId] = process.argv;

if (empty(subscriptionId)) {
  log.error("No subscription ID provided");
  process.exit(1);
}

const [accessError, accessToken] = await twitchAuth.getAccessToken();

if (accessError) {
  log.error("Error getting Twitch access token", accessError);
  process.exit(1);
}

const twitchApi = new TwitchApi(accessToken);

const deleteError = await twitchApi.deleteSubscription(subscriptionId);

if (deleteError) {
  log.error("Error deleting subscription", deleteError);
  process.exit(1);
}

log.log("Subscription with id", subscriptionId, "deleted");
