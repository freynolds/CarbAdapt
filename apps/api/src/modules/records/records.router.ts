import { Router } from "express";
import { z } from "zod";
import type { PrismaClient } from "@carbadapt/db";
import {
  containerResponseSchema,
  deletedResponseSchema,
  gutPlanResponseSchema,
  gutPreviewSchema,
  magicLinkSentSchema,
  notificationListSchema,
  oauthStartSchema,
  productResponseSchema,
  raceResponseSchema,
  sessionResponseSchema,
  stageRecoveryResponseSchema,
  startingPointSchema,
  sweatTestResponseSchema,
  webhookAckSchema,
} from "@carbadapt/contracts";
import {
  acceptWebhook,
  calibrateContainer,
  celebrate,
  chooseStrategy,
  claimOnboarding,
  connectProvider,
  createContainer,
  createProduct,
  createRace,
  createSweat,
  completeSweat,
  deleteContainer,
  deleteProduct,
  deleteRace,
  disconnectProvider,
  dismissRehearsal,
  generateStrategy,
  markSweatNotCompleted,
  recordSweat,
  restoreRehearsal,
  listNotifications,
  logout,
  markNotificationRead,
  patchRecovery,
  patchTodo,
  previewGut,
  putGutPlan,
  requestMagicLink,
  saveOnboarding,
  startSweat,
  startingPointFor,
  updateContainer,
  updateProduct,
  updateRace,
  verifyMagicLink,
} from "../../domain/commands.js";
import {
  calibrationBodySchema,
  claimSchema,
  containerBodySchema,
  deleteProductSchema,
  gutBodySchema,
  magicLinkSchema,
  magicVerifySchema,
  onboardingSchema,
  productBodySchema,
  providerSchema,
  raceBodySchema,
  recoveryPatchSchema,
  startingPointBodySchema,
  sweatCompleteSchema,
  sweatCreateSchema,
  sweatRecordSchema,
  sweatStartSchema,
  todoPatchSchema,
  webhookBodySchema,
} from "../../domain/schemas.js";
import { parseInput } from "../../http/errors.js";
import { readToken, requireUser, routeParam, sessionCookie, userId } from "../../http/session.js";
import { createAdapters } from "@carbadapt/integrations";
import { HttpError, HttpErrorCode } from "../../http/errors.js";
import { recentMagicLinks } from "../../domain/magic.js";
import { runDueJobs } from "../../domain/runner.js";

const savedSchema = z.object({ saved: z.literal(true) }).strict();
const claimedSchema = z.object({ claimed: z.literal(true) }).strict();
const connectedSchema = z.object({ connected: z.boolean() }).strict();
const todoOneSchema = z.object({
  todo: z.object({ id: z.string(), status: z.string() }).passthrough(),
});
const achievementOneSchema = z.object({ achievement: z.object({ id: z.string() }).passthrough() });
const magicListSchema = z
  .object({
    links: z.array(
      z.object({ email: z.string(), url: z.string(), createdAt: z.string() }).strict(),
    ),
  })
  .strict();
const tickSchema = z.object({ delivered: z.number().int(), webhooks: z.number().int() }).strict();

/** Write routes that sit on the same mounts as the read modules. */
export function createRecordsRouter(db: PrismaClient): Router {
  const router = Router();
  const authed = requireUser(db);

  router.post("/products", authed, async (req, res) => {
    const body = parseInput(productBodySchema, req.body);
    res.status(201).json(productResponseSchema.parse(await createProduct(db, userId(req), body)));
  });
  router.patch("/products/:id", authed, async (req, res) => {
    const body = parseInput(productBodySchema, req.body);
    res
      .status(200)
      .json(
        productResponseSchema.parse(
          await updateProduct(db, userId(req), routeParam(req.params.id, "product id"), body),
        ),
      );
  });
  router.delete("/products/:id", authed, async (req, res) => {
    const body = parseInput(deleteProductSchema, req.body ?? {});
    res
      .status(200)
      .json(
        deletedResponseSchema.parse(
          await deleteProduct(
            db,
            userId(req),
            routeParam(req.params.id, "product id"),
            body.replacementId,
          ),
        ),
      );
  });

  router.post("/containers", authed, async (req, res) => {
    const body = parseInput(containerBodySchema, req.body);
    res
      .status(201)
      .json(containerResponseSchema.parse(await createContainer(db, userId(req), body)));
  });
  router.patch("/containers/:id", authed, async (req, res) => {
    const body = parseInput(containerBodySchema, req.body);
    res
      .status(200)
      .json(
        containerResponseSchema.parse(
          await updateContainer(db, userId(req), routeParam(req.params.id, "container id"), body),
        ),
      );
  });
  router.delete("/containers/:id", authed, async (req, res) => {
    res
      .status(200)
      .json(
        deletedResponseSchema.parse(
          await deleteContainer(db, userId(req), routeParam(req.params.id, "container id")),
        ),
      );
  });
  router.post("/containers/:id/calibrations", authed, async (req, res) => {
    const body = parseInput(calibrationBodySchema, req.body);
    res
      .status(201)
      .json(
        containerResponseSchema.parse(
          await calibrateContainer(
            db,
            userId(req),
            routeParam(req.params.id, "container id"),
            body,
          ),
        ),
      );
  });

  router.post("/races", authed, async (req, res) => {
    const body = parseInput(raceBodySchema, req.body);
    res.status(201).json(raceResponseSchema.parse(await createRace(db, userId(req), body)));
  });
  router.patch("/races/:id", authed, async (req, res) => {
    const body = parseInput(raceBodySchema, req.body);
    res
      .status(200)
      .json(
        raceResponseSchema.parse(
          await updateRace(db, userId(req), routeParam(req.params.id, "race id"), body),
        ),
      );
  });
  router.delete("/races/:id", authed, async (req, res) => {
    res
      .status(200)
      .json(
        deletedResponseSchema.parse(
          await deleteRace(db, userId(req), routeParam(req.params.id, "race id")),
        ),
      );
  });
  router.post("/races/:id/strategies/generate", authed, async (req, res) => {
    res
      .status(201)
      .json(
        raceResponseSchema.parse(
          await generateStrategy(db, userId(req), routeParam(req.params.id, "race id")),
        ),
      );
  });
  router.post("/races/:id/strategies/:sid/choose", authed, async (req, res) => {
    res
      .status(200)
      .json(
        raceResponseSchema.parse(
          await chooseStrategy(
            db,
            userId(req),
            routeParam(req.params.id, "race id"),
            routeParam(req.params.sid, "strategy id"),
          ),
        ),
      );
  });
  router.post("/races/:id/rehearsal/dismiss", authed, async (req, res) => {
    res
      .status(200)
      .json(
        raceResponseSchema.parse(
          await dismissRehearsal(db, userId(req), routeParam(req.params.id, "race id")),
        ),
      );
  });
  router.post("/races/:id/rehearsal/restore", authed, async (req, res) => {
    res
      .status(200)
      .json(
        raceResponseSchema.parse(
          await restoreRehearsal(db, userId(req), routeParam(req.params.id, "race id")),
        ),
      );
  });
  router.patch("/races/stages/:stageId/recovery", authed, async (req, res) => {
    const body = parseInput(recoveryPatchSchema, req.body);
    res
      .status(200)
      .json(
        stageRecoveryResponseSchema.parse(
          await patchRecovery(db, userId(req), routeParam(req.params.stageId, "stage id"), body),
        ),
      );
  });

  router.put("/gut-plan", authed, async (req, res) => {
    const body = parseInput(gutBodySchema, req.body);
    res.status(200).json(gutPlanResponseSchema.parse(await putGutPlan(db, userId(req), body)));
  });
  router.post("/gut-plan/preview", authed, async (req, res) => {
    const body = parseInput(gutBodySchema, req.body);
    res.status(200).json(gutPreviewSchema.parse(previewGut(body)));
  });
  router.post("/gut-plan/starting-point", authed, async (req, res) => {
    const body = parseInput(startingPointBodySchema, req.body);
    res.status(200).json(startingPointSchema.parse(await startingPointFor(db, userId(req), body)));
  });

  router.post("/sweat-tests", authed, async (req, res) => {
    const body = parseInput(sweatCreateSchema, req.body);
    res.status(201).json(sweatTestResponseSchema.parse(await createSweat(db, userId(req), body)));
  });
  router.post("/sweat-tests/:id/start", authed, async (req, res) => {
    const body = parseInput(sweatStartSchema, req.body);
    res
      .status(200)
      .json(
        sweatTestResponseSchema.parse(
          await startSweat(db, userId(req), routeParam(req.params.id, "sweat test id"), body),
        ),
      );
  });
  router.post("/sweat-tests/:id/record", authed, async (req, res) => {
    const body = parseInput(sweatRecordSchema, req.body);
    res
      .status(200)
      .json(
        sweatTestResponseSchema.parse(
          await recordSweat(db, userId(req), routeParam(req.params.id, "sweat test id"), body),
        ),
      );
  });
  router.post("/sweat-tests/:id/not-completed", authed, async (req, res) => {
    res
      .status(200)
      .json(
        sweatTestResponseSchema.parse(
          await markSweatNotCompleted(db, userId(req), routeParam(req.params.id, "sweat test id")),
        ),
      );
  });
  router.post("/sweat-tests/:id/complete", authed, async (req, res) => {
    const body = parseInput(sweatCompleteSchema, req.body);
    res
      .status(200)
      .json(
        sweatTestResponseSchema.parse(
          await completeSweat(db, userId(req), routeParam(req.params.id, "sweat test id"), body),
        ),
      );
  });

  router.patch("/todos/:id", authed, async (req, res) => {
    const body = parseInput(todoPatchSchema, req.body);
    res
      .status(200)
      .json(
        todoOneSchema.parse(
          await patchTodo(db, userId(req), routeParam(req.params.id, "todo id"), body),
        ),
      );
  });
  router.post("/achievements/:id/celebrated", authed, async (req, res) => {
    res
      .status(200)
      .json(
        achievementOneSchema.parse(
          await celebrate(db, userId(req), routeParam(req.params.id, "achievement id")),
        ),
      );
  });

  router.post("/connections/:provider", authed, async (req, res) => {
    const provider = parseInput(providerSchema, routeParam(req.params.provider, "provider"));
    res.status(200).json(connectedSchema.parse(await connectProvider(db, userId(req), provider)));
  });
  router.delete("/connections/:provider", authed, async (req, res) => {
    const provider = parseInput(providerSchema, routeParam(req.params.provider, "provider"));
    res
      .status(200)
      .json(connectedSchema.parse(await disconnectProvider(db, userId(req), provider)));
  });

  router.get("/notifications", authed, async (req, res) => {
    res.status(200).json(notificationListSchema.parse(await listNotifications(db, userId(req))));
  });
  router.post("/notifications/:id/read", authed, async (req, res) => {
    res
      .status(200)
      .json(
        notificationListSchema.parse(
          await markNotificationRead(db, userId(req), routeParam(req.params.id, "notification id")),
        ),
      );
  });

  router.post("/auth/magic-link", async (req, res) => {
    const body = parseInput(magicLinkSchema, req.body);
    res.status(200).json(magicLinkSentSchema.parse(await requestMagicLink(db, body)));
  });
  router.post("/auth/magic-link/verify", async (req, res) => {
    const body = parseInput(magicVerifySchema, req.body);
    const result = sessionResponseSchema.parse(await verifyMagicLink(db, body));
    res.setHeader("Set-Cookie", sessionCookie(result.token));
    res.status(200).json(result);
  });
  router.post("/auth/logout", authed, async (req, res) => {
    res.status(200).json(deletedResponseSchema.parse(await logout(db, readToken(req))));
  });
  router.get("/auth/:provider/start", async (req, res) => {
    const provider = parseInput(
      providerSchema,
      routeParam(req.params.provider, "provider").toUpperCase(),
    );
    if (provider === "GARMIN" && process.env.GARMIN_ENABLED !== "true") {
      throw new HttpError(HttpErrorCode.ProviderDisabled);
    }
    const adapters = createAdapters(
      "mock",
      undefined,
      `http://127.0.0.1:${process.env.API_PORT ?? "4050"}`,
    );
    const started = await adapters[provider].startUrl({
      redirectUri: `http://127.0.0.1:3050/auth/callback/${provider.toLowerCase()}`,
      state: "local",
    });
    res.status(200).json(oauthStartSchema.parse(started));
  });
  router.get("/auth/:provider/callback", async (req, res) => {
    const provider = parseInput(
      providerSchema,
      routeParam(req.params.provider, "provider").toUpperCase(),
    );
    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (code !== "mock") throw new HttpError(HttpErrorCode.NotImplemented);
    const adapters = createAdapters("mock");
    await adapters[provider].exchangeCode({ code, redirectUri: "http://127.0.0.1:3050" });
    res
      .status(200)
      .json(oauthStartSchema.parse({ url: `/auth/callback/${provider.toLowerCase()}` }));
  });

  router.post("/onboarding/answers", async (req, res) => {
    const body = parseInput(onboardingSchema, req.body);
    res.status(200).json(savedSchema.parse(await saveOnboarding(db, body)));
  });
  router.post("/onboarding/claim", authed, async (req, res) => {
    const body = parseInput(claimSchema, req.body);
    res.status(200).json(claimedSchema.parse(await claimOnboarding(db, userId(req), body)));
  });

  router.post("/webhooks/:provider", async (req, res) => {
    const provider = parseInput(
      providerSchema,
      routeParam(req.params.provider, "provider").toUpperCase(),
    );
    const body = parseInput(webhookBodySchema, req.body);
    res.status(200).json(webhookAckSchema.parse(await acceptWebhook(db, provider, body)));
  });

  return router;
}

export function createDevExtraRouter(db: PrismaClient): Router {
  const router = Router();
  router.get("/magic-links", (_req, res) => {
    res.status(200).json(magicListSchema.parse({ links: recentMagicLinks() }));
  });
  router.post("/jobs/tick", async (_req, res) => {
    res.status(200).json(tickSchema.parse(await runDueJobs(db)));
  });
  return router;
}
