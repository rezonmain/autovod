import { Database } from "./database.js";
import { log as appLogger } from "./log.js";

export const eventLog = {
  /**
   * @param {string} message
   * @param {"info" | "error"} type
   * @param {Record<string, any>} metadata
   */
  log(message, type, metadata = {}) {
    const createdAt = new Date().toISOString();
    const db = Database.getInstance();
    try {
      const query = db.prepare(
        "INSERT INTO events (type, message, metadata, createdAt) VALUES (?, ?, ?, ?)"
      );
      query.run(type, message, JSON.stringify(metadata), createdAt);
    } catch (error) {
      appLogger.error(`[EventLog] Unable to insert event log ${error.message}`);
    }
  },
};
