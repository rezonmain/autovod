import { Telegram } from "../modules/telegram.js";

const [, , message] = process.argv;

const telegram = Telegram.getInstance();
telegram.init();
await telegram.sendMessage(message ? message : "🤖 Test 🤖");
await telegram.stop();
