/** @import { YTBroadcast, YTStream } from '../jsdoc.types.js'*/
/** @import { ChildProcess } from 'node:child_process' */
import { format } from "node:util";
import {
  BROADCAST_DEFAULT_BODY,
  FFMPEG_EXIT_CODES,
  YT_HLS_INGEST_URL,
} from "../const.js";
import { ffmpeg } from "./ffmpeg.js";
import { ytApi } from "./yt-api.js";
import { ytAuth } from "./yt-auth.js";
import { getDateForSteamTitle } from "../utils/dates.js";
import { log } from "./log.js";
import { twitchPlaylist } from "./twitch-playlist.js";
import { eventLog } from "./event-log.js";
import { Telegram } from "./telegram.js";

const SEPARATOR = "";

export class YTStreamManager {
  /**
   * @type {Set<string>} - streamIdSEPARATORstreamKey
   */
  streams;

  /**
   * @type {Map<string, string>} - streamIdSEPARATORstreamKey -> broadcastId
   */
  scheduledBroadcasts;

  /**
   * @type {Map<string, ChildProcess} - twitch logins we are currently streaming to YT and their child processes
   */
  logins;

  /**
   * @type {YTStreamManager}
   */
  _instance;

  constructor() {
    this.streams = new Set();
    this.scheduledBroadcasts = new Map();
    this.logins = new Map();
  }

  /**
   *
   * @returns {YTStreamManager}
   */
  static getInstance() {
    if (!this._instance) {
      this._instance = new YTStreamManager();
    }
    return this._instance;
  }

  /**
   *
   * @returns {Promise<void>}
   */
  async init() {
    const [availableStreamsError] = await this.loadAvailableStreams();
    if (availableStreamsError) {
      log.error(
        `[YTStreamManager.init] Error loading available streams ${availableStreamsError.message}`
      );
    }
  }

  /**
   *
   * @returns {Promise<[Error, YTStream[]]>}
   */
  async loadAvailableStreams() {
    const [accessError, accessToken] = await ytAuth.getAccessToken();
    if (accessError) {
      return [accessError, null];
    }

    const [streamsError, streams] = await ytApi.getStreams(accessToken, {
      part: ["snippet", "cdn", "status"],
      mine: true,
    });
    if (streamsError) {
      return [streamsError, null];
    }

    streams.forEach((stream) => {
      if (["ready", "inactive"].includes(stream.status.streamStatus)) {
        this.streams.add(
          `${stream.id}${SEPARATOR}${stream.cdn.ingestionInfo.streamName}`
        );
      }
    });

    log.info("[YTStreamManager.loadAvailableStreams] Loaded available streams");
    for (const stream of this.streams) {
      log.info(`[YTStreamManager.loadAvailableStreams] ${stream}`);
    }

    return [null, streams];
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
   * @param {string} stream - streamIdSEPARATORstreamKey
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

    log.log(
      `[YTStreamManager.restreamToYt] Starting restream for ${login} using streamKey: ${ytStreamKey}`
    );

    const childProcess = await this._spawnRestreamProcess(
      sourceUrl,
      destinationUrl,
      login,
      stream
    );

    this.logins.set(login, childProcess);
  }

  /**
   * @private
   * @param {string} sourceUrl
   * @param {string} destinationUrl
   * @param {string} login
   * @param {string} stream
   */

  async _spawnRestreamProcess(sourceUrl, destinationUrl, login, stream) {
    return ffmpeg.passthroughHLS({
      sourceUrl,
      destinationUrl,
      onExit: async (code) => {
        log.log(
          `[YTStreamManager.restreamToYt] Restream for ${login} ended with code: ${code}`
        );

        if (
          [
            FFMPEG_EXIT_CODES.STOPPED_BY_AUTOVOD,
            FFMPEG_EXIT_CODES.SUCCESS,
          ].includes(code)
        ) {
          const streamEndError = await this.handleStreamEnd(stream, login);
          if (streamEndError) {
            log.error(
              `[YTStreamManager.restreamToYt.OnExit] Error handling stream end for ${login}: ${streamEndError.message}`
            );
            try {
              const telegram = Telegram.getInstance();
              telegram.sendMessage(
                `❌ Error handling stream end for ${login} ❌`
              );
            } catch {
              log.error(
                `[YTStreamManager.restreamToYt.OnExit] Error sending telegram message`
              );
            }
          }
          return;
        }

        eventLog.log(
          `[YTStreamManager.restreamToYt.OnExit] Restarting restream for ${login} due to unexpected exit`,
          "info"
        );
        return this._spawnRestreamProcess(
          sourceUrl,
          destinationUrl,
          login,
          stream
        );
      },
    });
  }

  /**
   * @param {string} stream - streamIdSEPARATORstreamKey
   * @param {string} login - twitch login
   * @returns {Promise<Error | void>}
   */
  async handleStreamEnd(stream, login) {
    this.logins.delete(login);
    const [accessError, accessToken] = await ytAuth.getAccessToken();
    if (accessError) {
      return accessError;
    }

    const videoId = this.scheduledBroadcasts.get(stream);

    const [transitionError] = await ytApi.transitionBroadcast(accessToken, {
      id: videoId,
      broadcastStatus: "complete",
      part: ["snippet"],
    });
    if (transitionError) {
      return transitionError;
    }

    this.scheduledBroadcasts.delete(stream);

    log.info(
      `[YTStreamManager.handleStreamEnd] Transitioned broadcast for ${login} to Complete`
    );

    const [updateVideoError] = await ytApi.updateVideo(
      accessToken,
      {
        part: ["status"],
      },
      {
        id: videoId,
        status: {
          privacyStatus: "public",
        },
      }
    );
    if (updateVideoError) {
      return updateVideoError;
    }

    log.info(
      `[YTStreamManager.handleStreamEnd] Set ${login} broadcast privacy status to Public`
    );

    // revalidate available streams after we ended a broadcast
    const [loadStreamsError] = await this.loadAvailableStreams();
    if (loadStreamsError) {
      return loadStreamsError;
    }
  }

  /**
   * @param {string} login - twitch login
   * @returns {Error | void}
   */
  stopStream(login) {
    if (!this.logins.has(login)) {
      return new Error(`No stream for login: ${login}`);
    }

    const childProcess = this.logins.get(login);
    childProcess.kill("SIGHUP");
  }
}
