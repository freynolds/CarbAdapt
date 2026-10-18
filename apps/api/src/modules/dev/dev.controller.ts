import type { RequestHandler } from "express";
import { parseInput } from "../../http/errors.js";
import { sessionCookie } from "../../http/session.js";
import {
  devAthleteListSchema,
  devLoginBodySchema,
  devLoginResponseSchema,
  devResetResponseSchema,
} from "./dev.schema.js";
import type { DevService } from "./dev.service.js";

export function createLoginAsHandler(service: DevService): RequestHandler {
  return async (req, res) => {
    const body = parseInput(devLoginBodySchema, req.body);
    const result = devLoginResponseSchema.parse(await service.loginAs(body.athleteId));
    res.setHeader("Set-Cookie", sessionCookie(result.token));
    res.status(200).json(result);
  };
}

export function createListAthletesHandler(service: DevService): RequestHandler {
  return async (_req, res) => {
    res.status(200).json(devAthleteListSchema.parse(await service.listAthletes()));
  };
}

export function createResetHandler(service: DevService): RequestHandler {
  return async (_req, res) => {
    res.status(200).json(devResetResponseSchema.parse(await service.reset()));
  };
}
