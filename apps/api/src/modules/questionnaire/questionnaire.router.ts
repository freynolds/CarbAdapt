import { Router } from "express";
import type { PrismaClient } from "@carbadapt/db";
import { requireUser } from "../../http/session.js";
import { createGetFeedbackHandler, createSubmitFeedbackHandler } from "./questionnaire.controller.js";
import type { QuestionnaireService } from "./questionnaire.service.js";

/** Mounted at /workouts, beside the workouts and fueling routers. */
export function createQuestionnaireRouter(service: QuestionnaireService, db: PrismaClient): Router {
  const router = Router();
  router.get("/:id/feedback", requireUser(db), createGetFeedbackHandler(service));
  router.post("/:id/feedback", requireUser(db), createSubmitFeedbackHandler(service));
  return router;
}
