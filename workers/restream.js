import { parentPort } from "node:worker_threads";
import { ffmpeg } from "../modules/ffmpeg.js";
import { twitchPlaylist } from "../modules/twitch-playlist.js";
import { twitchAuth } from "../modules/twitch-auth.js";
import { TwitchApi } from "../modules/twitch-api.js";
import { empty, nil } from "../utils/utils.js";

/**
 * @type {import("child_process").ChildProcess | null}
 */
let process = null;

/**
 * @param {string} login
 */
async function start(login) {
  console.log(
    `[${new Date().toISOString()}][RestreamWorker.start] Starting restream for ${login}`
  );
  const [accessError, access] = await twitchPlaylist.getPlaybackAccessToken(
    login
  );

  if (accessError) {
    console.error(
      `[${new Date().toISOString()}][RestreamWorker.start] Error getting access token`,
      accessError
    );
    return;
  }
  const playlistUrl = twitchPlaylist.buildM3u8Url(login, access);
  process = ffmpeg.restreamToTY(playlistUrl);
}

function stop() {
  if (nil(process) || process.killed) {
    console.log(
      `[${new Date().toISOString()}][RestreamWorker.stop] Tried to stop Restream but ffmpeg process is not running`
    );
    process = null;
    return;
  }
  console.log(
    `[${new Date().toISOString()}][RestreamWorker.stop] Stopping restream`
  );
  process.kill("SIGINT");
  process = null;
}

async function init() {
  console.log(
    `[${new Date().toISOString()}][RestreamWorker.init] Initializing worker...`
  );
  console.log(
    `[${new Date().toISOString()}][RestreamWorker.init] Checking for online streams...`
  );

  const [tokenError, token] = await twitchAuth.getAccessToken();
  if (tokenError) {
    console.error(
      `[${new Date().toISOString()}][RestreamWorker.init] Error getting access token`,
      tokenError
    );
    return;
  }

  const twitchApi = new TwitchApi(token);

  const [subsError, subs] = await twitchApi.listFormattedSubscriptions();

  if (subsError) {
    console.error(
      `[${new Date().toISOString()}][RestreamWorker.init] Error getting subscriptions`,
      subsError
    );
    return;
  }

  const streamLoginToCheck = subs.filter(
    (sub) => sub.eventsubType === "stream.online" && sub.status === "enabled"
  )[0];

  const [streamsError, onlineStreams] = await twitchApi.getStreams({
    user_login: streamLoginToCheck.login,
    first: 1,
    type: "live",
  });

  if (streamsError) {
    console.error(
      `[${new Date().toISOString()}][RestreamWorker.init] Error getting streams`,
      streamsError
    );
    return;
  }

  if (empty(onlineStreams)) {
    console.log(
      `[${new Date().toISOString()}][RestreamWorker.init] No online streams found`
    );
    return;
  }

  console.log(
    `[${new Date().toISOString()}][RestreamWorker.init] Found online stream for: ${
      onlineStreams[0].user_name
    }`
  );

  start(onlineStreams[0].user_name);
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
    case "INIT":
      init();
      break;
    default:
      console.log("Unknown command");
      break;
  }
});
