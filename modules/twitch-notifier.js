/** @import { TwitchWebhookNotification } from "../jsdoc.types.js" */
import { TWITCH_EVENTSUB_TYPES } from "../const.js";
import { Restreamer } from "./restreamer.js";
import { Telegram } from "./telegram.js";
import { log } from "./log.js";

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
    Restreamer.getInstance().start(
      await Restreamer.getM3u8UrlFromLogin(
        notification.event.broadcaster_user_login
      )
    );

    const telegram = new Telegram();
    telegram.start();
    await telegram.sendMessage(
      `*${notification.event.broadcaster_user_name}* is live NOW\\!`
    );
    await telegram.stop();
  },

  /**
   * @param {TwitchWebhookNotification} notification
   */
  handleStreamOfflineEvent: async (notification) => {
    Restreamer.getInstance().stop();

    const telegram = new Telegram();
    telegram.start();
    await telegram.sendMessage(
      `*${notification.event.broadcaster_user_name}'s* stream has ended\\!`
    );
    await telegram.stop();
  },
};
