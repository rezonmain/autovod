/** @import { YTBroadcast } from '../jsdoc.types.js'*/
/** @import { ChildProcess } from 'node:child_process' */
import { format } from "node:util";
import { BROADCAST_DEFAULT_BODY, YT_HLS_INGEST_URL } from "../const.js";
import { ffmpeg } from "./ffmpeg.js";
import { nil } from "../utils/utils.js";
import { ytApi } from "./yt-api.js";
import { ytAuth } from "./yt-auth.js";
import { getDateForSteamTitle } from "../utils/dates.js";
import { log } from "./log.js";
import { twitchPlaylist } from "./twitch-playlist.js";

const SEPARATOR = "";

export class YTStreamManager {
  /**
   * @type {Set<string>} - streamIdstreamKey
   */
  streams;

  /**
   * @type {Map<string, string>} - streamIdstreamKey -> broadcastId
   */
  scheduledBroadcasts;

  /**
   * @type {Set<string>} - twitch logins we are currently streaming to YT
   */
  logins;

  /**
   * @type {YTStreamManager}
   */
  _instance = null;

  constructor() {
    this.streams = new Set();
    this.scheduledBroadcasts = new Map();
    this.logins = new Set();
  }

  /**
   *
   * @returns {YTStreamManager}
   */
  static getInstance() {
    if (nil(this._instance)) {
      this._instance = new YTStreamManager();
    }
    return this._instance;
  }

  /**
   *
   * @returns {Promise<Error | void>}
   */
  async init() {
    const availableStreamsError = await this.loadAvailableStreams();
    if (availableStreamsError) {
      return availableStreamsError;
    }
  }

  /**
   *
   * @returns {Promise<Error | void>}
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
    log.debug(
      `[YTStreamManager.loadAvailableStreams] Loaded available streams:`
    );
    for (const stream of this.streams) {
      log.debug(`- ${stream}`);
    }
  }

  /**
   * @param {string} login - twitch login
   * @returns {Promise<[Error, {stream: string, broadcast: YTBroadcast}]>} - streamIdstreamKey
   */
  async scheduleBroadcast(login) {
    // the following only works if scheduledBroadcasts's Map keys, are the same as streams Set values

    /** @type {Set<string>} */
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

    /** @type {string} */
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
    return [null, { stream, broadcast: boundBroadcast }];
  }

  /**
   * @param {string} stream - streamIdstreamKey
   * @param {string} login - twitch login
   * @returns {Promise<Error | ChildProcess>}
   */
  async restreamToYT(stream, login) {
    if (this.logins.has(login)) {
      log.info(
        `[YTStreamManager.restreamToYt] Already streaming login: ${login}`
      );
      return;
    }

    const [playbackTokenError, playbackToken] =
      await twitchPlaylist.getPlaybackAccessToken(login);

    if (playbackTokenError) {
      return playbackTokenError;
    }

    const sourceUrl = twitchPlaylist.buildM3u8Url(login, playbackToken);

    const [, ytStreamKey] = stream.split(SEPARATOR);

    const destinationUrl = format(YT_HLS_INGEST_URL, ytStreamKey);

    this.logins.add(login);

    log.info(
      `[YTStreamManager.restreamToYt] Starting restream for ${login} using streamKey: ${ytStreamKey}`
    );

    return ffmpeg.passthroughHLS({
      sourceUrl,
      destinationUrl,
      onExit: async (code) => {
        log.info(
          `[YTStreamManager.restreamToYt] Restream for ${login} ended with code: ${code}`
        );
        const streamEndError = await this.handleStreamEnd(stream, login);
        if (streamEndError) {
          log.error(
            "[YTStreamManager.restreamToYt.OnExit] Error handling stream end",
            streamEndError
          );
        }
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
      return accessError;
    }

    const [transitionError] = await ytApi.transitionBroadcast(accessToken, {
      id: this.scheduledBroadcasts.get(stream),
      broadcastStatus: "complete",
      part: ["snippet"],
    });
    if (transitionError) {
      return transitionError;
    }

    log.info(
      `[YTStreamManager.handleStreamEnd] Transitioned broadcast for ${login} to Complete`
    );

    this.scheduledBroadcasts.delete(stream);

    // revalidate available streams after we ended a broadcast
    const loadStreamsError = await this.loadAvailableStreams();
    if (loadStreamsError) {
      return loadStreamsError;
    }

    // TODO: decide if we should make broadcast public ???
  }
}
