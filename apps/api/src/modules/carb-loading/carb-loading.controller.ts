import type { RequestHandler } from "express";
import { routeParam, userId } from "../../http/session.js";
import { breakfastResponseSchema, loadingDayResponseSchema } from "./carb-loading.schema.js";
import type { CarbLoadingService } from "./carb-loading.service.js";

export function createGetLoadingDayHandler(service: CarbLoadingService): RequestHandler {
  return async (req, res) => {
    const body = await service.getLoadingDay(
      userId(req),
      routeParam(req.params.raceId, "race id"),
      routeParam(req.params.day, "loading day"),
    );
    res.status(200).json(loadingDayResponseSchema.parse(body));
  };
}

export function createGetBreakfastHandler(service: CarbLoadingService): RequestHandler {
  return async (req, res) => {
    const body = await service.getBreakfast(userId(req), routeParam(req.params.raceId, "race id"));
    res.status(200).json(breakfastResponseSchema.parse(body));
  };
}
