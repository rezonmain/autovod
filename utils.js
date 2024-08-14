/**
 * @param {any} value
 * @returns
 */
export const nil = (value) => {
  return value === null || value === undefined;
};

/**
 *
 * @param {any} value
 * @returns
 */
export const empty = (value) => {
  if (nil(value)) {
    return true;
  }

  if (typeof value === "string") {
    return value === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
};
