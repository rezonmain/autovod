import { Worker } from "node:worker_threads";
import path from "node:path";
import { log } from "./log.js";

const DIRNAME = process.cwd();
const WORKER_SCRIPT_PATH = path.resolve(DIRNAME, "workers/restream.js");

export class SingletonRestreamWorker {
  /**
   * @type {SingletonRestreamWorker}
   */
  static _instance;

  /**
   * @type {Worker}
   */
  worker = null;
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
      log.log(data);
    });

    this.worker.on("error", (error) => {
      log.error(error);
    });

    this.worker.on("exit", (code) => {
      log.log(`Worker stopped with exit code ${code}`);
    });
  }

  init() {
    this.worker.postMessage("INIT");
  }

  static getInstance() {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new SingletonRestreamWorker(WORKER_SCRIPT_PATH, null);
    return this._instance;
  }
}
