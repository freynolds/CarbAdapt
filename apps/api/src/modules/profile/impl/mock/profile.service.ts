import type { ProfileService } from "../../profile.service.js";

export function createMockProfileService(): ProfileService {
  return { module: "profile" };
}
