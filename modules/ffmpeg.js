import { spawn, exec as syncExec } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(syncExec);

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
   * @param {(code: number) => void} options.onExit
   * @param {boolean} shouldLog
   * @returns
   */
  passthroughHLS: (
    { sourceUrl, destinationUrl, onExit },
    shouldLog = false
  ) => {
    const childProcess = spawn("./scripts/restream.sh", [
      destinationUrl,
      sourceUrl,
    ]);

    if (shouldLog) {
      childProcess.stdout.on("data", (data) => {
        console.log(data.toString());
      });

      childProcess.stderr.on("data", (data) => {
        console.error(data.toString());
      });
    }

    // ffmpeg will exit when the source stream ends
    childProcess.on("exit", (code) => {
      onExit(code);
    });

    return childProcess;
  },
};
