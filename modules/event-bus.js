/** @import { ApplicationEventType } from '../jsdoc.types' */
import crypto from "node:crypto";

const subscriptions = {};

export const eventBus = {
  /**
   *
   * @param {ApplicationEventType} eventType
   * @param {(...any) => void} callback
   * @returns {() => void} unsubscribe
   */
  subscribe(eventType, callback) {
    const id = crypto
      .createHash("sha1")
      .update(crypto.randomBytes(4))
      .digest("hex");

    if (!subscriptions[eventType]) {
      subscriptions[eventType] = {};
    }

    subscriptions[eventType][id] = callback;

    return () => {
      delete subscriptions[eventType][id];
      if (!subscriptions[eventType]) {
        delete subscriptions[eventType];
      }
    };
  },

  /**
   *
   * @param {ApplicationEventType} eventType
   * @param  {...any} args
   * @returns
   */
  publish(eventType, ...args) {
    if (!subscriptions[eventType]) {
      return;
    }

    Object.values(subscriptions[eventType]).forEach((callback) => {
      callback(...args);
    });
  },
};
