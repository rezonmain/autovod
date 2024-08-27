import { ytAuth } from "../modules/yt-auth.js";
import { ytApi } from "../modules/yt-api.js";

const [accessTokenError, accessToken] = await ytAuth.getAccessToken();
if (accessTokenError) {
  console.error(`Authorization with google failed: ${accessTokenError}`);
}

const [streamsError, streams] = await ytApi.getStreams(accessToken, {
  part: ["snippet", "cdn", "status"],
  mine: true,
});
if (streamsError) {
  console.error(`An error occurred trying to fetch streams: ${streamsError}`);
}

for (const stream of streams) {
  console.log(
    `- ${stream.id} | ${stream.cdn.ingestionInfo.streamName} | ${stream.status.streamStatus}`
  );
}
