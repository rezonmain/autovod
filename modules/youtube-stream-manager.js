import { format } from "node:util";
import { BROADCAST_DEFAULT_BODY } from "../const.js";
import { nil } from "../utils/utils.js";
import { ytApi } from "./yt-api.js";
import { ytAuth } from "./yt-auth.js";
import { getDateForSteamTitle } from "../utils/dates.js";

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
   * @type {YoutubeStreamManager}
   */
  _instance = null;

  constructor() {
    this.streams = new Set();
    this.scheduledBroadcasts = new Map();
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
  }

  /**
   *
   * @param {string} login - twitch login
   * @returns {Promise<[Error, string]>}
   */
  async scheduleBroadcast(login = "🤔") {
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
    const [streamId, streamKey] = stream.split(SEPARATOR);

    const [bindError, boundBroadcast] = await ytApi.bindBroadcast(accessToken, {
      id: insertedBroadcast.id,
      streamId,
    });

    if (bindError) {
      return [bindError, null];
    }

    this.scheduledBroadcasts.set(stream, boundBroadcast.id);
    return [null, streamKey];
  }
}
