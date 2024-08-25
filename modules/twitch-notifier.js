/** @import { TwitchWebhookNotification } from "../jsdoc.types.js" */
import { TWITCH_EVENTSUB_TYPES } from "../const.js";
import { Telegram } from "./telegram.js";
import { log } from "./log.js";
import { YoutubeStreamManager } from "./youtube-stream-manager.js";
import { twitchPlaylist } from "./twitch-playlist.js";

export const twitchNotifier = {
  /**
   * @param {TwitchWebhookNotification} notification
   */
  handleNotification: async (notification) => {
    const notificationType = notification.subscription.type;

    switch (notificationType) {
      case TWITCH_EVENTSUB_TYPES.STREAM_ONLINE.type:
        await twitchNotifier.handleStreamOnlineEvent(notification);
        return;
      case TWITCH_EVENTSUB_TYPES.STREAM_OFFLINE.type:
        await twitchNotifier.handleStreamOfflineEvent(notification);
        return;
      default:
        return log.log(
          `[twitchNotifier.handleNotification] Unknown notification type: ${notificationType}`
        );
    }
  },

  /**
   * @param {TwitchWebhookNotification} notification
   */
  handleStreamOnlineEvent: async (notification) => {
    const login = notification.event.broadcaster_user_login;

    const streamManager = YoutubeStreamManager.getInstance();

    const [broadcastScheduleError, { stream, broadcast }] =
      await streamManager.scheduleBroadcast(login);

    if (broadcastScheduleError) {
      log.error(
        `[twitchNotifier.handleStreamOnlineEvent] Error scheduling broadcast: ${broadcastScheduleError}`
      );
      return;
    }

    const [playbackTokenError, playbackToken] =
      await twitchPlaylist.getPlaybackAccessToken(login);

    if (playbackTokenError) {
      log.error(
        `[twitchNotifier.handleStreamOnlineEvent] Error getting playback token: ${playbackTokenError}`
      );
      return;
    }

    const m3u8Url = twitchPlaylist.buildM3u8Url(login, playbackToken);

    streamManager.restreamToYT(m3u8Url, stream, login);

    const embedHTML = broadcast.contentDetails.monitorStream.embedHtml;

    const telegram = new Telegram();
    telegram.start();
    await telegram.sendMessage(
      `${notification.event.broadcaster_user_name}* is live NOW\\!`
    );
    await telegram.sendMessage(embedHTML, "HTML");
    await telegram.stop();
  },

  /**
   * @param {TwitchWebhookNotification} notification
   */
  handleStreamOfflineEvent: async (notification) => {
    const telegram = new Telegram();
    telegram.start();
    await telegram.sendMessage(
      `*${notification.event.broadcaster_user_name}'s* stream has ended\\!`
    );
    await telegram.stop();
  },
};
