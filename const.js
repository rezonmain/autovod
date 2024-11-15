export const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
export const CACHE_KEYS = {
  TWITCH_ACCESS: "@twitch-access",
  YT_ACCESS: "@yt-access",
  YT_REFRESH: "@yt-refresh",
  GOOGLE_CERTS: "@google-certs-v1.2",
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
  GOOGLE_CLIENT_ID: "GOOGLE_CLIENT_ID",
  GOOGLE_REDIRECT_URI: "GOOGLE_REDIRECT_URI",
  GOOGLE_CLIENT_REDIRECT_URI: "GOOGLE_CLIENT_REDIRECT_URI",
  GOOGLE_SECRET: "GOOGLE_SECRET",
  GOOGLE_AUTH_HINT: "GOOGLE_AUTH_HINT",
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
export const YT_ACCESS_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const YT_API_URLS = {
  BROADCAST: "https://www.googleapis.com/youtube/v3/liveBroadcasts",
  BROADCAST_BIND: "https://www.googleapis.com/youtube/v3/liveBroadcasts/bind",
  STREAM: "https://www.googleapis.com/youtube/v3/liveStreams",
  TRANSITION: "https://www.googleapis.com/youtube/v3/liveBroadcasts/transition",
  VIDEOS: "https://www.googleapis.com/youtube/v3/videos",
};
export const GOOGLE_API_SCOPES = {
  YT: "https://www.googleapis.com/auth/youtube",
  YT_FORCE_SSL: "https://www.googleapis.com/auth/youtube.force-ssl",
  USER_INFO_EMAIL: "https://www.googleapis.com/auth/userinfo.email",
  USER_INFO_PROFILE: "https://www.googleapis.com/auth/userinfo.profile",
};
export const APPLICATION_EVENT_TYPES = {
  GOOGLE_AUTH_REDIRECT: "google-auth-redirect",
};
export const APPLICATION_STORE_KEYS = {
  GOOGLE_AUTH_STATE: "google-auth-state",
  GOOGLE_CLIENT_AUTH_STATE: "google-client-auth-state",
};
export const BROADCAST_DEFAULT_BODY = {
  snippet: {
    title: "%s autovod | %s",
    description: `don't panic! this is an automated vod channel run by robo-cats that are still in BETA.\n\nThis channel is not affiliated with the featured creators: twitch.tv/%s`,
  },
  status: {
    privacyStatus: "unlisted",
    selfDeclaredMadeForKids: false,
  },
  contentDetails: {
    enableAutoStart: true,
    enableAutoStop: false,
    enableDvr: true,
    recordFromStart: true,
    monitorStream: {
      enableMonitorStream: false,
    },
  },
};
export const SCRIPTS = {
  PASSTHROUGH_HLS: "passthrough-hls.sh",
};
export const APP_COOKIES = {
  CLIENT_AUTH_STATE: "client-auth-state",
  CLIENT_AUTH_TOKEN: "client-auth-token",
};
export const TEMPLATES = {
  SIGN_IN: "sign-in.hbs",
  DASHBOARD_HOME: "dashboard-home.hbs",
  DASHBOARD_EVENT_LOG: "dashboard-event-log.hbs",
  DASHBOARD_RESTREAM: "dashboard-restream.hbs",
  DASHBOARD_STOP_STREAM: "dashboard-stop-stream.hbs",
  DASHBOARD_ACTIVE_BROADCASTS: "dashboard-active-broadcasts.hbs",
  DASHBOARD_MANAGE_TWITCH_SUBS: "dashboard-manage-twitch-subs.hbs",
};
export const GOOGLE_DISCOVERY_DOC_URL =
  "https://accounts.google.com/.well-known/openid-configuration";
export const JWKS_URI_KEY = "jwks_uri";
export const FFMPEG_EXIT_CODES = {
  SUCCESS: 0,
  STOPPED_BY_AUTOVOD: null,
  UNEXPECTED_EXIT: 146,
};
