import { twitchAuth } from "./modules/twitch-auth.js";

const [error, accessToken] = await twitchAuth.getAccessToken();

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(accessToken);
