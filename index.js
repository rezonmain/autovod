import { server } from "./modules/server.js";
import { twitchAuth } from "./modules/twitch-auth.js";
import { twitchNotifier } from "./modules/twitch-notifier.js";

server.start();

const [tokenError, accessToken] = await twitchAuth.getAccessToken();

if (tokenError) {
  console.error("Error getting Twitch access token", tokenError);
  process.exit(1);
}

// rezonmain
const subscriptionError = await twitchNotifier.subscribeToStreamOnlineEvents(
  916663933,
  accessToken
);

if (subscriptionError) {
  console.error(subscriptionError);
  process.exit(1);
}
