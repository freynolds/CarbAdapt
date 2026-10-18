import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { HttpError } from "./http.js";
import { registerRoutes } from "./routes.js";

export function createApp(): Express {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(
    cors({
      origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
      credentials: true,
    }),
  );
  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "carbadapt-api", phase: "mock" });
  });
  registerRoutes(app);
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message, details: error.details ?? null });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Internal error" });
  });
  return app;
}
