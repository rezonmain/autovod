import { format } from "node:util";
import { BROADCAST_DEFAULT_BODY } from "../const.js";
import { ffmpeg } from "./ffmpeg.js";
import { nil } from "../utils/utils.js";
import { ytApi } from "./yt-api.js";
import { ytAuth } from "./yt-auth.js";
import { getDateForSteamTitle } from "../utils/dates.js";
import { log } from "./log.js";

const SEPARATOR = "";

export class YoutubeStreamManager {
  /**
   * @type {Set<string>} - streamIdstreamKey
   */
  streams;

  /**
   * @type {Map<string, string>} - streamIdstreamKey -> broadcastId
   */
  scheduledBroadcasts;

  /**
   * @type {Set<string>} - twitch logins we are currently streaming to youtube
   */
  logins;

  /**
   * @type {YoutubeStreamManager}
   */
  _instance = null;

  constructor() {
    this.streams = new Set();
    this.scheduledBroadcasts = new Map();
    this.logins = new Set();
  }

  /**
   *
   * @returns {YoutubeStreamManager}
   */
  static getInstance() {
    if (nil(this._instance)) {
      this._instance = new YoutubeStreamManager();
    }
    return this._instance;
  }

  /**
   *
   * @returns {Promise<Error | void>}
   */
  async init() {
    await this.loadAvailableStreams();
  }

  /**
   *
   * @returns {Promise<void>}
   */
  async loadAvailableStreams() {
    const [accessError, accessToken] = await ytAuth.getAccessToken();
    if (accessError) {
      return accessError;
    }

    const [streamsError, streams] = await ytApi.getStreams(accessToken, {
      part: ["snippet", "cdn", "status"],
      mine: true,
    });

    if (streamsError) {
      return streamsError;
    }

    streams.forEach((stream) => {
      if (stream.status.streamStatus == "inactive") {
        this.streams.add(`${stream.id}${stream.cdn.ingestionInfo.streamName}`);
      }
    });
    log.debug(`[YoutubeStreamManager.loadAvailableStreams] available streams:`);
    streams.forEach((stream) => {
      log.debug(`- ${stream.id} ${stream.cdn.ingestionInfo.streamName}`);
    });
  }

  /**
   * @param {string} login - twitch login
   * @returns {Promise<[Error, string]>} - streamIdstreamKey
   */
  async scheduleBroadcast(login = "🤔") {
    // this only works if the scheduledBroadcasts map keys are the same as the streams set values
    const availableStreams = this.streams.difference(this.scheduledBroadcasts);

    if (availableStreams.size === 0) {
      return [new Error("No available streams"), null];
    }

    const [accessError, accessToken] = await ytAuth.getAccessToken();
    if (accessError) {
      return [accessError, null];
    }

    const [insertError, insertedBroadcast] = await ytApi.insertBroadcast(
      accessToken,
      {
        part: ["snippet", "status", "contentDetails"],
      },
      {
        snippet: {
          title: format(
            BROADCAST_DEFAULT_BODY.snippet.title,
            login,
            getDateForSteamTitle()
          ),
          description: format(
            BROADCAST_DEFAULT_BODY.snippet.description,
            login
          ),
          scheduledStartTime: new Date().toISOString(),
        },
        status: BROADCAST_DEFAULT_BODY.status,
        contentDetails: BROADCAST_DEFAULT_BODY.contentDetails,
      }
    );

    if (insertError) {
      return [insertError, null];
    }

    const stream = availableStreams.values().next().value;
    const [streamId] = stream.split(SEPARATOR);

    const [bindError, boundBroadcast] = await ytApi.bindBroadcast(accessToken, {
      id: insertedBroadcast.id,
      streamId,
    });

    if (bindError) {
      return [bindError, null];
    }

    this.scheduledBroadcasts.set(stream, boundBroadcast.id);
    return [null, stream];
  }

  /**
   *
   * @param {string} m3u8PlaylistUrl
   * @param {string} stream - streamIdstreamKey
   * @param {string} login - twitch login
   * @returns
   */
  restreamToYT(m3u8PlaylistUrl, stream, login) {
    if (this.logins.has(login)) {
      return;
    }

    const [, ytStreamKey] = stream.split(SEPARATOR);

    return ffmpeg.restreamToYT({
      m3u8PlaylistUrl,
      ytStreamKey,
      login,
      onExit: async () => {
        this.handleStreamEnd(stream, login);
      },
    });
  }

  /**
   *
   * @param {string} stream - streamIdstreamKey
   * @param {string} login - twitch login
   * @returns {Promise<Error | void>}
   */
  async handleStreamEnd(stream, login) {
    this.logins.delete(login);

    const [accessError, accessToken] = await ytAuth.getAccessToken();
    if (accessError) {
      return [accessError, null];
    }

    const [streamId] = stream.split(SEPARATOR);

    const [transitionError] = await ytApi.transitionBroadcast(accessToken, {
      id: streamId,
      part: ["status"],
      broadcastStatus: "complete",
    });

    if (transitionError) {
      return transitionError;
    }

    log.info(`Transitioned broadcast for login ${login} to complete`);

    this.scheduledBroadcasts.delete(stream);
    // revalidate available streams after we ended a broadcast
    this.loadAvailableStreams();
  }
}
