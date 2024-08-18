export const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
export const CACHE_KEYS = {
  TWITCH_ACCESS: "@twitch-access",
  YT_ACCESS: "@yt-access",
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
  APPLICATION_PORT: "APPLICATION_PORT",
  HOST_PORT: "HOST_PORT",
  TELEGRAM_TOKEN: "TELEGRAM_TOKEN",
  TELEGRAM_CHAT_ID: "TELEGRAM_CHAT_ID",
  YT_SERVICE_ACCOUNT_KEY_ID: "YT_SERVICE_ACCOUNT_KEY_ID",
  YT_SERVICE_ACCOUNT_EMAIL: "YT_SERVICE_ACCOUNT_EMAIL",
};
export const SECRETS = {
  GOOGLE_SERVICE_ACCOUNT_KEY: "google-service-account-key.secret",
};
export const TWITCH_PUBLIC_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";
export const TWITCH_GQL_URL = "https://gql.twitch.tv/gql";
export const TWITCH_M3U8_URL = "https://usher.ttvnw.net/api/channel/hls";
export const YT_HLS_INGEST_URL =
  "https://a.upload.youtube.com/http_upload_hls?cid=%s&copy=0&file=stream.m3u8";
export const YT_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const YT_API_URLS = {
  BROADCAST: "https://www.googleapis.com/youtube/v3/liveBroadcasts",
  STREAM: "https://www.googleapis.com/youtube/v3/liveStreams",
};
