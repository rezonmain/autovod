import express from "express";

export const pingController = express.Router();

pingController.get("/", (_, res) => {
  res.set("Content-Type", "application/json");
  const response = {
    ts: Date.now(),
    message: "pong",
  };
  res.send(JSON.stringify(response));
});
