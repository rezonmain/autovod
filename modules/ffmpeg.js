import { spawn, exec as syncExec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { SCRIPTS } from "../const.js";
import { RingBuffer } from "./ring-buffer.js";
import { eventLog } from "./event-log.js";

const exec = promisify(syncExec);

const DIRNAME = process.cwd();
const SCRIPTS_PATH = path.resolve(DIRNAME, "scripts");

export const ffmpeg = {
  async printVersion() {
    const { stderr, stdout } = await exec("ffmpeg -version");
    if (stderr) {
      console.error(stderr);
      return;
    }
    console.log(stdout);
  },

  /**
   *
   * @param {Object} options
   * @param {string} options.sourceUrl
   * @param {string} options.destinationUrl
   * @param {(code: number) => Promise<void>} options.onExit
   * @returns
   */
  passthroughHLS: ({ sourceUrl, destinationUrl, onExit }) => {
    const logBuffer = new RingBuffer(20);

    const childProcess = spawn(
      path.join(SCRIPTS_PATH, SCRIPTS.PASSTHROUGH_HLS),
      [destinationUrl, sourceUrl]
    );

    childProcess.stdout.on("data", (data) => {
      logBuffer.push(`[${Date.now().toString()}] ${data.toString()}`);
    });

    childProcess.stderr.on("data", (data) => {
      logBuffer.push(`[${Date.now().toString()}] ${data.toString()}`);
    });

    // ffmpeg will exit when the source stream ends
    childProcess.on("exit", async (code) => {
      await onExit(code);

      eventLog.log("[ffmpeg] Exited", "debug", {
        code,
        logs: logBuffer.buffer,
      });
    });

    return childProcess;
  },
};
