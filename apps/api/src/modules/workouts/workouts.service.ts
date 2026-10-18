import type { WorkoutList, WorkoutResponse } from "@carbadapt/contracts";

export type WorkoutRange = {
  from?: string;
  to?: string;
};

/** Planned and manual workouts on a calendar range. */
export interface WorkoutsService {
  listWorkouts(userId: string, range: WorkoutRange): Promise<WorkoutList>;
  getWorkout(userId: string, id: string): Promise<WorkoutResponse>;
}
