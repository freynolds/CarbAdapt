import { ServiceStatus } from "@carbadapt/contracts";
import { Router } from "express";
import type { RequestHandler } from "express";
import { z } from "zod";

/** Liveness only. This does not check MySQL or any module. */
export const healthResponseSchema = z.object({
  status: z.literal(ServiceStatus.Ok),
});

const getHealth: RequestHandler = (_req, res) => {
  const body = healthResponseSchema.parse({ status: ServiceStatus.Ok });
  res.status(200).json(body);
};

export function createHealthRouter(): Router {
  const router = Router();
  router.get("/health", getHealth);
  return router;
}
