import test from "node:test";
import assert from "node:assert";
import { sanitizeTelegramMessage } from "./telegram-sanitize.js";

test("telegram sanitize, sanitizes - char", () => {
  const dirtyMessage = "123-123-123-123";

  const sanitizedMessage = sanitizeTelegramMessage({ message: dirtyMessage });
  assert.strictEqual(sanitizedMessage, "123\\-123\\-123\\-123");
});
