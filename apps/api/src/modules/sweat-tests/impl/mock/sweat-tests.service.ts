import type { SweatTestsService } from "../../sweat-tests.service.js";

export function createMockSweatTestsService(): SweatTestsService {
  return { module: "sweat-tests" };
}
