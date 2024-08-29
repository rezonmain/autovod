import path from "node:path";
import express from "express";
import { create } from "express-handlebars";
import { callbackTwitchController } from "../controllers/callback-twitch.controller.js";
import { callbackGoogleController } from "../controllers/callback-google.controller.js";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { pingController } from "../controllers/ping.controller.js";
import { env } from "../utils/env.js";
import { ENV_KEYS } from "../const.js";
import { log } from "./log.js";

const DIRNAME = process.cwd();
const VIEWS_PATH = path.resolve(DIRNAME, "views");

const s = express();

s.use("/ping", pingController);
s.use("/callback/twitch", callbackTwitchController);
s.use("/callback/google", callbackGoogleController);
s.use("/dashboard", dashboardController);
s.use("/public", express.static("./public"));

const hbs = create({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(VIEWS_PATH, "layouts"),
  partialsDir: path.join(VIEWS_PATH, "partials"),
});
s.engine(".hbs", hbs.engine);
s.set("view engine", ".hbs");
s.set("views", VIEWS_PATH);

const port = env(ENV_KEYS.APPLICATION_PORT);
const domainBaseUrl = env(ENV_KEYS.DOMAIN_BASE_URL);

function start() {
  s.listen(port, () => {
    log.info(`Server listening on ${domainBaseUrl}:${port}`);
  });
}

export const server = {
  start,
};
