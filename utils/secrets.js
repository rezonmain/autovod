import fs from "node:fs/promises";
import path from "node:path";

const DIRNAME = process.cwd();
const SECRETS_PATH = path.resolve(DIRNAME, "secrets");

/**
 * @param {string} secret
 * @returns {Promise<[Error, string]>}
 */
export async function readPrivateKey(secret, stripHeaderFooter = true) {
  try {
    const fileContent = (
      await fs.readFile(path.join(SECRETS_PATH, secret), "utf-8")
    ).trim();

    if (stripHeaderFooter) {
      const splitted = fileContent.split("\n");
      splitted.shift();
      splitted.pop();
      return [null, splitted.join("\n")];
    }

    return [null, fileContent];
  } catch (error) {
    return [error, null];
  }
}
