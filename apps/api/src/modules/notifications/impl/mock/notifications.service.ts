import type { NotificationsService } from "../../notifications.service.js";

export function createMockNotificationsService(): NotificationsService {
  return { module: "notifications" };
}
