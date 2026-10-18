import { Router } from "express";
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
import { createFoodsRouter } from "./modules/foods/foods.router.js";
import { createFoodsService } from "./modules/foods/foods.factory.js";
import { createFuelingRouter } from "./modules/fueling/fueling.router.js";
import { createFuelingService } from "./modules/fueling/fueling.factory.js";
import { createGearRouter } from "./modules/gear/gear.router.js";
import { createGearService } from "./modules/gear/gear.factory.js";
import { createGutTrainingRouter } from "./modules/gut-training/gut-training.router.js";
import { createGutTrainingService } from "./modules/gut-training/gut-training.factory.js";
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
import { createWorkoutsRouter } from "./modules/workouts/workouts.router.js";
import { createWorkoutsService } from "./modules/workouts/workouts.factory.js";

/**
 * Builds every module from its factory and mounts every router.
 * Staging and production factories throw "not implemented", so only mock finishes booting.
 *
 * Fueling and questionnaire share the /workouts prefix with workouts, and carb loading
 * shares /races with races. Those modules have no routes yet, so nothing overlaps.
 */
export function composeApi(env: AppEnv): Router {
  const router = Router();
  router.use(createHealthRouter());
  router.use("/auth", createAuthRouter(createAuthService(env)));
  router.use("/me", createProfileRouter(createProfileService(env)));
  router.use("/workouts", createWorkoutsRouter(createWorkoutsService(env)));
  router.use("/workouts", createFuelingRouter(createFuelingService(env)));
  router.use("/containers", createGearRouter(createGearService(env)));
  router.use("/products", createProductsRouter(createProductsService(env)));
  router.use("/foods", createFoodsRouter(createFoodsService(env)));
  router.use("/races", createRacesRouter(createRacesService(env)));
  router.use("/races", createCarbLoadingRouter(createCarbLoadingService(env)));
  router.use("/gut-plan", createGutTrainingRouter(createGutTrainingService(env)));
  router.use("/sweat-tests", createSweatTestsRouter(createSweatTestsService(env)));
  router.use("/workouts", createQuestionnaireRouter(createQuestionnaireService(env)));
  router.use("/achievements", createAchievementsRouter(createAchievementsService(env)));
  router.use("/notifications", createNotificationsRouter(createNotificationsService(env)));
  router.use("/connections", createConnectionsRouter(createConnectionsService(env)));
  return router;
}
