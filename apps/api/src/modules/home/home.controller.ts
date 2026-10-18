import type { RequestHandler } from "express";
import { userId } from "../../http/session.js";
import { homeResponseSchema } from "./home.schema.js";
import type { HomeService } from "./home.service.js";

export function createGetHomeHandler(service: HomeService): RequestHandler {
  return async (req, res) => {
    res.status(200).json(homeResponseSchema.parse(await service.getHome(userId(req))));
  };
}
