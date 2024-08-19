import { server } from "./modules/server.js";
import { SingletonRestreamWorker } from "./modules/singleton-restream-worker.js";

SingletonRestreamWorker.getInstance().init();
server.start();
