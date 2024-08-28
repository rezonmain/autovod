export const eventLog = {
  /**
   * @param {string} message
   * @param {"info" | "error"} type
   * @param {Record<string, any>} metadata
   */
  log: async (message, type, metadata = {}) => {},
};
