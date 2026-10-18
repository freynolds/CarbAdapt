import type { GutTrainingService } from "../../gut-training.service.js";

export function createMockGutTrainingService(): GutTrainingService {
  return { module: "gut-training" };
}
