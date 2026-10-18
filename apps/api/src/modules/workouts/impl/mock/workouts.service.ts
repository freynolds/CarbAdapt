import { HttpError, HttpErrorCode } from "../../../../http/errors.js";
import { parseDay } from "../../../../http/calendar.js";
import { presentWorkout, workoutInclude } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { WorkoutRange, WorkoutsService } from "../../workouts.service.js";

function dateFilter(range: WorkoutRange) {
  if (!range.from && !range.to) return undefined;
  return {
    gte: range.from ? parseDay(range.from) : undefined,
    lte: range.to ? parseDay(range.to) : undefined,
  };
}

export function createMockWorkoutsService(deps: ModuleDeps): WorkoutsService {
  const { db } = deps;
  return {
    async listWorkouts(userId, range) {
      const rows = await db.workout.findMany({
        where: { userId, plannedDate: dateFilter(range) },
        include: workoutInclude,
        orderBy: [{ plannedDate: "asc" }, { plannedStart: "asc" }],
      });
      return { workouts: rows.map(presentWorkout) };
    },
    async getWorkout(userId, id) {
      const row = await db.workout.findFirst({
        where: { id, userId },
        include: workoutInclude,
      });
      if (!row) throw new HttpError(HttpErrorCode.WorkoutNotFound);
      return { workout: presentWorkout(row) };
    },
  };
}
