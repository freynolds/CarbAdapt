import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/index.js";
import { apiRouter } from "./routes/index.js";

/** Express app with no listener, so tests can call it without binding a port. */
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());
  app.use(apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
