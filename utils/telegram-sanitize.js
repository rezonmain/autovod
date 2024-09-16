const invalidChars = ["-"];

/**
 *
 * @param {string} message
 * @returns
 */
export function sanitizeTelegramMessage(message) {
  const sanitizedMessage = message.split("");

  for (let i = 0; i < sanitizedMessage.length; i++) {
    if (invalidChars.includes(sanitizedMessage[i])) {
      sanitizedMessage.splice(i, 0, "\\");
    }
  }

  return sanitizedMessage.join();
}
