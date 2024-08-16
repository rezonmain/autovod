import { spawn, exec as syncExec } from "node:child_process";
import { promisify, format } from "node:util";
import { env } from "../env.js";
import { ENV_KEYS, YT_HLS_INGEST_URL } from "../const.js";

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

  restreamToTY: (
    m3u8PlaylistUrl,
    log = false,
    ytStreamKey = env(ENV_KEYS.YT_STREAM_KEY)
  ) => {
    const ingestUrl = format(YT_HLS_INGEST_URL, ytStreamKey);
    const child = spawn(
      "ffmpeg",
      [
        "-re", // real-time
        "-i", // input
        `"${m3u8PlaylistUrl}"`, // input url
        "-f",
        "hls",
        `"${ingestUrl}"`,
      ],
      { shell: true }
    );

    if (log) {
      child.stdout.on("data", (data) => {
        console.log(data.toString());
      });

      child.stderr.on("data", (data) => {
        console.error(data.toString());
      });
    }

    return child;
  },
};
