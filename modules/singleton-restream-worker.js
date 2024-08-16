import { Worker } from "node:worker_threads";
import path from "node:path";

const DIRNAME = process.cwd();
const WORKER_SCRIPT_PATH = path.resolve(DIRNAME, "workers/restream.js");

class SingletonRestreamWorker {
  /**
   * @type {Worker}
   */
  worker = null;
  isStreaming = false;
  /**
   * @param {string} path
   * @param {any} initialData
   */
  constructor(path, initialData) {
    this.worker = new Worker(path, { workerData: initialData });
    this.#registerEvents();
  }

  #registerEvents() {
    this.worker.on("message", (data) => {
      console.log(data);
    });

    this.worker.on("error", (error) => {
      console.error(error);
    });

    this.worker.on("exit", (code) => {
      console.log(`Worker stopped with exit code ${code}`);
    });
  }
}

export const restreamWorker = new SingletonRestreamWorker(
  WORKER_SCRIPT_PATH,
  null
);
