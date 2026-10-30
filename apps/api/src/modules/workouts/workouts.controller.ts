import { z } from "zod";
import type { RequestHandler } from "express";
import { parseInput } from "../../http/errors.js";
import { routeParam, userId } from "../../http/session.js";
import { workoutBodySchema } from "../../domain/schemas.js";
import {
  workoutListSchema,
  workoutRangeQuerySchema,
  workoutResponseSchema,
} from "./workouts.schema.js";
import type { WorkoutsService } from "./workouts.service.js";

const deletedSchema = z.object({ deleted: z.literal(true) }).strict();

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

export function createCreateWorkoutHandler(service: WorkoutsService): RequestHandler {
  return async (req, res) => {
    const body = parseInput(workoutBodySchema, req.body);
    res.status(201).json(workoutResponseSchema.parse(await service.createWorkout(userId(req), body)));
  };
}

export function createUpdateWorkoutHandler(service: WorkoutsService): RequestHandler {
  return async (req, res) => {
    const body = parseInput(workoutBodySchema, req.body);
    const id = routeParam(req.params.id, "workout id");
    res.status(200).json(workoutResponseSchema.parse(await service.updateWorkout(userId(req), id, body)));
  };
}

export function createDeleteWorkoutHandler(service: WorkoutsService): RequestHandler {
  return async (req, res) => {
    const id = routeParam(req.params.id, "workout id");
    res.status(200).json(deletedSchema.parse(await service.deleteWorkout(userId(req), id)));
  };
}
