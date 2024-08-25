import { server } from "./modules/server.js";
import { Telegram } from "./modules/telegram.js";
import { YTStreamManager } from "./modules/youtube-stream-manager.js";

server.start();
YTStreamManager.getInstance().init();
Telegram.getInstance().init();
