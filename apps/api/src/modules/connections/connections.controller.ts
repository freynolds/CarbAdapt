import type { RequestHandler } from "express";
import { userId } from "../../http/session.js";
import { connectionListSchema } from "./connections.schema.js";
import type { ConnectionsService } from "./connections.service.js";

export function createListConnectionsHandler(service: ConnectionsService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(connectionListSchema.parse(await service.listConnections(userId(req))));
  };
}
