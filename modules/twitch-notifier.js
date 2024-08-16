/** @import { TwitchWebhookNotification } from "../jsdoc.types.js" */
import { TWITCH_EVENTSUB_TYPES } from "../const.js";
import { restreamWorker } from "./singleton-restream-worker.js";
import { Telegram } from "./telegram.js";

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
        return console.log(
          `[twitchNotifier.handleNotification] Unknown notification type: ${notificationType}`
        );
    }
  },

  /**
   * @param {TwitchWebhookNotification} notification
   */
  handleStreamOnlineEvent: async (notification) => {
    restreamWorker.worker.postMessage(
      `START:${notification.event.broadcaster_user_login}`
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
    restreamWorker.worker.postMessage("STOP");

    const telegram = new Telegram();
    telegram.start();
    await telegram.sendMessage(
      `*${notification.event.broadcaster_user_name}'s* stream has ended\\!`
    );
    await telegram.stop();
  },
};
