/** @import { ChildProcess } from 'node:child_process' */
import { ffmpeg } from "./ffmpeg.js";
import { twitchAuth } from "./twitch-auth.js";
import { TwitchApi } from "./twitch-api.js";
import { empty, nil } from "../utils/utils.js";

export class Restreamer {
  /**
   * @type {ChildProcess}
   */
  process = null;

  /**
   * @type Restreamer
   */
  _instance = null;

  /**
   * The m3u8 playlist url to restream
   * @type {string}
   */
  _m3u8url = "";

  /**
   * @param {string} m3u8PlaylistUrl
   */
  constructor(m3u8PlaylistUrl) {
    this._m3u8url = m3u8PlaylistUrl;
  }

  /**
   *
   * @param {string} m3u8PlaylistUrl
   * @returns {Restreamer}
   */
  static getInstance(m3u8PlaylistUrl) {
    if (nil(this._instance)) {
      this._instance = new Restreamer(m3u8PlaylistUrl);
    }
    return this._instance;
  }

  async start() {
    this.process = ffmpeg.restreamToTY(this._m3u8url);
  }

  stop() {
    if (nil(this.process) || this.process.killed) {
      console.log(
        `[${new Date().toISOString()}][RestreamWorker.stop] Tried to stop Restream but ffmpeg process is not running`
      );
      this.process = null;
      return;
    }
    console.log(
      `[${new Date().toISOString()}][RestreamWorker.stop] Stopping restream`
    );
    this.process.kill("SIGINT");
    this.process = null;
  }

  async init() {
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

    this.start();
  }
}
