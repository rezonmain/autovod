import { Database } from "./database.js";
import { eventLog } from "./event-log.js";
import { server } from "./server.js";
import { Telegram } from "./telegram.js";
import { YTStreamManager } from "./youtube-stream-manager.js";

export const app = {
  init() {
    server.start();
    YTStreamManager.getInstance().init();
    Telegram.getInstance().init();
    Database.getInstance().init();
    eventLog.log("App initialized", "info");
  },
};
