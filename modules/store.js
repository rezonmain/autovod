const memoryStore = new Map();

export const store = {
  /**
   * @param {string} key - the unique key used to retrieve the value
   * @param {string} data - the value to store must be a string
   */
  set(key, data) {
    memoryStore.set(key, data);
  },

  /**
   * @param {string} key - the unique key used to retrieve the value
   * @returns {string | null}
   */
  get(key) {
    return memoryStore.get(key);
  },

  delete(key) {
    memoryStore.delete(key);
  },
};
