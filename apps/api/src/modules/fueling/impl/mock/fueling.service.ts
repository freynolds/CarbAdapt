import type { FuelingService } from "../../fueling.service.js";

export function createMockFuelingService(): FuelingService {
  return { module: "fueling" };
}
