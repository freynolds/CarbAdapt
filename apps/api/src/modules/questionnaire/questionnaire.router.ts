import { Router } from "express";
import type { QuestionnaireService } from "./questionnaire.service.js";

export function createQuestionnaireRouter(_service: QuestionnaireService): Router {
  return Router();
}
