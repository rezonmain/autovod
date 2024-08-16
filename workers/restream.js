import { parentPort } from "node:worker_threads";

/**
 * @param {string} login
 */
function start(login) {
  console.log(
    `[${new Date().toISOString()}][RestreamWorker] Starting restream for ${login}`
  );
}

function stop() {
  console.log(
    `[${new Date().toISOString()}][RestreamWorker] Stopping restream`
  );
  process.exit();
}

parentPort.on("message", (data) => {
  const [type, payload] = data.split(":");

  switch (type) {
    case "START":
      start(payload);
      break;
    case "STOP":
      stop();
      break;
    default:
      console.log("Unknown command");
      break;
  }
});
