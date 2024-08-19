import { TwitchApi } from "../modules/twitch-api.js";
import { twitchAuth } from "../modules/twitch-auth.js";
import { empty } from "../utils/utils.js";

const SUPPORTED = ["stream.online", "stream.offline"];
const printUsage = () =>
  console.log("Usage: SCRIPT <subscriptionType> <channelId>");

const [, , subscriptionType, channelId] = process.argv;

if (SUPPORTED.indexOf(subscriptionType) === -1) {
  console.error("Subscription type must be one of", SUPPORTED.join(", "));
  printUsage();
  process.exit(1);
}

if (empty(channelId)) {
  console.error("No channel ID provided");
  printUsage();
  process.exit(1);
}

const [accessError, accessToken] = await twitchAuth.getAccessToken();

if (accessError) {
  console.error("Error getting Twitch access token", accessError);
  process.exit(1);
}

const twitchApi = new TwitchApi(accessToken);

switch (subscriptionType) {
  case "stream.online": {
    const onlineError = await twitchApi.subscribeToStreamOnlineEvents(
      channelId
    );
    if (onlineError) {
      console.error("Error creating stream.online subscription", onlineError);
      process.exit(1);
    }
    break;
  }
  case "stream.offline": {
    const offlineError = await twitchApi.subscribeToStreamOfflineEvents(
      channelId
    );
    if (offlineError) {
      console.error("Error creating stream.offline subscription", offlineError);
      process.exit(1);
    }
    break;
  }
  default:
    console.error("Unsupported subscription type", subscriptionType);
    process.exit(1);
}
