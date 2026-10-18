import type { RequestHandler } from "express";
import { routeParam, userId } from "../../http/session.js";
import { containerListSchema, containerResponseSchema } from "./gear.schema.js";
import type { GearService } from "./gear.service.js";

export function createListContainersHandler(service: GearService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(containerListSchema.parse(await service.listContainers(userId(req))));
  };
}

export function createGetContainerHandler(service: GearService): RequestHandler {
  return async (req, res) => {
    const body = await service.getContainer(userId(req), routeParam(req.params.id, "container id"));
    res.status(200).json(containerResponseSchema.parse(body));
  };
}
