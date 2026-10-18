import express from "express";
import { readConfig, type AppConfig } from "./config/env.js";
import { composeApi } from "./compose.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";

/** Express app with no listener, so tests can call it without binding a port. */
export function createApp(config: AppConfig = readConfig()) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());
  app.use(composeApi(config.APP_ENV));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
