import { Router } from "express";
import type { ConnectionsService } from "./connections.service.js";

export function createConnectionsRouter(_service: ConnectionsService): Router {
  return Router();
}
