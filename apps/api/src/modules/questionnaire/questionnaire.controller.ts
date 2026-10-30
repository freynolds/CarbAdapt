import type { RequestHandler } from "express";
import { parseInput } from "../../http/errors.js";
import { routeParam, userId } from "../../http/session.js";
import { feedbackBodySchema } from "../../domain/schemas.js";
import { feedbackResponseSchema } from "./questionnaire.schema.js";
import type { QuestionnaireService } from "./questionnaire.service.js";

export function createGetFeedbackHandler(service: QuestionnaireService): RequestHandler {
  return async (req, res) => {
    const body = await service.getFeedback(userId(req), routeParam(req.params.id, "workout id"));
    res.status(200).json(feedbackResponseSchema.parse(body));
  };
}

export function createSubmitFeedbackHandler(service: QuestionnaireService): RequestHandler {
  return async (req, res) => {
    const body = parseInput(feedbackBodySchema, req.body);
    const id = routeParam(req.params.id, "workout id");
    const saved = await service.submitFeedback(userId(req), id, body);
    res.status(saved.created ? 201 : 200).json(feedbackResponseSchema.parse(saved.body));
  };
}
