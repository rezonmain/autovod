/** @import { ApplicationEventType } from '../jsdoc.types' */

import { empty } from "../utils/utils.js";

const subscriptions = {};

export const eventBus = {
  /**
   *
   * @param {ApplicationEventType} eventType
   * @param {(...any) => void} callback
   * @returns {() => void} unsubscribe
   */
  subscribe(eventType, callback) {
    const id = Symbol();

    if (empty(subscriptions[eventType])) {
      subscriptions[eventType] = {};
    }

    subscriptions[eventType][id] = callback;

    return () => {
      delete subscriptions[eventType][id];
      if (empty(subscriptions[eventType])) {
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
    if (!subscriptions[eventType]) return;

    Object.keys(subscriptions[eventType]).forEach((key) =>
      subscriptions[eventType][key](...args)
    );
  },
};
