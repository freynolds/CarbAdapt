import type { HomeResponse } from "@carbadapt/contracts";

/**
 * Home composes profile, workouts, sweat tests, to-dos, products, containers, and races.
 * It does not own a table.
 */
export interface HomeService {
  getHome(userId: string): Promise<HomeResponse>;
}
