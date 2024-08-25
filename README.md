# Scripts

## `start` - Starts listening for webhooks

## `getid` - Get the `userid` from a login (twitch name)

`getid <LOGIN>`

```bash
% npm run getid hasanabi

207813352
```

## `listsubs` - List the current event webhooks you're subscribed to

`listsubs`

```bash
% npm run listsubs

1. 06b9c5ff-5e34-4bfe-abfc-b544e4db8c65 | PaymoneyWubby | stream.online | enabled
2. 3715ebf0-6c0a-4f00-834d-69822f084f8b | PaymoneyWubby | stream.offline | enabled
3. c16ca04e-be30-4341-8054-3d0fe9064756 | rezonmain | stream.online | enabled
4. 115dc981-0f25-43fd-a484-b4cfd2dad266 | rezonmain | stream.offline | enabled
```

## `deletesub` - Unsubscribe from an event webhook

`deletesub <SUBSCRIPTION_ID>`

```bash
% npm run deletesub 115dc981-0f25-43fd-a484-b4cfd2dad266

Subscription with id 115dc981-0f25-43fd-a484-b4cfd2dad266 deleted
```

## `createsub` - Subscribe to an event webhook

`createsub <SUBSCRIPTION_TYPE> <USER_ID>`

```bash
% npm run createsub stream.online 207813352
% npm run listsubs
[...]
4. e3852373-c37a-4a3f-9e2b-8b0a151f7d7d | HasanAbi | stream.online | webhook_callback_verification_pending
```

## `m3u8url` - Build the .m3u8 playlist file url from a login

`m3u8url <LOGIN>`

```bash
% npm run m3u8url h3h3productions

https://usher.ttvnw.net/api/channel/hls/h3h3productions.m3u8?client_id=kim[...]
```

## `restream` - Starts streaming to youtube from a twitch login

`restream <LOGIN>`

```bash
$ npm run restream h3h3productions

[hls @ 0x7f33f456a600]
Skip ('#EXT-X-TWITCH-INFO:NODE="video-edge-ee538e.iad05",MANIFEST-[...]
```

# Authenticating twitch stream

- Personal OAuth token can be read from the `auth-token` cookie saved on storage from https://twitch.tv
- Personal OAuth token is sent on the first GQL POST request the client makes (to fetch the playback access token) in the `Authorization` header prefixed by `OAuth`
- This token seems to expire, if this is the case, the mentioned request will return 401 for an invalid token, removing the token (writing `Authorization: undefined` in the headers) should work, but stream won't be authorized

# Authenticating with google

[Source](https://developers.google.com/identity/protocols/oauth2/web-server)

- Create project on [google's developer console](https://console.cloud.google.com)
- Enable the [youtube data api](https://console.cloud.google.com/apis/api/youtube.googleapis.com) for the project
- Head on to [credentials](https://console.cloud.google.com/apis/credentials) and create a new OAuth2 credential for a web application
- Add the redirect URLs
- Complete the OAuth concent screen setup
- Add testing user, should be the owner of the channel you'll be live streaming to
