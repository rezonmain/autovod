import { Bot } from "grammy";
import { ENV_KEYS } from "../const.js";
import { env } from "../utils/env.js";
import { nil } from "../utils/utils.js";

class Telegram {
  /**
   * @type {string}
   */
  token;

  /**
   * @type {Bot}
   */
  bot;

  /**
   * @type {string}
   */
  chatId;

  /**
   * @type {Telegram}
   */
  _instance = null;

  /**
   * @private
   * @param {string} token
   * @param {sting} chatId
   */
  constructor(
    token = env(ENV_KEYS.TELEGRAM_TOKEN),
    chatId = env(ENV_KEYS.TELEGRAM_CHAT_ID)
  ) {
    this.token = token;
    this.chatId = chatId;
    this.bot = new Bot(this.token);
  }

  /**
   * @returns {Telegram}
   */
  static getInstance() {
    if (nil(this._instance)) {
      this._instance = new Telegram();
    }
    return this._instance;
  }

  init() {
    return this.bot.start();
  }

  stop() {
    return this.bot.stop();
  }

  /**
   * @param {string} message
   * @param {string} parse_mode
   */
  async sendMessage(message, parse_mode = "MarkdownV2") {
    await this.bot.api.sendMessage(this.chatId, message, {
      parse_mode,
    });
  }
}

export { Telegram };
