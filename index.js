import { server } from "./modules/server.js";
import { Restreamer } from "./modules/restreamer.js";

Restreamer.getInstance().init();
server.start();
