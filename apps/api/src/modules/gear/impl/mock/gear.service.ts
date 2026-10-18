import type { GearService } from "../../gear.service.js";

export function createMockGearService(): GearService {
  return { module: "gear" };
}
