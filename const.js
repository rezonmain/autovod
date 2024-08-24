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
  STREAMS: "https://api.twitch.tv/helix/streams",
};
export const TWITCH_EVENTSUB_TYPES = {
  STREAM_ONLINE: { type: "stream.online", version: "1" },
  STREAM_OFFLINE: { type: "stream.offline", version: "1" },
};
export const ENV_KEYS = {
  TWITCH_CLIENT_ID: "TWITCH_CLIENT_ID",
  TWITCH_CLIENT_SECRET: "TWITCH_CLIENT_SECRET",
  TWITCH_WEBHOOK_SECRET: "TWITCH_WEBHOOK_SECRET",
  TWITCH_PERSONAL_OAUTH_TOKEN: "TWITCH_PERSONAL_OAUTH_TOKEN",
  DOMAIN_BASE_URL: "DOMAIN_BASE_URL",
  APPLICATION_PORT: "APPLICATION_PORT",
  HOST_PORT: "HOST_PORT",
  TELEGRAM_TOKEN: "TELEGRAM_TOKEN",
  TELEGRAM_CHAT_ID: "TELEGRAM_CHAT_ID",
  DEFAULT_YT_STREAM_KEY: "DEFAULT_YT_STREAM_KEY",
  GOOGLE_AUTH_CLIENT_ID: "GOOGLE_AUTH_CLIENT_ID",
  GOOGLE_AUTH_REDIRECT_URI: "GOOGLE_AUTH_REDIRECT_URI",
  _GOOGLE_AUTH_HINT: "_GOOGLE_AUTH_HINT",
};
export const SECRETS = {
  GOOGLE_SERVICE_ACCOUNT_KEY: "google-service-account-key.secret",
};
export const TWITCH_PUBLIC_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";
export const TWITCH_GQL_URL = "https://gql.twitch.tv/gql";
export const TWITCH_M3U8_URL = "https://usher.ttvnw.net/api/channel/hls";
export const YT_HLS_INGEST_URL =
  "https://a.upload.youtube.com/http_upload_hls?cid=%s&copy=0&file=stream.m3u8";
export const YT_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const YT_API_URLS = {
  BROADCAST: "https://www.googleapis.com/youtube/v3/liveBroadcasts",
  STREAM: "https://www.googleapis.com/youtube/v3/liveStreams",
};
export const GOOGLE_API_SCOPES = {
  YT: "https://www.googleapis.com/auth/youtube",
  YT_FORCE_SSL: "https://www.googleapis.com/auth/youtube.force-ssl",
};
export const APPLICATION_EVENT_TYPES = {
  GOOGLE_AUTH_REDIRECT: "google-auth-redirect",
};
export const APPLICATION_STORE_KEYS = {
  GOOGLE_AUTH_STATE: "google-auth-state",
};
export const DOCUMENTS = {
  CALLBACK_GOOGLE_REDIRECT: "callback-google-redirect.html",
};
