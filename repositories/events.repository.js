import { Database } from "../modules/database.js";

const db = Database.getInstance();

/**
 * @typedef Event
 * @property {number} id
 * @property {string} type
 * @property {string} message
 * @property {Record<string, string>} metadata
 * @property {string} createdAt
 */

export const eventsRepository = {
  /**
   * @param {DatabaseSync}
   * @returns {Event[]}
   */
  getAllEvents() {
    const query = db.prepare("SELECT * FROM events");
    return query.all();
  },

  /**
   * @param {string} id
   * @returns {Event | null}
   */
  getEventById(id) {
    const query = db.prepare("SELECT * FROM events WHERE id = ?");
    return query.get(id);
  },

  /**
   * @param {{type: "info" | "error", message: string, metadata: Record<string, string>}} event
   * @returns {number}
   */
  createEvent(event) {
    const createdAt = new Date().toISOString();
    const query = db.prepare(
      "INSERT INTO events (type, message, metadata, createdAt) VALUES (?, ?, ?, ?)"
    );
    return query.run(
      event.type,
      event.message,
      JSON.stringify(event.metadata),
      createdAt
    ).lastInsertRowid;
  },
};
