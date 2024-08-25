import { server } from "./modules/server.js";
import { Telegram } from "./modules/telegram.js";
import { YTStreamManager } from "./modules/youtube-stream-manager.js";

server.start();
await YTStreamManager.getInstance().init();
await Telegram.getInstance().init();
