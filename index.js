// import { SECRETS } from "./const.js";
// import { server } from "./modules/server.js";
import "./modules/singleton-restream-worker.js";
import { ytAuth } from "./modules/yt-auth.js";
// import { readPrivateKey } from "./utils/secrets.js";

// server.start();

const [error, key] = await ytAuth.getAccessToken();

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(key);
