import { z } from "zod";
import type { RequestHandler } from "express";
import { parseInput } from "../../http/errors.js";
import { routeParam, userId } from "../../http/session.js";
import { patchMeSchema, patchPhysicalSchema, resolveConflictSchema } from "../../domain/schemas.js";
import { conflictListSchema, meResponseSchema, physicalResponseSchema } from "./profile.schema.js";
import type { ProfileService } from "./profile.service.js";

const deletedSchema = z.object({ deleted: z.literal(true) }).strict();
const resolvedSchema = z.object({ resolved: z.literal(true) }).strict();

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

export function createPatchMeHandler(service: ProfileService): RequestHandler {
  return async (req, res) => {
    const body = parseInput(patchMeSchema, req.body);
    res.status(200).json(meResponseSchema.parse(await service.patchMe(userId(req), body)));
  };
}

export function createDeleteMeHandler(service: ProfileService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(deletedSchema.parse(await service.deleteMe(userId(req))));
  };
}

export function createPatchPhysicalHandler(service: ProfileService): RequestHandler {
  return async (req, res) => {
    const body = parseInput(patchPhysicalSchema, req.body);
    res.status(200).json(physicalResponseSchema.parse(await service.patchPhysical(userId(req), body)));
  };
}

export function createResolveConflictHandler(service: ProfileService): RequestHandler {
  return async (req, res) => {
    const body = parseInput(resolveConflictSchema, req.body);
    const id = routeParam(req.params.id, "conflict id");
    res.status(200).json(resolvedSchema.parse(await service.resolveConflict(userId(req), id, body)));
  };
}
