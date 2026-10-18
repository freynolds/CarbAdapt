import type { RequestHandler } from "express";
import { userId } from "../../http/session.js";
import { gutPlanResponseSchema } from "./gut-training.schema.js";
import type { GutTrainingService } from "./gut-training.service.js";

export function createGetGutPlanHandler(service: GutTrainingService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(gutPlanResponseSchema.parse(await service.getPlan(userId(req))));
  };
}
