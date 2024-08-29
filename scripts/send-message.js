import { Telegram } from "../modules/telegram.js";
import { empty } from "../utils/utils.js";

const [, , message] = process.argv;

const telegram = Telegram.getInstance();
telegram.init();
await telegram.sendMessage(empty(message) ? "🤖 Test 🤖" : message);
await telegram.stop();
