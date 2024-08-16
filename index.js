// import { server } from "./modules/server.js";
import { TwitchApi } from "./modules/twitch-api.js";
import { twitchAuth } from "./modules/twitch-auth.js";
// import { twitchNotifier } from "./modules/twitch-notifier.js";

// server.start();

const [tokenError, accessToken] = await twitchAuth.getAccessToken();

if (tokenError) {
  console.error("Error getting Twitch access token", tokenError);
  process.exit(1);
}

const twitchApi = new TwitchApi(accessToken);

const [subsError, subscriptions] = await twitchApi.listFormattedSubscriptions();

console.log(subscriptions);

if (subsError) {
  console.error("Error getting Twitch subscriptions", subsError);
  process.exit(1);
}
