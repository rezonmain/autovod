/**
 * @typedef {Object} TwitchSubscription
 * @property {string} id
 * @property {string} status
 * @property {string} type
 * @property {string} version
 * @property {Object} condition
 * @property {string} condition.broadcaster_user_id
 * @property {Object} transport
 * @property {string} transport.method
 * @property {string} transport.callback
 * @property {string} created_at
 * @property {number} cost
 */

/**
 * @typedef {Object} TwitchEvent
 * @property {string} id
 * @property {string} broadcaster_user_id
 * @property {string} broadcaster_user_login
 * @property {string} broadcaster_user_name
 * @property {string} type
 * @property {string} started_at
 */

/**
 * @typedef {Object} TwitchWebhookNotification
 * @property {TwitchSubscription} subscription
 * @property {TwitchEvent} event
 */

/**
 * @typedef {Object} TwitchUser
 * @property {string} id
 * @property {string} login
 * @property {string} display_name
 * @property {string} type
 * @property {string} broadcaster_type
 * @property {string} description
 * @property {string} profile_image_url
 * @property {string} offline_image_url
 * @property {number} view_count
 * @property {string} email
 * @property {string} created_at
 */

export {};
