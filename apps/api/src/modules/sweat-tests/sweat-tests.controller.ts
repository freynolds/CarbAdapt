import type { RequestHandler } from "express";
import { routeParam, userId } from "../../http/session.js";
import { sweatTestListSchema, sweatTestResponseSchema } from "./sweat-tests.schema.js";
import type { SweatTestsService } from "./sweat-tests.service.js";

export function createListSweatTestsHandler(service: SweatTestsService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(sweatTestListSchema.parse(await service.listSweatTests(userId(req))));
  };
}

export function createGetSweatTestHandler(service: SweatTestsService): RequestHandler {
  return async (req, res) => {
    const body = await service.getSweatTest(
      userId(req),
      routeParam(req.params.id, "sweat test id"),
    );
    res.status(200).json(sweatTestResponseSchema.parse(body));
  };
}
