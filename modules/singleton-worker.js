import { Worker } from "node:worker_threads";
import path from "node:path";

const DIRNAME = process.cwd();
const WORKER_SCRIPT_PATH = path.resolve(DIRNAME, "workers");

class SingletonRestreamWorker {
  worker = null;
  /**
   * @param {string} path
   * @param {any} initialData
   */
  constructor(path, initialData) {
    this.worker = new Worker(path, { workerData: initialData });
  }
}

export const restreamWorker = new SingletonRestreamWorker(
  WORKER_SCRIPT_PATH,
  null
);
