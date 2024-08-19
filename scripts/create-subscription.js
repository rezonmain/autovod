import { TwitchApi } from "../modules/twitch-api.js";
import { twitchAuth } from "../modules/twitch-auth.js";
import { empty } from "../utils/utils.js";
import { log } from "../modules/log.js";

const SUPPORTED = ["stream.online", "stream.offline"];
const printUsage = () =>
  log.log("Usage: SCRIPT <subscriptionType> <channelId>");

const [, , subscriptionType, channelId] = process.argv;

if (SUPPORTED.indexOf(subscriptionType) === -1) {
  log.error("Subscription type must be one of", SUPPORTED.join(", "));
  printUsage();
  process.exit(1);
}

if (empty(channelId)) {
  log.error("No channel ID provided");
  printUsage();
  process.exit(1);
}

const [accessError, accessToken] = await twitchAuth.getAccessToken();

if (accessError) {
  log.error("Error getting Twitch access token", accessError);
  process.exit(1);
}

const twitchApi = new TwitchApi(accessToken);

switch (subscriptionType) {
  case "stream.online": {
    const onlineError = await twitchApi.subscribeToStreamOnlineEvents(
      channelId
    );
    if (onlineError) {
      log.error("Error creating stream.online subscription", onlineError);
      process.exit(1);
    }
    break;
  }
  case "stream.offline": {
    const offlineError = await twitchApi.subscribeToStreamOfflineEvents(
      channelId
    );
    if (offlineError) {
      log.error("Error creating stream.offline subscription", offlineError);
      process.exit(1);
    }
    break;
  }
  default:
    log.error("Unsupported subscription type", subscriptionType);
    process.exit(1);
}
