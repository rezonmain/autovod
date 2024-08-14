import { Bot } from "grammy";

class Telegram {
  token;
  bot;
  chatId;

  constructor(
    token = process.env.TELEGRAM_TOKEN,
    chatId = process.env.TELEGRAM_CHAT_ID
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
