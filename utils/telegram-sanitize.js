const invalidChars = ["-"];
/**
 * @param {Object} params
 * @param {string} params.message
 * @returns
 */
export function sanitizeTelegramMessage({ message }) {
  const charArray = message.split("");

  return charArray
    .map((char) => {
      if (invalidChars.includes(char)) {
        return `\\${char}`;
      }
      return char;
    })
    .join("");
}
