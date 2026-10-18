import { Router } from "express";
import { healthRouter } from "./health.js";

/**
 * Mount one router per area (workouts, products, races, ...) when those
 * endpoints arrive. Keep paths in the route files and work in the controllers.
 */
export const apiRouter = Router();

apiRouter.use(healthRouter);
