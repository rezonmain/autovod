export const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
export const CACHE_KEYS = {
  TWITCH_ACCESS: "@twitch-access",
};
export const TWITCH_WEBHOOK_HEADERS = {
  MESSAGE_ID: "Twitch-Eventsub-Message-Id".toLowerCase(),
  MESSAGE_TIMESTAMP: "Twitch-Eventsub-Message-Timestamp".toLowerCase(),
  MESSAGE_SIGNATURE: "Twitch-Eventsub-Message-Signature".toLowerCase(),
};
export const TWITCH_WEBHOOK_HMAC_PREFIX = "sha256=";
