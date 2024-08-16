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

const subError = await twitchApi.subscribeToStreamOnlineEvents(143825043);

if (subError) {
  console.error(subError);
  process.exit(1);
}
