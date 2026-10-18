import type { CarbLoadingService } from "../../carb-loading.service.js";

export function createMockCarbLoadingService(): CarbLoadingService {
  return { module: "carb-loading" };
}
