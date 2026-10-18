import type { WorkoutsService } from "../../workouts.service.js";

export function createMockWorkoutsService(): WorkoutsService {
  return { module: "workouts" };
}
