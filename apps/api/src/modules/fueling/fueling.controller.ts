import type { RequestHandler } from "express";
import { parseInput } from "../../http/errors.js";
import { routeParam, userId } from "../../http/session.js";
import { patchFuelingSchema } from "../../domain/schemas.js";
import { fuelingPlanResponseSchema } from "./fueling.schema.js";
import type { FuelingService } from "./fueling.service.js";

export function createGetFuelingPlanHandler(service: FuelingService): RequestHandler {
  return async (req, res) => {
    const body = await service.getFuelingPlan(userId(req), routeParam(req.params.id, "workout id"));
    res.status(200).json(fuelingPlanResponseSchema.parse(body));
  };
}

export function createAdjustFuelingHandler(service: FuelingService): RequestHandler {
  return async (req, res) => {
    const body = parseInput(patchFuelingSchema, req.body);
    const id = routeParam(req.params.id, "workout id");
    res.status(200).json(fuelingPlanResponseSchema.parse(await service.adjustFueling(userId(req), id, body)));
  };
}
