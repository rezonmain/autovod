import fs from "fs";
import path from "node:path";
import crypto from "crypto";
import { empty } from "../utils/utils.js";
import { log } from "./log.js";
const SEPARATOR = "";
const EXTENSION = "che";

const DIRNAME = process.cwd();
const CACHE_PATH = path.resolve(DIRNAME, "cache");

export const fileCache = {
  /**
   * @param {string} key - the unique key used to retrieve the value
   * @param {number} ttl - timestamp when the data will expire Ex. `Date.now() + 1000`
   * @param {string[]} data - data to store, store multiple values passing them as additional arguments
   * @returns {boolean}
   */
  set: (key, ttl, ...data) => {
    const hash = fileCache._hash(key);
    const encodedData = `${ttl}${SEPARATOR}${data.join(SEPARATOR)}`;
    return fileCache._write(hash, encodedData);
  },

  /**
   * @param {string} key - the unique key used to retrieve the value
   * @returns {string[] | null}
   */
  get: (key) => {
    const hash = fileCache._hash(key);
    const encodedData = fileCache._read(hash);

    if (empty(encodedData)) {
      log.info(`[Cache MISS] NO_DATA | key: ${key} | hash: ${hash}`);
      return null;
    }
    const [ttl, ...parsedData] = encodedData.split(SEPARATOR);
    if (ttl < new Date()) {
      log.info(`[Cache MISS] EXPIRED | key: ${key} | hash: ${hash}`);
      fileCache._delete(hash);
      return null;
    }
    log.info(`[Cache HIT] key: ${key} | hash: ${hash}`);
    return parsedData;
  },

  /**
   *
   * @param {string} key - the unique key used to retrieve the value
   * @returns {string | null} the first value stored
   */
  getOne: (key) => {
    const data = fileCache.get(key);
    return data ? data[0] : null;
  },

  /**
   *
   * @param {string} key - the unique key used to delete the cached value
   * @returns
   */
  remove: (key) => {
    const hash = fileCache._hash(key);
    return fileCache._delete(hash);
  },

  _hash(key) {
    return encodeURIComponent(
      crypto.createHash("sha1").update(key).digest("base64")
    );
  },

  _write(hash, data) {
    return fs.writeFileSync(
      path.join(CACHE_PATH, `${hash}.${EXTENSION}`),
      data,
      "utf8"
    );
  },

  _read(hash) {
    try {
      return fs.readFileSync(
        path.join(CACHE_PATH, `${hash}.${EXTENSION}`),
        "utf8"
      );
    } catch {
      return null;
    }
  },

  _delete(hash) {
    return fs.unlinkSync(path.join(CACHE_PATH, `${hash}.${EXTENSION}`));
  },
};
