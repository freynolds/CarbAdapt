import type { RequestHandler } from "express";
import { routeParam, userId } from "../../http/session.js";
import { feedbackResponseSchema } from "./questionnaire.schema.js";
import type { QuestionnaireService } from "./questionnaire.service.js";

export function createGetFeedbackHandler(service: QuestionnaireService): RequestHandler {
  return async (req, res) => {
    const body = await service.getFeedback(userId(req), routeParam(req.params.id, "workout id"));
    res.status(200).json(feedbackResponseSchema.parse(body));
  };
}
