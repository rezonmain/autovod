import { spawn, exec as syncExec } from "node:child_process";
import { promisify, format } from "node:util";
import { env } from "../utils/env.js";
import { ENV_KEYS, YT_HLS_INGEST_URL } from "../const.js";
import { log } from "./log.js";

const exec = promisify(syncExec);

export const ffmpeg = {
  async printVersion() {
    const { stderr, stdout } = await exec("ffmpeg -version");
    if (stderr) {
      log.error(stderr);
      return;
    }
    log.log(stdout);
  },

  restreamToTY: (
    m3u8PlaylistUrl,
    log = false,
    ytStreamKey = env(ENV_KEYS.YT_STREAM_KEY)
  ) => {
    const ingestUrl = format(YT_HLS_INGEST_URL, ytStreamKey);
    const child = spawn("./scripts/restream.sh", [ingestUrl, m3u8PlaylistUrl], {
      shell: true,
    });

    if (log) {
      child.stdout.on("data", (data) => {
        log.log(data.toString());
      });

      child.stderr.on("data", (data) => {
        log.error(data.toString());
      });
    }

    return child;
  },
};
