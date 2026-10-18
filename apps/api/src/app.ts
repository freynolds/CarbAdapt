import { PrismaClient } from "@carbadapt/db";
import express, { type Express } from "express";
import { readConfig, type AppConfig } from "./config/env.js";
import { composeApi } from "./compose.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";

const LOCAL_DATABASE_URL = "mysql://carbadapt:carbadapt@127.0.0.1:3306/carbadapt";

/** Express app with no listener, so tests can call it without binding a port. */
export function createApp(config: AppConfig = readConfig()): Express {
  process.env.DATABASE_URL ??= LOCAL_DATABASE_URL;
  const db = new PrismaClient();
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  try {
    app.use(composeApi(config.APP_ENV, db));
  } catch (error) {
    void db.$disconnect();
    throw error;
  }
  app.use(notFoundHandler);
  app.use(errorHandler);
  app.set("db", db);
  return app;
}

export function appDb(app: Express): PrismaClient {
  const db = app.get("db") as PrismaClient | undefined;
  if (!db) {
    throw new Error("database client is missing");
  }
  return db;
}
