import { log } from "../modules/log.js";

/**
 *
 * @param {string} key
 * @returns {string}
 */
export function env(key) {
  const value = process.env[key];

  if (!value) {
    log.error(`Environment variable ${key} is not set`);
    process.exit(1);
  }
  return value;
}

/**
 *
 * @param  {...string} keys
 * @returns {string[]}
 */
export function envs(...keys) {
  return keys.map((key) => env(key));
}
