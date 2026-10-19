import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import type { AppEnv } from "./config/env.js";
import { createHealthRouter } from "./http/health.js";
import { createAchievementsRouter } from "./modules/achievements/achievements.router.js";
import { createAchievementsService } from "./modules/achievements/achievements.factory.js";
import { createAuthRouter } from "./modules/auth/auth.router.js";
import { createAuthService } from "./modules/auth/auth.factory.js";
import { createCarbLoadingRouter } from "./modules/carb-loading/carb-loading.router.js";
import { createCarbLoadingService } from "./modules/carb-loading/carb-loading.factory.js";
import { createConnectionsRouter } from "./modules/connections/connections.router.js";
import { createConnectionsService } from "./modules/connections/connections.factory.js";
import { createDevRouter } from "./modules/dev/dev.router.js";
import { createDevService } from "./modules/dev/dev.factory.js";
import { createFoodsRouter } from "./modules/foods/foods.router.js";
import { createFoodsService } from "./modules/foods/foods.factory.js";
import { createFuelingRouter } from "./modules/fueling/fueling.router.js";
import { createFuelingService } from "./modules/fueling/fueling.factory.js";
import { createGearRouter } from "./modules/gear/gear.router.js";
import { createGearService } from "./modules/gear/gear.factory.js";
import { createGutTrainingRouter } from "./modules/gut-training/gut-training.router.js";
import { createGutTrainingService } from "./modules/gut-training/gut-training.factory.js";
import { createHomeRouter } from "./modules/home/home.router.js";
import { createHomeService } from "./modules/home/home.factory.js";
import { createNotificationsRouter } from "./modules/notifications/notifications.router.js";
import { createNotificationsService } from "./modules/notifications/notifications.factory.js";
import { createProductsRouter } from "./modules/products/products.router.js";
import { createProductsService } from "./modules/products/products.factory.js";
import { createProfileRouter } from "./modules/profile/profile.router.js";
import { createProfileService } from "./modules/profile/profile.factory.js";
import { createQuestionnaireRouter } from "./modules/questionnaire/questionnaire.router.js";
import { createQuestionnaireService } from "./modules/questionnaire/questionnaire.factory.js";
import { createRacesRouter } from "./modules/races/races.router.js";
import { createRacesService } from "./modules/races/races.factory.js";
import { createSweatTestsRouter } from "./modules/sweat-tests/sweat-tests.router.js";
import { createSweatTestsService } from "./modules/sweat-tests/sweat-tests.factory.js";
import { createTodosRouter } from "./modules/todos/todos.router.js";
import { createTodosService } from "./modules/todos/todos.factory.js";
import { createRecordsRouter, createDevExtraRouter } from "./modules/records/records.router.js";
import { createWorkoutsRouter } from "./modules/workouts/workouts.router.js";
import { createWorkoutsService } from "./modules/workouts/workouts.factory.js";

/**
 * Builds every module from its factory and mounts every router.
 * Staging and production factories throw HttpErrorCode.NotImplemented, so only mock finishes booting.
 * Dev routes are mounted only for mock, even after the other environments exist.
 *
 * Fueling and questionnaire share /workouts with workouts. Carb loading shares /races with races.
 */
export function composeApi(env: AppEnv, db: PrismaClient): Router {
  const deps = { db };
  const profile = createProfileService(env, deps);
  const workouts = createWorkoutsService(env, deps);
  const sweatTests = createSweatTestsService(env, deps);
  const todos = createTodosService(env, deps);
  const products = createProductsService(env, deps);
  const gear = createGearService(env, deps);
  const races = createRacesService(env, deps);
  const home = createHomeService(env, {
    profile,
    workouts,
    sweatTests,
    todos,
    products,
    gear,
    races,
  });

  const router = Router();
  router.use(createHealthRouter());
  if (env === "mock") {
    router.use("/dev", createDevRouter(createDevService(env, deps)));
    router.use("/dev", createDevExtraRouter(db));
  }
  router.use("/auth", createAuthRouter(createAuthService(env)));
  router.use("/me", createProfileRouter(profile, db));
  router.use("/workouts", createWorkoutsRouter(workouts, db));
  router.use("/workouts", createFuelingRouter(createFuelingService(env, deps), db));
  router.use("/containers", createGearRouter(gear, db));
  router.use("/products", createProductsRouter(products, db));
  router.use("/foods", createFoodsRouter(createFoodsService(env, deps)));
  router.use("/races", createRacesRouter(races, db));
  router.use("/races", createCarbLoadingRouter(createCarbLoadingService(env, deps), db));
  router.use("/gut-plan", createGutTrainingRouter(createGutTrainingService(env, deps), db));
  router.use("/sweat-tests", createSweatTestsRouter(sweatTests, db));
  router.use("/workouts", createQuestionnaireRouter(createQuestionnaireService(env, deps), db));
  router.use("/achievements", createAchievementsRouter(createAchievementsService(env, deps), db));
  router.use("/notifications", createNotificationsRouter(createNotificationsService(env)));
  router.use("/connections", createConnectionsRouter(createConnectionsService(env, deps), db));
  router.use("/todos", createTodosRouter(todos, db));
  router.use(createHomeRouter(home, db));
  router.use(createRecordsRouter(db));
  return router;
}
