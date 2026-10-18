import type { RequestHandler } from "express";
import { parseInput } from "../../http/errors.js";
import { routeParam, userId } from "../../http/session.js";
import {
  workoutListSchema,
  workoutRangeQuerySchema,
  workoutResponseSchema,
} from "./workouts.schema.js";
import type { WorkoutsService } from "./workouts.service.js";

export function createListWorkoutsHandler(service: WorkoutsService): RequestHandler {
  return async (req, res) => {
    const range = parseInput(workoutRangeQuerySchema, req.query);
    const body = await service.listWorkouts(userId(req), range);
    res.status(200).json(workoutListSchema.parse(body));
  };
}

export function createGetWorkoutHandler(service: WorkoutsService): RequestHandler {
  return async (req, res) => {
    const body = await service.getWorkout(userId(req), routeParam(req.params.id, "workout id"));
    res.status(200).json(workoutResponseSchema.parse(body));
  };
}
