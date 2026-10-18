import type { RequestHandler } from "express";
import { routeParam, userId } from "../../http/session.js";
import { raceListSchema, raceResponseSchema, stageRecoveryResponseSchema } from "./races.schema.js";
import type { RacesService } from "./races.service.js";

export function createListRacesHandler(service: RacesService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(raceListSchema.parse(await service.listRaces(userId(req))));
  };
}

export function createGetRaceHandler(service: RacesService): RequestHandler {
  return async (req, res) => {
    const body = await service.getRace(userId(req), routeParam(req.params.id, "race id"));
    res.status(200).json(raceResponseSchema.parse(body));
  };
}

export function createGetStageRecoveryHandler(service: RacesService): RequestHandler {
  return async (req, res) => {
    const body = await service.getStageRecovery(
      userId(req),
      routeParam(req.params.stageId, "stage id"),
    );
    res.status(200).json(stageRecoveryResponseSchema.parse(body));
  };
}
