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

/**
 * @typedef {Object} TwitchStream
 * @property {string} id
 * @property {string} user_id
 * @property {string} user_login
 * @property {string} user_name
 * @property {string} game_id
 * @property {string} game_name
 * @property {string} type
 * @property {string} title
 * @property {string[]} tags
 * @property {number} viewer_count
 * @property {string} started_at
 * @property {string} language
 * @property {string} thumbnail_url
 * @property {string[]} tag_ids
 * @property {boolean} is_mature
 */

/**
 * @typedef {Object} YTStream
 * @property {string} kind
 * @property {string} etag
 * @property {string} id
 * @property {Object} snippet
 * @property {string} snippet.publishedAt
 * @property {string} snippet.channelId
 * @property {string} snippet.title
 * @property {string} snippet.description
 * @property {string} snippet.isDefaultStream
 * @property {Object} cdn
 * @property {string} cdn.ingestionType
 * @property {Object} cdn.ingestionInfo
 * @property {string} cdn.ingestionInfo.streamName
 * @property {string} cdn.ingestionInfo.ingestionAddress
 * @property {string} cdn.ingestionInfo.backupIngestionAddress
 * @property {string} cdn.resolution
 * @property {string} cdn.frameRate
 * @property {Object} status
 * @property {"active" | "inactive"} status.streamStatus
 */

/**
 * @typedef {Object} YTBroadcast
 * @property {string} kind
 * @property {string} etag
 * @property {string} id
 * @property {Object} snippet
 * @property {string} snippet.publishedAt
 * @property {string} snippet.channelId
 * @property {string} snippet.title
 * @property {string} snippet.description
 * @property {string} snippet.scheduledStartTime
 * @property {string} snippet.scheduledEndTime
 * @property {string} snippet.actualEndTime
 * @property {string} snippet.isDefaultBroadcast
 * @property {Object} snippet.liveChatId
 * @property {Object} status
 * @property {string} status.lifeCycleStatus
 * @property {string} status.privacyStatus
 * @property {string} status.recordingStatus
 * @property {string} status.selfDeclaredMadeForKids
 * @property {string} status.madeForKids
 * @property {Object} contentDetails
 * @property {string} contentDetails.boundStreamId
 * @property {string} contentDetails.boundStreamLastUpdateTimeMs
 * @property {Object} contentDetails.monitorStream
 * @property {string} contentDetails.monitorStream.embedHtml
 * @property {string} contentDetails.monitorStream.enableMonitorStream
 * @property {string} contentDetails.monitorStream.broadcastStreamDelayMs
 * @property {boolean} contentDetails.enableEmbed
 * @property {boolean} contentDetails.enableDvr
 * @property {boolean} contentDetails.recordFromStart
 * @property {boolean} contentDetails.enableClosedCaptions
 * @property {string} contentDetails.closedCaptionsType
 * @property {string} contentDetails.projection
 * @property {string} contentDetails.enableAutoStart
 * @property {string} contentDetails.enableAutoStart
 */

/**
 * @typedef {Object} YTGetStreamsOptions
 * @property {("snippet" | "cdn" | "contentDetails" | "status")[]} part
 * @property {boolean} mine
 */

/**
 * @typedef {Object} YTInsertBroadcastOptions
 * @property {("snippet" | "contentDetails" | "status")[]} part
 */

/**
 * @typedef {Object} YTTransitionBroadcastOptions
 * @property {("snippet" | "contentDetails" | "status" | "id")[]} part
 * @property {"complete" | "live" | "testing"} broadcastStatus
 * @property {string} id
 */

/**
 * @typedef {Object} YTInsertBroadcastBody
 * @property {Object} snippet
 * @property {string} snippet.title
 * @property {string} snippet.scheduledStartTime
 * @property {Object} status
 * @property {string} status.privacyStatus
 * @property {boolean} status.selfDeclaredMadeForKids
 * @property {Object} contentDetails
 * @property {string} contentDetails.enableAutoStart
 * @property {string} contentDetails.enableAutoStop
 * @property {string} contentDetails.enableDvr
 * @property {string} contentDetails.recordFromStart
 */

/**
 * @typedef {'google-auth-redirect'} ApplicationEventType
 */

/**
 * @typedef {'google-auth-state'} ApplicationStoreKey
 */

/**
 * @typedef {Object} StatementSync
 * @property {() => Array<Record<string, unknown>>} all - This method executes a prepared statement and returns all results as an array of objects. If the prepared statement does not return any results, this method returns an empty array. The prepared statement parameters are bound using the values in namedParameters and anonymousParameters.
 * @property {() => string} expandedSQL - This method returns the source SQL of the prepared statement with parameter placeholders replaced by values. This method is a wrapper around sqlite3_expanded_sql().
 * @property {() => Record<string, unknown> | undefined} get - This method executes a prepared statement and returns the first result as an object. If the prepared statement does not return any results, this method returns undefined. The prepared statement parameters are bound using the values in namedParameters and anonymousParameters.
 * @property {() => {changes: number, lastInsertRowid: number}} run - This method executes a prepared statement and returns an object summarizing the resulting changes. The prepared statement parameters are bound using the values in namedParameters and anonymousParameters.
 * @property {() => string} sourceSQL This method returns the source SQL of the prepared statement. This method is a wrapper around sqlite3_sql().
 */

/**
 * @typedef {Object} GoogleCert
 * @property {string} kty
 * @property {string} n
 * @property {string} alg
 * @property {string} use
 * @property {string} e
 * @property {string} kid
 */

/**
 * @template T
 * @typedef {Object} Paginated
 * @property {number} limit
 * @property {number} page
 * @property {number} total
 * @property {T[]} data
 */

export {};
