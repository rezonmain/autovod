import { eventsRepository } from "../repositories/events.repository.js";
import { log as appLogger } from "./log.js";

export const eventLog = {
  /**
   * @param {string} message
   * @param {"info" | "error" | "debug"} type
   * @param {Record<string, any>} metadata
   */
  log(message, type, metadata = {}) {
    try {
      eventsRepository.createEvent({
        type,
        message,
        metadata: JSON.stringify(metadata),
      });
    } catch (error) {
      appLogger.error(`[EventLog] Unable to insert event log ${error.message}`);
    }
  },
};
