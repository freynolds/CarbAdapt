import { Router } from "express";
import type { NotificationsService } from "./notifications.service.js";

export function createNotificationsRouter(_service: NotificationsService): Router {
  return Router();
}
