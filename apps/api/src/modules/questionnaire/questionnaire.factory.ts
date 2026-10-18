import type { AppEnv } from "../../config/env.js";
import type { ModuleDeps } from "../deps.js";
import { createMockQuestionnaireService } from "./impl/mock/questionnaire.service.js";
import { createProductionQuestionnaireService } from "./impl/production/questionnaire.service.js";
import { createStagingQuestionnaireService } from "./impl/staging/questionnaire.service.js";
import type { QuestionnaireService } from "./questionnaire.service.js";

export function createQuestionnaireService(env: AppEnv, deps: ModuleDeps): QuestionnaireService {
  switch (env) {
    case "mock":
      return createMockQuestionnaireService(deps);
    case "staging":
      return createStagingQuestionnaireService();
    case "production":
      return createProductionQuestionnaireService();
  }
}
