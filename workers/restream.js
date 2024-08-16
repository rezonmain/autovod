import { parentPort } from "node:worker_threads";
import { ffmpeg } from "../modules/ffmpeg.js";
import { twitchPlaylist } from "../modules/twitch-playlist.js";
import { nil } from "../utils.js";

/**
 * @type {import("child_process").ChildProcess | null}
 */
let process = null;

/**
 * @param {string} login
 */
async function start(login) {
  console.log(
    `[${new Date().toISOString()}][RestreamWorker] Starting restream for ${login}`
  );
  const [accessError, access] = await twitchPlaylist.getPlaybackAccessToken(
    login
  );

  if (accessError) {
    console.error(
      `[${new Date().toISOString()}][RestreamWorker] Error getting access token`,
      accessError
    );
    return;
  }
  const playlistUrl = twitchPlaylist.buildM3u8Url(login, access);
  process = ffmpeg.restreamToTY(playlistUrl, true);
}

function stop() {
  if (nil(process) || process.killed) {
    console.log(
      `[${new Date().toISOString()}][RestreamWorker] Restream ffmpeg process is not running`
    );
    process = null;
    return;
  }
  console.log(
    `[${new Date().toISOString()}][RestreamWorker] Stopping restream`
  );
  const killed = process.kill("SIGINT");

  if (!killed) {
    console.error(
      `[${new Date().toISOString()}][RestreamWorker] Error killing restream process`
    );
  }
  process = null;
}

parentPort.on("message", (data) => {
  const [type, payload] = data.split(":");

  switch (type) {
    case "START":
      start(payload);
      break;
    case "STOP":
      stop();
      break;
    default:
      console.log("Unknown command");
      break;
  }
});
