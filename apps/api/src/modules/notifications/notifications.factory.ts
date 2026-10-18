import type { AppEnv } from "../../config/env.js";
import { createMockNotificationsService } from "./impl/mock/notifications.service.js";
import { createProductionNotificationsService } from "./impl/production/notifications.service.js";
import { createStagingNotificationsService } from "./impl/staging/notifications.service.js";
import type { NotificationsService } from "./notifications.service.js";

export function createNotificationsService(env: AppEnv): NotificationsService {
  switch (env) {
    case "mock":
      return createMockNotificationsService();
    case "staging":
      return createStagingNotificationsService();
    case "production":
      return createProductionNotificationsService();
  }
}
