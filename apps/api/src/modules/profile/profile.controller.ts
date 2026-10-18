import type { RequestHandler } from "express";
import { userId } from "../../http/session.js";
import { conflictListSchema, meResponseSchema, physicalResponseSchema } from "./profile.schema.js";
import type { ProfileService } from "./profile.service.js";

export function createGetMeHandler(service: ProfileService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(meResponseSchema.parse(await service.getMe(userId(req))));
  };
}

export function createGetPhysicalHandler(service: ProfileService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(physicalResponseSchema.parse(await service.getPhysical(userId(req))));
  };
}

export function createListConflictsHandler(service: ProfileService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(conflictListSchema.parse(await service.listConflicts(userId(req))));
  };
}
