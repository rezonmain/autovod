/** @import { ChildProcess } from 'node:child_process' */
import { ffmpeg } from "./ffmpeg.js";
import { twitchAuth } from "./twitch-auth.js";
import { twitchPlaylist } from "./twitch-playlist.js";
import { TwitchApi } from "./twitch-api.js";
import { empty, nil } from "../utils/utils.js";
import { log } from "./log.js";
import { env } from "../utils/env.js";
import { ENV_KEYS } from "../const.js";

export class Restreamer {
  /**
   * @type {ChildProcess}
   */
  process = null;

  /**
   * @type Restreamer
   */
  _instance = null;

  constructor() {}

  static getInstance() {
    if (nil(this._instance)) {
      this._instance = new Restreamer();
    }
    return this._instance;
  }

  /**
   * @param {string} login
   */
  static async getM3u8UrlFromLogin(login) {
    const [accessError, access] = await twitchPlaylist.getPlaybackAccessToken(
      login,
      env(ENV_KEYS.TWITCH_PERSONAL_OAUTH_TOKEN)
    );

    if (accessError) {
      log.error(
        `[Restreamer.getM3u8UrlFromLogin] Error getting access token`,
        accessError
      );
      return;
    }
    return twitchPlaylist.buildM3u8Url(login, access);
  }

  /**
   *
   * @param {string} m3u8PlaylistUrl
   * @returns {Restreamer}
   */
  async start(m3u8PlaylistUrl) {
    if (nil(this.process) || !this.process.killed) {
      log.log(
        `[Restreamer.start] Tried to start Restream but ffmpeg process is already running, killing it`
      );
      this.stop();
    }
    log.log(`[Restreamer.start] Starting restream`);

    // process should exit gracefully when input stops sending data
    this.process = ffmpeg.restreamToTY(m3u8PlaylistUrl, true);

    this.process.on("exit", (code) => {
      log.log(
        `[Restreamer.start] Restream process automatically exited with code ${code}`
      );
      this.process = null;
    });
  }

  stop() {
    if (nil(this.process) || this.process.killed) {
      log.log(
        `[Restreamer.stop] Tried to stop Restream but ffmpeg process is not running`
      );
      this.process = null;
      return;
    }
    log.log(`[Restreamer.stop] Stopping restream`);
    this.process.kill("SIGINT");
    this.process = null;
  }

  async init() {
    log.log(`[Restreamer.init] Checking for online streams...`);

    const [tokenError, token] = await twitchAuth.getAccessToken();
    if (tokenError) {
      log.error(`[Restreamer.init] Error getting access token`, tokenError);
      return;
    }

    const twitchApi = new TwitchApi(token);

    const [subsError, subs] = await twitchApi.listFormattedSubscriptions();

    if (subsError) {
      log.error(`[Restreamer.init] Error getting subscriptions`, subsError);
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
      log.error(`[Restreamer.init] Error getting streams`, streamsError);
      return;
    }

    if (empty(onlineStreams)) {
      log.log(`[Restreamer.init] No online streams found`);
      return;
    }

    log.log(
      `[Restreamer.init] Found online stream for: ${onlineStreams[0].user_name}`
    );

    const m3u8PlaylistUrl = await Restreamer.getM3u8UrlFromLogin(
      onlineStreams[0].user_name
    );

    this.start(m3u8PlaylistUrl);
  }
}
