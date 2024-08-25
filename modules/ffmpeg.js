import { spawn, exec as syncExec } from "node:child_process";
import { promisify, format } from "node:util";
import { YT_HLS_INGEST_URL } from "../const.js";
import { log } from "./log.js";

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
   * @param {string} options.m3u8PlaylistUrl
   * @param {string} options.ytStreamKey
   * @param {string} options.login
   * @param {() => void} options.onExit
   * @param {boolean} shouldLog
   * @returns
   */
  restreamToYT: (
    { m3u8PlaylistUrl, ytStreamKey, onExit, login },
    shouldLog = false
  ) => {
    const ingestUrl = format(YT_HLS_INGEST_URL, ytStreamKey);
    log.info(
      `[ffmpeg.restreamToYT] Restreaming to youtube for login ${login} with stream key: ${ytStreamKey}`
    );
    const child = spawn("./scripts/restream.sh", [ingestUrl, m3u8PlaylistUrl]);

    if (shouldLog) {
      child.stdout.on("data", (data) => {
        console.log(data.toString());
      });

      child.stderr.on("data", (data) => {
        console.error(data.toString());
      });
    }

    // ffmpeg will exit when the stream ends
    child.on("exit", (code) => {
      log.info(
        `[ffmpeg.restreamToYT] Restream for login ${login} exited with code ${code}`
      );
      onExit();
    });

    return child;
  },
};
