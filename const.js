export const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
export const CACHE_KEYS = {
  TWITCH_ACCESS: "@twitch-access",
};
export const TWITCH_WEBHOOK_HEADERS = {
  MESSAGE_ID: "Twitch-Eventsub-Message-Id".toLowerCase(),
  MESSAGE_TIMESTAMP: "Twitch-Eventsub-Message-Timestamp".toLowerCase(),
  MESSAGE_SIGNATURE: "Twitch-Eventsub-Message-Signature".toLowerCase(),
  MESSAGE_TYPE: "Twitch-Eventsub-Message-Type".toLowerCase(),
};
export const TWITCH_WEBHOOK_HMAC_PREFIX = "sha256=";
export const TWITCH_EVENT_MESSAGE_TYPE = {
  NOTIFICATION: "notification",
  VERIFICATION: "webhook_callback_verification",
  REVOCATION: "revocation",
};
export const TWITCH_API_URLS = {
  SEARCH_CHANNELS: "https://api.twitch.tv/helix/search/channels",
  EVENTSUB: "https://api.twitch.tv/helix/eventsub/subscriptions",
  USERS: "https://api.twitch.tv/helix/users",
};
export const TWITCH_EVENTSUB_TYPES = {
  STREAM_ONLINE: { type: "stream.online", version: "1" },
  STREAM_OFFLINE: { type: "stream.offline", version: "1" },
};
export const ENV_KEYS = {
  TWITCH_CLIENT_ID: "TWITCH_CLIENT_ID",
  TWITCH_CLIENT_SECRET: "TWITCH_CLIENT_SECRET",
  TWITCH_WEBHOOK_SECRET: "TWITCH_WEBHOOK_SECRET",
  DOMAIN_BASE_URL: "DOMAIN_BASE_URL",
  LISTEN_PORT: "LISTEN_PORT",
  TELEGRAM_TOKEN: "TELEGRAM_TOKEN",
  TELEGRAM_CHAT_ID: "TELEGRAM_CHAT_ID",
};
