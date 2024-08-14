import { server } from "./modules/server.js";
import { twitchAuth } from "./modules/twitch-auth.js";

server.start();

const [error, accessToken] = await twitchAuth.getAccessToken();

if (error) {
  console.error("Error getting Twitch access token", error);
  process.exit(1);
}

console.log("Twitch access token", accessToken);
