import { Router } from "express";
import type { RequestHandler } from "express";
import { z } from "zod";

/** Liveness only. This does not check MySQL or any module. */
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
});

const getHealth: RequestHandler = (_req, res) => {
  const body = healthResponseSchema.parse({ status: "ok" });
  res.status(200).json(body);
};

export function createHealthRouter(): Router {
  const router = Router();
  router.get("/health", getHealth);
  return router;
}
