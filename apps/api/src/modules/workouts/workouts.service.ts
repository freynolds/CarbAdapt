import type { WorkoutList, WorkoutResponse } from "@carbadapt/contracts";
import type { z } from "zod";
import type { workoutBodySchema } from "../../domain/schemas.js";

export type WorkoutRange = {
  from?: string;
  to?: string;
};

/** Planned and manual workouts on a calendar range. */
export interface WorkoutsService {
  listWorkouts(userId: string, range: WorkoutRange): Promise<WorkoutList>;
  getWorkout(userId: string, id: string): Promise<WorkoutResponse>;
  createWorkout(userId: string, body: z.infer<typeof workoutBodySchema>): Promise<WorkoutResponse>;
  updateWorkout(userId: string, id: string, body: z.infer<typeof workoutBodySchema>): Promise<WorkoutResponse>;
  deleteWorkout(userId: string, id: string): Promise<{ deleted: true }>;
}
