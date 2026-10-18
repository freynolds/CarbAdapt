import type { RacesService } from "../../races.service.js";

export function createMockRacesService(): RacesService {
  return { module: "races" };
}
