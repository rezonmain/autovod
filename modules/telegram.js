import { Bot } from "grammy";
import { ENV_KEYS } from "../const.js";
import { env } from "../utils/env.js";

class Telegram {
  token;
  bot;
  chatId;

  constructor(
    token = env(ENV_KEYS.TELEGRAM_TOKEN),
    chatId = env(ENV_KEYS.TELEGRAM_CHAT_ID)
  ) {
    this.token = token;
    this.chatId = chatId;
    this.bot = new Bot(this.token);
  }

  start() {
    return this.bot.start();
  }

  stop() {
    return this.bot.stop();
  }

  /**
   * @param {string} message
   */
  async sendMessage(message) {
    await this.bot.api.sendMessage(this.chatId, message, {
      parse_mode: "MarkdownV2",
    });
  }
}

export { Telegram };
