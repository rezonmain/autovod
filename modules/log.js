let config = {
  debug: true,
  info: true,
  error: true,
};

export const log = {
  /**
   * @param {object} options
   * @param {string} options.debug
   * @param {string} options.info
   * @param {string} options.error
   */
  configure: (logConfiguration = config) => {
    config = logConfiguration;
  },

  log: (message) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
  },

  debug: (message) => {
    if (!config.debug) {
      return;
    }
    console.log(
      "\x1b[36m",
      `[${new Date().toISOString()}][DEBUG] ${message}`,
      "\x1b[0m"
    );
  },
  /**
   * @param {string} message
   */
  info: (message) => {
    if (!config.info) {
      return;
    }
    console.log(
      "\x1b[2m",
      `[${new Date().toISOString()}][INFO] ${message}`,
      "\x1b[0m"
    );
  },

  /**
   * @param {string} message
   */
  error: (message) => {
    if (!config.error) {
      return;
    }
    console.error(
      "\x1b[31m",
      `[${new Date().toISOString()}][ERROR] ${message}`,
      "\x1b[0m"
    );
  },
};
