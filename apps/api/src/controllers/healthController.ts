import type { RequestHandler } from "express";
import { healthResponseSchema } from "../schemas/health.js";

export const getHealth: RequestHandler = (_req, res) => {
  const body = healthResponseSchema.parse({ status: "ok" });
  res.status(200).json(body);
};
