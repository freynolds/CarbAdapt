import type { QuestionnaireService } from "../../questionnaire.service.js";

export function createMockQuestionnaireService(): QuestionnaireService {
  return { module: "questionnaire" };
}
