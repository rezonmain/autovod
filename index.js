import { server } from "./modules/server.js";
import { ytAuth } from "./modules/yt-auth.js";

server.start();
ytAuth.authorize();
