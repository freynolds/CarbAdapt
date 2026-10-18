import { randomBytes } from "node:crypto";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { Prisma, prisma, resetDemoData } from "@carbadapt/db";
import {
  DEMO_ISOTONIC_SODIUM_MG_PER_L,
  ENGINE_VERSION,
  FOODS,
  makeClock,
  sweatRateLPerH,
  tooFastPreview,
} from "@carbadapt/fixtures";
import {
  ATHLETES,
  HttpError,
  asyncRoute,
  athleteEmail,
  attachUser,
  containsId,
  hashToken,
  newToken,
  replaceId,
  sessionCookie,
  type AuthedRequest,
} from "./http.js";
import {
  day,
  iso,
  num,
  presentContainer,
  presentFood,
  presentFueling,
  presentPhysical,
  presentProduct,
  presentSweat,
  presentTodo,
  presentUser,
  presentWorkout,
} from "./present.js";

const workoutInclude = { fuelingPlans: true, feedback: true, activity: true } as const;
const containerInclude = { calibrations: true } as const;

const PROVIDERS = ["GARMIN", "TRAININGPEAKS", "STRAVA"] as const;

function nid(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new HttpError(400, "Invalid request", result.error.flatten());
  }
  return result.data;
}

function parseDay(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, "Date must be YYYY-MM-DD.");
  }
  return new Date(`${value}T00:00:00.000Z`);
}

function uid(req: Request): string {
  return (req as AuthedRequest).userId;
}

function devOnly(req: Request, res: Response, next: (error?: unknown) => void) {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  next();
}

function hourInZone(date: Date, timeZone: string): number {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .find((item) => item.type === "hour");
  return Number(part?.value ?? "0");
}

function asRecord(value: Prisma.JsonValue | null): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
}

function jsonNumber(value: Prisma.JsonValue): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function loadingDayParam(raw: string): "D_MINUS_2" | "D_MINUS_1" {
  const key = raw.toUpperCase().replace(/-/g, "_");
  if (key === "D_2" || key === "D_MINUS_2" || key === "DMINUS2") return "D_MINUS_2";
  if (key === "D_1" || key === "D_MINUS_1" || key === "DMINUS1") return "D_MINUS_1";
  throw new HttpError(400, "Loading day must be d-2 or d-1.");
}

async function loadWorkout(userId: string, id: string) {
  const row = await prisma.workout.findFirst({
    where: { id, userId },
    include: workoutInclude,
  });
  if (!row) throw new HttpError(404, "Workout not found.");
  return row;
}

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function registerRoutes(app: Express) {
  app.post(
    "/dev/login-as",
    devOnly,
    asyncRoute(async (req, res) => {
      const body = parse(z.object({ athlete: z.enum(ATHLETES) }), req.body);
      const user = await prisma.user.findUnique({ where: { email: athleteEmail(body.athlete) } });
      if (!user) throw new HttpError(404, "Demo athlete is not seeded.");
      if (user.deletedAt) {
        await prisma.user.update({ where: { id: user.id }, data: { deletedAt: null } });
        user.deletedAt = null;
      }
      const token = newToken();
      await prisma.session.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
      res.setHeader("Set-Cookie", sessionCookie(token));
      res.json({ token, user: presentUser(user) });
    }),
  );

  app.post(
    "/dev/reset",
    devOnly,
    asyncRoute(async (_req, res) => {
      await resetDemoData(prisma);
      res.json({ ok: true, seededAt: new Date().toISOString() });
    }),
  );

  app.get(
    "/dev/athletes",
    devOnly,
    asyncRoute(async (_req, res) => {
      const users = await prisma.user.findMany({ orderBy: { email: "asc" } });
      res.json({
        athletes: users.map((user) => ({
          key: user.email?.split("@")[0] ?? null,
          ...presentUser(user),
        })),
      });
    }),
  );

  app.get(
    "/me",
    attachUser,
    asyncRoute(async (req, res) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: uid(req) },
        include: { physical: true, subscription: true },
      });
      res.json({
        user: presentUser(user),
        physical: presentPhysical(user.physical),
        subscription: user.subscription ? { status: user.subscription.status } : null,
      });
    }),
  );

  app.patch(
    "/me",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(
        z
          .object({
            locale: z.enum(["EN_US", "ES", "PT"]).optional(),
            theme: z.enum(["SYSTEM", "LIGHT", "DARK"]).optional(),
            timezone: z.string().min(1).optional(),
            mode: z.enum(["FUEL_MY_WORKOUTS", "GUT_TRAINING"]).nullable().optional(),
            briefingTimeLocal: z
              .string()
              .regex(/^\d{2}:\d{2}$/)
              .nullable()
              .optional(),
            briefingDayBefore: z.boolean().optional(),
          })
          .strict(),
        req.body,
      );
      const user = await prisma.user.update({ where: { id: uid(req) }, data: body });
      res.json({ user: presentUser(user) });
    }),
  );

  app.delete(
    "/me",
    attachUser,
    asyncRoute(async (req, res) => {
      const user = await prisma.user.update({
        where: { id: uid(req) },
        data: { deletedAt: new Date() },
      });
      res.json({ user: presentUser(user) });
    }),
  );

  app.get(
    "/me/physical-data",
    attachUser,
    asyncRoute(async (req, res) => {
      const row = await prisma.physicalData.findUnique({ where: { userId: uid(req) } });
      res.json({ physical: presentPhysical(row) });
    }),
  );

  app.patch(
    "/me/physical-data",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(
        z
          .object({
            weightKg: z.number().positive().nullable().optional(),
            ftpW: z.number().int().positive().nullable().optional(),
            sweatRateLPerH: z.number().nonnegative().nullable().optional(),
            sweatRateSource: z.string().nullable().optional(),
            ghTolerance: z.number().int().nonnegative().nullable().optional(),
            maxHr: z.number().int().positive().nullable().optional(),
            hrZones: z.unknown().nullable().optional(),
            age: z.number().int().positive().nullable().optional(),
            sex: z.string().nullable().optional(),
            heightCm: z.number().int().positive().nullable().optional(),
          })
          .strict(),
        req.body,
      );
      const data = {
        ...body,
        hrZones: body.hrZones === undefined ? undefined : (body.hrZones as Prisma.InputJsonValue),
      };
      const row = await prisma.physicalData.upsert({
        where: { userId: uid(req) },
        create: { userId: uid(req), ...data },
        update: data,
      });
      res.json({ physical: presentPhysical(row) });
    }),
  );

  app.get(
    "/me/conflicts",
    attachUser,
    asyncRoute(async (req, res) => {
      const rows = await prisma.physicalDataConflict.findMany({
        where: { userId: uid(req) },
        orderBy: { createdAt: "asc" },
      });
      res.json({
        conflicts: rows.map((row) => ({
          id: row.id,
          field: row.field,
          manualValue: row.manualValue,
          syncedValue: row.syncedValue,
          provider: row.provider,
          resolvedWith: row.resolvedWith,
          resolvedAt: iso(row.resolvedAt),
        })),
      });
    }),
  );

  app.post(
    "/me/conflicts/:id/resolve",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(z.object({ resolvedWith: z.enum(["manual", "synced"]) }), req.body);
      const row = await prisma.physicalDataConflict.findFirst({
        where: { id: req.params.id, userId: uid(req) },
      });
      if (!row) throw new HttpError(404, "Conflict not found.");
      if (row.resolvedAt) throw new HttpError(409, "Conflict is already resolved.");
      const updated = await prisma.physicalDataConflict.update({
        where: { id: row.id },
        data: { resolvedWith: body.resolvedWith, resolvedAt: new Date() },
      });
      await prisma.todoItem.updateMany({
        where: { userId: uid(req), type: "DATA_CONFLICT", refId: row.id, status: "OPEN" },
        data: { status: "DONE", closedAt: new Date() },
      });
      let ftpW: number | null = null;
      if (body.resolvedWith === "synced" && row.field === "ftp") {
        ftpW = jsonNumber(row.syncedValue);
        if (ftpW == null) throw new HttpError(400, "Synced FTP is not a number.");
        await prisma.physicalData.update({ where: { userId: uid(req) }, data: { ftpW } });
      }
      res.json({
        conflict: {
          id: updated.id,
          field: updated.field,
          resolvedWith: updated.resolvedWith,
          resolvedAt: iso(updated.resolvedAt),
        },
        ftpW,
        note:
          body.resolvedWith === "synced" && row.field !== "ftp"
            ? "Resolution is stored. Only an ftp field is copied onto physical data in this mock phase."
            : null,
      });
    }),
  );

  app.get(
    "/connections",
    attachUser,
    asyncRoute(async (req, res) => {
      const rows = await prisma.providerConnection.findMany({ where: { userId: uid(req) } });
      res.json({
        connections: PROVIDERS.map((provider) => {
          const row = rows.find((item) => item.provider === provider);
          if (!row) {
            return { provider, status: "DISCONNECTED", externalUserId: null, lastSyncAt: null, scopes: null };
          }
          return {
            provider,
            status: row.status,
            externalUserId: row.externalUserId,
            lastSyncAt: iso(row.lastSyncAt),
            scopes: row.scopes,
          };
        }),
      });
    }),
  );

  app.get(
    "/workouts",
    attachUser,
    asyncRoute(async (req, res) => {
      const query = parse(
        z.object({ from: dateString.optional(), to: dateString.optional() }),
        req.query,
      );
      const rows = await prisma.workout.findMany({
        where: {
          userId: uid(req),
          plannedDate: {
            gte: query.from ? parseDay(query.from) : undefined,
            lte: query.to ? parseDay(query.to) : undefined,
          },
        },
        include: workoutInclude,
        orderBy: [{ plannedDate: "asc" }, { plannedStart: "asc" }],
      });
      res.json({ workouts: rows.map(presentWorkout) });
    }),
  );

  app.post(
    "/workouts",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(
        z.object({
          date: dateString,
          durationMin: z.number().int().positive(),
          workoutType: z.enum(["BASE", "THRESHOLD", "VO2MAX", "ANAEROBIC", "RECOVERY"]).nullable().optional(),
          sport: z.enum(["CYCLING", "RUNNING", "TRAIL_RUNNING", "OTHER"]),
          name: z.string().min(1),
        }),
        req.body,
      );
      const id = nid("wrk");
      const row = await prisma.workout.create({
        data: {
          id,
          userId: uid(req),
          source: "MANUAL",
          externalId: id,
          sport: body.sport,
          kind: "STANDARD",
          workoutType: body.workoutType ?? null,
          name: body.name,
          plannedStart: null,
          plannedDate: parseDay(body.date),
          durationMin: body.durationMin,
          status: "PLANNED",
        },
        include: workoutInclude,
      });
      res.status(201).json({
        workout: presentWorkout(row),
        note: "Manual workouts are stored as entered. A fueling plan is not generated until the engine lands in M3.",
      });
    }),
  );

  app.get(
    "/workouts/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      res.json({ workout: presentWorkout(await loadWorkout(uid(req), req.params.id)) });
    }),
  );

  app.patch(
    "/workouts/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadWorkout(uid(req), req.params.id);
      const body = parse(
        z
          .object({
            name: z.string().min(1).optional(),
            durationMin: z.number().int().positive().nullable().optional(),
            workoutType: z.enum(["BASE", "THRESHOLD", "VO2MAX", "ANAEROBIC", "RECOVERY"]).nullable().optional(),
            sport: z.enum(["CYCLING", "RUNNING", "TRAIL_RUNNING", "OTHER"]).optional(),
            date: dateString.optional(),
            status: z.enum(["PLANNED", "COMPLETED", "SKIPPED"]).optional(),
            plannedStart: z.string().datetime().nullable().optional(),
          })
          .strict(),
        req.body,
      );
      const row = await prisma.workout.update({
        where: { id: req.params.id },
        data: {
          name: body.name,
          durationMin: body.durationMin,
          workoutType: body.workoutType,
          sport: body.sport,
          status: body.status,
          plannedDate: body.date ? parseDay(body.date) : undefined,
          plannedStart:
            body.plannedStart === undefined ? undefined : body.plannedStart ? new Date(body.plannedStart) : null,
        },
        include: workoutInclude,
      });
      res.json({ workout: presentWorkout(row) });
    }),
  );

  app.delete(
    "/workouts/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadWorkout(uid(req), req.params.id);
      await prisma.workout.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    }),
  );

  app.get(
    "/workouts/:id/fueling-plan",
    attachUser,
    asyncRoute(async (req, res) => {
      const workout = await loadWorkout(uid(req), req.params.id);
      const plan = workout.fuelingPlans.find((item) => item.isCurrent) ?? null;
      res.json({ fuelingPlan: plan ? presentFueling(plan) : null });
    }),
  );

  app.patch(
    "/workouts/:id/fueling-plan",
    attachUser,
    asyncRoute(async (req, res) => {
      const workout = await loadWorkout(uid(req), req.params.id);
      const plan = workout.fuelingPlans.find((item) => item.isCurrent);
      if (!plan) {
        throw new HttpError(404, "This workout has no fueling plan. Plans are not generated until M3.");
      }
      const body = parse(
        z
          .object({
            totalCarbsG: z.number().int().nonnegative().optional(),
            totalFluidMl: z.number().int().nonnegative().optional(),
            totalSodiumMg: z.number().int().nonnegative().optional(),
            targetGPerH: z.number().int().nonnegative().optional(),
          })
          .strict(),
        req.body,
      );
      if (Object.keys(body).length === 0) throw new HttpError(400, "Send at least one total to adjust.");
      const updated = await prisma.fuelingPlan.update({
        where: { id: plan.id },
        data: { ...body, userAdjusted: true },
      });
      res.json({
        fuelingPlan: presentFueling(updated),
        note: "Totals are stored as sent. The mock phase does not apply a hidden step size.",
      });
    }),
  );

  app.post(
    "/workouts/:id/feedback",
    attachUser,
    asyncRoute(async (req, res) => {
      const workout = await loadWorkout(uid(req), req.params.id);
      if (workout.feedback) throw new HttpError(409, "Feedback already exists for this workout.");
      const body = parse(
        z.object({
          intakeCarbsG: z.number().int().nonnegative().nullable().optional(),
          intakeItems: z.unknown().nullable().optional(),
          fluidMl: z.number().int().nonnegative().nullable().optional(),
          symptomUpper: z.enum(["NONE", "MILD", "MODERATE", "SEVERE"]).nullable().optional(),
          symptomLower: z.enum(["NONE", "MILD", "MODERATE", "SEVERE"]).nullable().optional(),
          symptomSystemic: z.enum(["NONE", "MILD", "MODERATE", "SEVERE"]).nullable().optional(),
          feeling: z.string().nullable().optional(),
          followedPrompts: z.boolean().nullable().optional(),
          countsForPlan: z.boolean().optional(),
          ladderEligible: z.boolean().optional(),
        }),
        req.body,
      );
      const log = await prisma.postWorkoutLog.create({
        data: {
          id: nid("log"),
          workoutId: workout.id,
          intakeCarbsG: body.intakeCarbsG ?? null,
          intakeItems: (body.intakeItems ?? undefined) as Prisma.InputJsonValue | undefined,
          fluidMl: body.fluidMl ?? null,
          symptomUpper: body.symptomUpper ?? null,
          symptomLower: body.symptomLower ?? null,
          symptomSystemic: body.symptomSystemic ?? null,
          feeling: body.feeling ?? null,
          followedPrompts: body.followedPrompts ?? null,
          countsForPlan: body.countsForPlan ?? true,
          ladderEligible: body.ladderEligible ?? true,
        },
      });
      res.status(201).json({
        log: {
          id: log.id,
          workoutId: log.workoutId,
          intakeCarbsG: log.intakeCarbsG,
          symptomUpper: log.symptomUpper,
          symptomLower: log.symptomLower,
          symptomSystemic: log.symptomSystemic,
          countsForPlan: log.countsForPlan,
          ladderEligible: log.ladderEligible,
          submittedAt: iso(log.submittedAt),
        },
        note: "The log is stored. Ladder moves and achievements are not computed until M3.",
      });
    }),
  );

  app.get(
    "/home",
    attachUser,
    asyncRoute(async (req, res) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: uid(req) },
        include: { physical: true },
      });
      const clock = makeClock(new Date(), user.timezone);
      const today = await prisma.workout.findMany({
        where: { userId: user.id, plannedDate: clock.today, status: "PLANNED" },
        include: workoutInclude,
        orderBy: { plannedStart: "asc" },
      });
      const withPlan = today.filter((row) => row.fuelingPlans.some((plan) => plan.isCurrent));
      let hero = null;
      if (user.mode === "GUT_TRAINING") {
        hero =
          withPlan.find((row) => {
            const minutes = row.durationMin ?? 0;
            if (row.sport === "CYCLING") return minutes > 120;
            if (row.sport === "RUNNING" || row.sport === "TRAIL_RUNNING") return minutes > 60;
            return false;
          }) ?? null;
      } else if (user.mode === "FUEL_MY_WORKOUTS") {
        hero = withPlan[0] ?? null;
      }
      const tests = await prisma.sweatTest.findMany({
        where: { userId: user.id },
        orderBy: { scheduledFor: "asc" },
      });
      const upcoming = tests.filter(
        (row) =>
          (row.status === "SCHEDULED" || row.status === "RESCHEDULED") &&
          row.scheduledFor.getTime() >= clock.today.getTime(),
      );
      const sweat =
        upcoming[0] ??
        tests.find((row) => row.status === "IN_PROGRESS") ??
        tests.find((row) => row.status === "AWAITING_DATA") ??
        null;
      const todos = await prisma.todoItem.findMany({ where: { userId: user.id, status: "OPEN" } });
      const rank: Record<string, number> = { HIGHEST: 0, CALIBRATION: 1, LOWER: 2 };
      todos.sort((a, b) => rank[a.tier] - rank[b.tier] || a.createdAt.getTime() - b.createdAt.getTime());
      const [products, containers, races] = await Promise.all([
        prisma.product.count({ where: { userId: user.id, deletedAt: null } }),
        prisma.container.count({ where: { userId: user.id } }),
        prisma.race.count({ where: { userId: user.id, date: { gte: clock.today } } }),
      ]);
      res.json({
        user: presentUser(user),
        physical: presentPhysical(user.physical),
        hero: hero ? presentWorkout(hero) : null,
        sweatTest: sweat ? presentSweat(sweat) : null,
        todos: todos.map(presentTodo),
        counts: { openTodos: todos.length, products, containers, upcomingRaces: races },
      });
    }),
  );

  app.patch(
    "/todos/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(z.object({ status: z.enum(["DONE", "DISMISSED"]) }), req.body);
      const existing = await prisma.todoItem.findFirst({ where: { id: req.params.id, userId: uid(req) } });
      if (!existing) throw new HttpError(404, "To do item not found.");
      const row = await prisma.todoItem.update({
        where: { id: existing.id },
        data: { status: body.status, closedAt: new Date() },
      });
      res.json({ todo: presentTodo(row) });
    }),
  );

  app.get(
    "/progress",
    attachUser,
    asyncRoute(async (req, res) => {
      const physical = await prisma.physicalData.findUnique({ where: { userId: uid(req) } });
      const achievements = await prisma.achievement.findMany({
        where: { userId: uid(req) },
        orderBy: { achievedAt: "asc" },
      });
      const logs = await prisma.postWorkoutLog.findMany({
        where: { workout: { userId: uid(req) } },
        include: { workout: { include: { fuelingPlans: true } } },
        orderBy: [{ workout: { plannedDate: "desc" } }, { submittedAt: "desc" }],
      });
      let streak = 0;
      for (const log of logs) {
        const plan = log.workout.fuelingPlans.find((item) => item.isCurrent);
        if (!plan || log.intakeCarbsG == null) continue;
        const symptoms = [log.symptomUpper, log.symptomLower, log.symptomSystemic];
        if (symptoms.some((item) => item == null)) continue;
        const mild = symptoms.every((item) => item === "NONE" || item === "MILD");
        if (!mild || log.intakeCarbsG < plan.totalCarbsG) break;
        streak += 1;
      }
      res.json({
        toleratedGh: physical?.ghTolerance ?? null,
        streak,
        achievements: achievements.map(presentAchievement),
        sessions: logs.map((log) => {
          const plan = log.workout.fuelingPlans.find((item) => item.isCurrent) ?? null;
          return {
            logId: log.id,
            workoutId: log.workoutId,
            name: log.workout.name,
            plannedDate: day(log.workout.plannedDate),
            intakeCarbsG: log.intakeCarbsG,
            planCarbsG: plan?.totalCarbsG ?? null,
            symptomUpper: log.symptomUpper,
            symptomLower: log.symptomLower,
            symptomSystemic: log.symptomSystemic,
            countsForPlan: log.countsForPlan,
            ladderEligible: log.ladderEligible,
            engineVersion: plan?.engineVersion ?? null,
          };
        }),
      });
    }),
  );

  app.get(
    "/achievements/pending",
    attachUser,
    asyncRoute(async (req, res) => {
      const rows = await prisma.achievement.findMany({
        where: { userId: uid(req), celebratedAt: null },
        orderBy: { achievedAt: "asc" },
      });
      res.json({ achievements: rows.map(presentAchievement) });
    }),
  );

  app.post(
    "/achievements/:id/celebrated",
    attachUser,
    asyncRoute(async (req, res) => {
      const row = await prisma.achievement.findFirst({ where: { id: req.params.id, userId: uid(req) } });
      if (!row) throw new HttpError(404, "Achievement not found.");
      const updated = await prisma.achievement.update({
        where: { id: row.id },
        data: { celebratedAt: row.celebratedAt ?? new Date() },
      });
      res.json({ achievement: presentAchievement(updated) });
    }),
  );

  app.get(
    "/containers",
    attachUser,
    asyncRoute(async (req, res) => {
      const rows = await prisma.container.findMany({
        where: { userId: uid(req) },
        include: containerInclude,
        orderBy: { name: "asc" },
      });
      res.json({ containers: rows.map(presentContainer) });
    }),
  );

  app.post(
    "/containers",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(containerBody, req.body);
      const row = await prisma.container.create({
        data: { id: nid("cnt"), userId: uid(req), ...body },
        include: containerInclude,
      });
      res.status(201).json({ container: presentContainer(row) });
    }),
  );

  app.get(
    "/containers/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      res.json({ container: presentContainer(await loadContainer(uid(req), req.params.id)) });
    }),
  );

  app.patch(
    "/containers/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadContainer(uid(req), req.params.id);
      const body = parse(containerBody.partial().strict(), req.body);
      const row = await prisma.container.update({
        where: { id: req.params.id },
        data: body,
        include: containerInclude,
      });
      res.json({ container: presentContainer(row) });
    }),
  );

  app.delete(
    "/containers/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadContainer(uid(req), req.params.id);
      await prisma.container.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    }),
  );

  app.post(
    "/containers/:id/calibrations",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadContainer(uid(req), req.params.id);
      const body = parse(
        z.object({
          weightsG: z.array(z.number()),
          mlPerSip: z.number().positive().nullable().optional(),
          gPerSqueeze: z.number().positive().nullable().optional(),
          validationsLeft: z.number().int().nonnegative().optional(),
        }),
        req.body,
      );
      const row = await prisma.containerCalibration.create({
        data: {
          id: nid("cal"),
          containerId: req.params.id,
          weightsG: body.weightsG,
          mlPerSip: body.mlPerSip ?? null,
          gPerSqueeze: body.gPerSqueeze ?? null,
          validationsLeft: body.validationsLeft ?? 4,
        },
      });
      res.status(201).json({
        calibration: {
          id: row.id,
          containerId: row.containerId,
          weightsG: row.weightsG,
          mlPerSip: num(row.mlPerSip),
          gPerSqueeze: num(row.gPerSqueeze),
          validationsLeft: row.validationsLeft,
        },
      });
    }),
  );

  app.post(
    "/calibrations/:id/proposal",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(z.object({ action: z.enum(["accept", "reject"]) }), req.body);
      const calibration = await prisma.containerCalibration.findFirst({
        where: { id: req.params.id, container: { userId: uid(req) } },
      });
      if (!calibration) throw new HttpError(404, "Calibration not found.");
      const logs = await prisma.postWorkoutLog.findMany({ where: { workout: { userId: uid(req) } } });
      const log = logs.find((item) => {
        const proposal = asRecord(item.sipProposal);
        return proposal?.calibrationId === calibration.id && proposal.status === "pending";
      });
      if (!log) throw new HttpError(404, "No pending sip proposal for this calibration.");
      const proposal = asRecord(log.sipProposal) ?? {};
      if (body.action === "accept") {
        const proposed = proposal.proposedMlPerSip;
        if (typeof proposed !== "number") throw new HttpError(400, "Proposal has no ml per sip.");
        await prisma.containerCalibration.update({
          where: { id: calibration.id },
          data: { mlPerSip: proposed },
        });
      }
      const status = body.action === "accept" ? "accepted" : "rejected";
      await prisma.postWorkoutLog.update({
        where: { id: log.id },
        data: { sipProposal: { ...proposal, status } as Prisma.InputJsonValue },
      });
      res.json({ calibrationId: calibration.id, status });
    }),
  );

  app.get(
    "/products",
    attachUser,
    asyncRoute(async (req, res) => {
      const rows = await prisma.product.findMany({
        where: { userId: uid(req), deletedAt: null },
        orderBy: { name: "asc" },
      });
      res.json({ products: rows.map(presentProduct) });
    }),
  );

  app.post(
    "/products",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(productBody, req.body);
      const row = await prisma.product.create({
        data: {
          id: nid("prd"),
          userId: uid(req),
          ...body,
          label: body.label as Prisma.InputJsonValue | undefined,
        },
      });
      res.status(201).json({ product: presentProduct(row) });
    }),
  );

  app.get(
    "/products/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      const row = await loadProduct(uid(req), req.params.id);
      res.json({ product: presentProduct(row) });
    }),
  );

  app.patch(
    "/products/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadProduct(uid(req), req.params.id);
      const body = parse(productBody.partial().strict(), req.body);
      const row = await prisma.product.update({
        where: { id: req.params.id },
        data: { ...body, label: body.label as Prisma.InputJsonValue | undefined },
      });
      res.json({ product: presentProduct(row) });
    }),
  );

  app.delete(
    "/products/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      const product = await loadProduct(uid(req), req.params.id);
      const body = parse(
        z.object({ replacementProductId: z.string().optional() }).partial(),
        req.body ?? {},
      );
      const replacementId =
        body.replacementProductId ??
        (typeof req.query.replacementProductId === "string" ? req.query.replacementProductId : undefined);
      const clock = makeClock(new Date());
      const plans = await prisma.fuelingPlan.findMany({
        where: { isCurrent: true, workout: { userId: uid(req), plannedDate: { gte: clock.today } } },
        include: { workout: true },
      });
      const affected = plans.filter(
        (plan) => containsId(plan.schedule, product.id) || containsId(plan.carryList, product.id),
      );
      if (affected.length > 0 && !replacementId) {
        res.status(409).json({
          error: "Product is used by upcoming fueling plans.",
          affectedWorkouts: affected.map((plan) => ({
            id: plan.workout.id,
            name: plan.workout.name,
            plannedDate: day(plan.workout.plannedDate),
          })),
        });
        return;
      }
      if (replacementId) {
        await loadProduct(uid(req), replacementId);
        for (const plan of affected) {
          await prisma.fuelingPlan.update({
            where: { id: plan.id },
            data: {
              schedule: replaceId(plan.schedule, product.id, replacementId),
              carryList: replaceId(plan.carryList, product.id, replacementId),
            },
          });
        }
      }
      const row = await prisma.product.update({
        where: { id: product.id },
        data: { deletedAt: new Date() },
      });
      res.json({ product: presentProduct(row), replacedIn: affected.length });
    }),
  );

  app.get(
    "/foods",
    asyncRoute(async (req, res) => {
      const query = parse(z.object({ query: z.string().optional() }), req.query);
      const rows = await prisma.foodItem.findMany({
        where: query.query ? { name: { contains: query.query } } : {},
        orderBy: { name: "asc" },
      });
      const precision = new Map(FOODS.map((food) => [food.fdcId, food.precision]));
      res.json({ foods: rows.map((row) => presentFood(row, precision.get(row.fdcId) ?? null)) });
    }),
  );

  app.get(
    "/gut-plan",
    attachUser,
    asyncRoute(async (req, res) => {
      const active = await activePlan(uid(req));
      const plan =
        active ??
        (await prisma.gutTrainingPlan.findFirst({
          where: { userId: uid(req) },
          include: { steps: true, decisions: true },
          orderBy: { createdAt: "desc" },
        }));
      res.json({ plan: plan ? presentPlan(plan) : null });
    }),
  );

  app.put(
    "/gut-plan",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(gutBody, req.body);
      if (body.goalGh > 200) throw new HttpError(400, "Goal above 200 g/h is not allowed.");
      if (body.raceId) {
        const owned = await prisma.race.findFirst({ where: { id: body.raceId, userId: uid(req) } });
        if (!owned) throw new HttpError(404, "Race not found.");
      }
      const user = await prisma.user.findUniqueOrThrow({ where: { id: uid(req) } });
      const clock = makeClock(new Date(), user.timezone);
      const target = parseDay(body.targetDate);
      const preview = tooFastPreview({
        startGh: body.startGh,
        goalGh: body.goalGh,
        today: clock.today,
        targetDate: target,
      });
      const existing = await activePlan(user.id);
      const tooFast = body.tooFast ?? preview.tooFast;
      const saved = await prisma.$transaction(async (tx) => {
        const plan = existing
          ? await tx.gutTrainingPlan.update({
              where: { id: existing.id },
              data: {
                targetKind: body.targetKind,
                raceId: body.raceId ?? null,
                targetDate: target,
                startGh: body.startGh,
                goalGh: body.goalGh,
                defaultGh: body.defaultGh ?? null,
                tooFast,
                status: body.status ?? existing.status,
                engineVersion: ENGINE_VERSION,
              },
            })
          : await tx.gutTrainingPlan.create({
              data: {
                id: nid("gut"),
                userId: user.id,
                targetKind: body.targetKind,
                raceId: body.raceId ?? null,
                targetDate: target,
                startGh: body.startGh,
                goalGh: body.goalGh,
                defaultGh: body.defaultGh ?? null,
                tooFast,
                status: body.status ?? "ACTIVE",
                engineVersion: ENGINE_VERSION,
              },
            });
        if (body.steps) {
          await tx.ladderStep.deleteMany({ where: { planId: plan.id } });
          await tx.ladderStep.createMany({
            data: body.steps.map((step) => ({
              id: nid("stp"),
              planId: plan.id,
              index: step.index,
              gh: step.gh,
              approxDate: step.approxDate ? parseDay(step.approxDate) : null,
              status: step.status,
            })),
          });
        }
        return tx.gutTrainingPlan.findUniqueOrThrow({
          where: { id: plan.id },
          include: { steps: true, decisions: true },
        });
      });
      res.json({
        plan: presentPlan(saved),
        warningAbove120: body.goalGh > 120,
        preview,
        note: "Saved with engineVersion fixture. Ladder steps are stored as sent and are not generated.",
      });
    }),
  );

  app.post(
    "/gut-plan/preview",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(
        z.object({ startGh: z.number().int().nonnegative(), goalGh: z.number().int().positive(), targetDate: dateString }),
        req.body,
      );
      if (body.goalGh > 200) throw new HttpError(400, "Goal above 200 g/h is not allowed.");
      const user = await prisma.user.findUniqueOrThrow({ where: { id: uid(req) } });
      const clock = makeClock(new Date(), user.timezone);
      res.json({
        engineVersion: ENGINE_VERSION,
        warningAbove120: body.goalGh > 120,
        ...tooFastPreview({
          startGh: body.startGh,
          goalGh: body.goalGh,
          today: clock.today,
          targetDate: parseDay(body.targetDate),
        }),
      });
    }),
  );

  app.get(
    "/gut-plan/starting-point/workouts",
    attachUser,
    asyncRoute(async (req, res) => {
      const user = await prisma.user.findUniqueOrThrow({ where: { id: uid(req) } });
      const clock = makeClock(new Date(), user.timezone);
      const rows = await prisma.workout.findMany({
        where: {
          userId: user.id,
          status: "COMPLETED",
          plannedDate: { gte: clock.day(-60) },
          feedback: { is: null },
        },
        include: workoutInclude,
        orderBy: { plannedDate: "desc" },
      });
      res.json({ workouts: rows.map(presentWorkout) });
    }),
  );

  app.post(
    "/gut-plan/starting-point",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(
        z.object({
          unknown: z.boolean().optional(),
          sessions: z
            .array(
              z.object({
                durationMin: z.number().positive(),
                symptom: z.enum(["NONE", "MILD", "MODERATE", "SEVERE"]).optional(),
                items: z.array(z.object({ productId: z.string(), servings: z.number().nonnegative() })),
              }),
            )
            .optional(),
        }),
        req.body,
      );
      const physical = await prisma.physicalData.findUnique({ where: { userId: uid(req) } });
      if (body.unknown) {
        const weight = num(physical?.weightKg);
        if (weight == null) throw new HttpError(400, "Weight is required for an unknown starting point.");
        res.json({
          engineVersion: ENGINE_VERSION,
          persisted: false,
          basis: "unknown",
          startGh: Math.min(60, Math.round(weight)),
          note: "1 g per kg, capped at 60 g/h. ghTolerance is not changed.",
        });
        return;
      }
      const sessions = (body.sessions ?? []).filter(
        (session) => session.symptom === "NONE" || session.symptom === "MILD",
      );
      if (sessions.length === 0) {
        throw new HttpError(400, "Send unknown: true, or at least one session rated none or mild.");
      }
      const productIds = [...new Set(sessions.flatMap((session) => session.items.map((item) => item.productId)))];
      const products = await prisma.product.findMany({
        where: { userId: uid(req), id: { in: productIds }, deletedAt: null },
      });
      const rates = sessions.map((session) => {
        const carbs = session.items.reduce((sum, item) => {
          const product = products.find((row) => row.id === item.productId);
          if (!product) throw new HttpError(400, `Unknown product ${item.productId}.`);
          return sum + Number(product.carbsG) * item.servings;
        }, 0);
        return carbs / (session.durationMin / 60);
      });
      const best = Math.max(...rates);
      res.json({
        engineVersion: ENGINE_VERSION,
        persisted: false,
        basis: "mild-or-better",
        sessionsConsidered: sessions.length,
        startGh: Math.round(best),
        note: "Highest g/h among the none or mild sessions sent. Not written to ghTolerance. Rounded to the nearest gram.",
      });
    }),
  );

  app.post(
    "/sweat-tests",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(
        z.object({ scheduledFor: dateString, workoutId: z.string().optional() }),
        req.body,
      );
      if (body.workoutId) await loadWorkout(uid(req), body.workoutId);
      const row = await prisma.sweatTest.create({
        data: {
          id: nid("swt"),
          userId: uid(req),
          workoutId: body.workoutId ?? null,
          status: "SCHEDULED",
          scheduledFor: parseDay(body.scheduledFor),
        },
      });
      res.status(201).json({ sweatTest: presentSweat(row) });
    }),
  );

  app.get(
    "/sweat-tests/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      const row = await prisma.sweatTest.findFirst({ where: { id: req.params.id, userId: uid(req) } });
      if (!row) throw new HttpError(404, "Sweat test not found.");
      res.json({ sweatTest: presentSweat(row) });
    }),
  );

  app.post(
    "/sweat-tests/:id/start",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(z.object({ preWeightKg: z.number().positive() }), req.body);
      const row = await prisma.sweatTest.findFirst({ where: { id: req.params.id, userId: uid(req) } });
      if (!row) throw new HttpError(404, "Sweat test not found.");
      if (row.status === "COMPLETED") throw new HttpError(409, "Sweat test is already complete.");
      const updated = await prisma.sweatTest.update({
        where: { id: row.id },
        data: { preWeightKg: body.preWeightKg, status: "IN_PROGRESS", startedAt: new Date() },
      });
      res.json({ sweatTest: presentSweat(updated) });
    }),
  );

  app.post(
    "/sweat-tests/:id/complete",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(
        z.object({
          postWeightKg: z.number().positive(),
          fluidMl: z.number().int().nonnegative(),
          urineMl: z.number().int().nonnegative(),
          preWeightKg: z.number().positive().optional(),
          endedAt: z.string().datetime().optional(),
          temperatureC: z.number().optional(),
          humidityPct: z.number().int().optional(),
        }),
        req.body,
      );
      const row = await prisma.sweatTest.findFirst({
        where: { id: req.params.id, userId: uid(req) },
        include: { workout: true },
      });
      if (!row) throw new HttpError(404, "Sweat test not found.");
      const pre = body.preWeightKg ?? num(row.preWeightKg);
      const endedAt = body.endedAt ? new Date(body.endedAt) : new Date();
      let durationMin: number | null = null;
      if (row.startedAt) {
        const minutes = Math.round((endedAt.getTime() - row.startedAt.getTime()) / 60000);
        if (minutes > 0) durationMin = minutes;
      }
      if (durationMin == null && row.workout?.durationMin) durationMin = row.workout.durationMin;
      if (pre == null || durationMin == null) {
        throw new HttpError(400, "Pre-weight and a duration (started time or workout length) are required.");
      }
      const rate = sweatRateLPerH({
        preWeightKg: pre,
        postWeightKg: body.postWeightKg,
        fluidMl: body.fluidMl,
        urineMl: body.urineMl,
        durationMin,
      });
      const updated = await prisma.sweatTest.update({
        where: { id: row.id },
        data: {
          preWeightKg: pre,
          postWeightKg: body.postWeightKg,
          fluidMl: body.fluidMl,
          urineMl: body.urineMl,
          endedAt,
          temperatureC: body.temperatureC,
          humidityPct: body.humidityPct,
          sweatRateLPerH: rate,
          status: "COMPLETED",
        },
      });
      await prisma.physicalData.update({
        where: { userId: uid(req) },
        data: { sweatRateLPerH: rate, sweatRateSource: "sweat_test" },
      });
      res.json({
        sweatTest: presentSweat(updated),
        engineVersion: ENGINE_VERSION,
        durationMin,
        physicalUpdated: true,
        note: "Rate uses the documented weigh-in formula. It is also copied onto physical data in this mock phase.",
      });
    }),
  );

  app.get(
    "/races",
    attachUser,
    asyncRoute(async (req, res) => {
      const rows = await prisma.race.findMany({
        where: { userId: uid(req) },
        include: raceInclude,
        orderBy: { date: "asc" },
      });
      res.json({ races: rows.map(presentRace) });
    }),
  );

  app.post(
    "/races",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(raceBody, req.body);
      const createdId = nid("race");
      const row = await prisma.$transaction(async (tx) => {
        const race = await tx.race.create({
          data: {
            ...raceCreate(uid(req), { ...body, stages: undefined, aidStations: undefined }),
            id: createdId,
          },
        });
        const stages = body.stages
          ? await Promise.all(body.stages.map((stage) => tx.stage.create({ data: { ...stageCreate(stage), raceId: race.id } })))
          : [];
        for (const station of body.aidStations ?? []) {
          const stage = station.stageIndex == null ? null : stages.find((item) => item.index === station.stageIndex);
          if (station.stageIndex != null && !stage) {
            throw new HttpError(400, `No stage with index ${station.stageIndex}.`);
          }
          await tx.aidStation.create({
            data: { ...aidCreate(station), raceId: stage ? null : race.id, stageId: stage?.id ?? null },
          });
        }
        return tx.race.findUniqueOrThrow({ where: { id: race.id }, include: raceInclude });
      });
      res.status(201).json({
        race: presentRace(row),
        note: "The race is stored as entered. Loading days and fueling plans are not generated until M3.",
      });
    }),
  );

  app.get(
    "/races/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      res.json({ race: presentRace(await loadRace(uid(req), req.params.id)) });
    }),
  );

  app.patch(
    "/races/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadRace(uid(req), req.params.id);
      const body = parse(raceBody.partial(), req.body);
      if (body.stages) {
        await prisma.stage.deleteMany({ where: { raceId: req.params.id } });
      }
      if (body.aidStations) {
        await prisma.aidStation.deleteMany({ where: { raceId: req.params.id, stageId: null } });
      }
      const row = await prisma.race.update({
        where: { id: req.params.id },
        data: {
          name: body.name,
          date: body.date ? parseDay(body.date) : undefined,
          startAt: body.startAt === undefined ? undefined : body.startAt ? new Date(body.startAt) : null,
          estimatedDurationMin: body.estimatedDurationMin,
          type: body.type,
          distanceKm: body.distanceKm,
          elevationGainM: body.elevationGainM,
          carbLoading: body.carbLoading,
          isMultiStage: body.isMultiStage,
          stages: body.stages ? { create: body.stages.map(stageCreate) } : undefined,
          aidStations: body.aidStations ? { create: body.aidStations.map(aidCreate) } : undefined,
        },
        include: raceInclude,
      });
      res.json({
        race: presentRace(row),
        note: body.stages
          ? "Replacing stages drops recovery plans that belonged to the previous stages."
          : null,
      });
    }),
  );

  app.delete(
    "/races/:id",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadRace(uid(req), req.params.id);
      await prisma.race.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    }),
  );

  app.post(
    "/races/:id/strategies/generate",
    attachUser,
    asyncRoute(async (req, res) => {
      const race = await loadRace(uid(req), req.params.id);
      if (race.strategies.length > 0) {
        res.json({
          strategies: race.strategies.map(presentStrategy),
          note: "Existing strategies were returned. This mock call does not invent another carry list.",
        });
        return;
      }
      const created = await prisma.raceStrategy.create({
        data: {
          id: nid("str"),
          raceId: race.id,
          refillPoints: [],
          description: "Placeholder strategy. Carry grams are not invented in the mock phase.",
          carryList: { items: [], note: "Empty until a real strategy exists." },
          chosen: false,
        },
      });
      res.status(201).json({ strategies: [presentStrategy(created)], note: created.description });
    }),
  );

  app.post(
    "/races/:id/strategies/:sid/choose",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadRace(uid(req), req.params.id);
      const strategy = await prisma.raceStrategy.findFirst({
        where: { id: req.params.sid, raceId: req.params.id },
      });
      if (!strategy) throw new HttpError(404, "Strategy not found.");
      await prisma.$transaction([
        prisma.raceStrategy.updateMany({ where: { raceId: req.params.id }, data: { chosen: false } }),
        prisma.raceStrategy.update({ where: { id: strategy.id }, data: { chosen: true } }),
      ]);
      const rows = await prisma.raceStrategy.findMany({ where: { raceId: req.params.id } });
      res.json({ strategies: rows.map(presentStrategy) });
    }),
  );

  app.get(
    "/races/:id/loading/:day",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadRace(uid(req), req.params.id);
      const which = loadingDayParam(req.params.day);
      const row = await prisma.carbLoadingDay.findFirst({
        where: { raceId: req.params.id, day: which, isRehearsal: false },
      });
      if (!row) throw new HttpError(404, "No loading day is stored for that race.");
      res.json({
        loadingDay: {
          id: row.id,
          day: row.day,
          date: day(row.date),
          gPerKg: num(row.gPerKg),
          targetCarbsG: row.targetCarbsG,
          meals: row.meals,
          engineVersion: ENGINE_VERSION,
        },
      });
    }),
  );

  app.get(
    "/races/:id/breakfast",
    attachUser,
    asyncRoute(async (req, res) => {
      const race = await loadRace(uid(req), req.params.id);
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: uid(req) },
        include: { physical: true },
      });
      const weight = num(user.physical?.weightKg);
      if (weight == null) throw new HttpError(400, "Weight is required to derive breakfast.");
      const early = race.startAt ? hourInZone(race.startAt, user.timezone) < 8 : false;
      const gPerKg = early ? 1.5 : 2;
      const carbsG = Math.round(gPerKg * weight);
      const fluidMl = Math.round(5 * weight);
      const sodiumMg = Math.round((DEMO_ISOTONIC_SODIUM_MG_PER_L * fluidMl) / 1000);
      res.json({
        engineVersion: ENGINE_VERSION,
        derived: true,
        earlyStart: early,
        gPerKg,
        carbsG,
        fluidMl,
        isotonicMl: fluidMl,
        waterMl: 0,
        sodiumMg,
        drinkSodiumMgPerL: DEMO_ISOTONIC_SODIUM_MG_PER_L,
        note: early
          ? "Start is before 08:00 in the athlete zone, so the fixture uses 1.5 g/kg (upper end of the early-start range). Fluid is the low end, 5 ml/kg, all as the demo isotonic. No row is stored."
          : race.startAt
            ? "Default race breakfast is 2 g/kg. Fluid is the low end, 5 ml/kg, all as the demo isotonic. No row is stored."
            : "This race has no start time, so it is not treated as an early start. Breakfast is 2 g/kg. No row is stored.",
      });
    }),
  );

  app.post(
    "/races/:id/rehearsal/dismiss",
    attachUser,
    asyncRoute(async (req, res) => {
      await loadRace(uid(req), req.params.id);
      const rehearsal = await prisma.loadingRehearsal.findUnique({ where: { raceId: req.params.id } });
      if (!rehearsal) throw new HttpError(404, "No rehearsal is stored for that race.");
      const updated = await prisma.loadingRehearsal.update({
        where: { id: rehearsal.id },
        data: { status: "DISMISSED", dismissedAt: new Date() },
      });
      await prisma.todoItem.updateMany({
        where: {
          userId: uid(req),
          type: "LOADING_REHEARSAL",
          status: "OPEN",
          refId: { in: [rehearsal.id, rehearsal.raceId] },
        },
        data: { status: "DISMISSED", closedAt: new Date() },
      });
      res.json({
        rehearsal: {
          id: updated.id,
          raceId: updated.raceId,
          date: day(updated.date),
          status: updated.status,
          dismissedAt: iso(updated.dismissedAt),
        },
      });
    }),
  );

  app.get(
    "/stages/:id/recovery",
    attachUser,
    asyncRoute(async (req, res) => {
      const stage = await prisma.stage.findFirst({
        where: { id: req.params.id, race: { userId: uid(req) } },
        include: { recovery: true },
      });
      if (!stage) throw new HttpError(404, "Stage not found.");
      res.json({ recovery: stage.recovery ? presentRecovery(stage.recovery) : null });
    }),
  );

  app.patch(
    "/stages/:id/recovery",
    attachUser,
    asyncRoute(async (req, res) => {
      const body = parse(z.object({ sensitiveStomach: z.boolean() }), req.body);
      const stage = await prisma.stage.findFirst({
        where: { id: req.params.id, race: { userId: uid(req) } },
        include: { recovery: true },
      });
      if (!stage?.recovery) throw new HttpError(404, "Recovery plan not found.");
      const updated = await prisma.stageRecoveryPlan.update({
        where: { id: stage.recovery.id },
        data: { sensitiveStomach: body.sensitiveStomach },
      });
      res.json({
        recovery: presentRecovery(updated),
        note: "The flag is stored. Carb and protein targets are not recomputed.",
      });
    }),
  );
}

const containerBody = z.object({
  type: z.enum(["BOTTLE", "SOFT_FLASK", "BLADDER"]),
  name: z.string().min(1),
  colorHex: z.string().nullable().optional(),
  capacityMl: z.number().int().positive(),
  usualContent: z.enum(["WATER", "ISOTONIC", "GEL_CONCENTRATE"]).optional(),
});

const productBody = z.object({
  type: z.enum(["DRINK_MIX", "GEL", "SOLID"]),
  name: z.string().min(1),
  brand: z.string().nullable().optional(),
  servingG: z.number().nonnegative().nullable().optional(),
  scoopG: z.number().nonnegative().nullable().optional(),
  carbsG: z.number().nonnegative(),
  sodiumMg: z.number().int().nonnegative().nullable().optional(),
  caffeineMg: z.number().int().nonnegative().nullable().optional(),
  label: z.unknown().optional(),
  favorite: z.boolean().optional(),
  source: z.enum(["SCAN", "MANUAL"]).optional(),
});

const stageBody = z.object({
  index: z.number().int().positive(),
  date: dateString,
  startAt: z.string().datetime(),
  estimatedDurationMin: z.number().int().positive(),
  type: z.string().min(1),
  distanceKm: z.number().nonnegative().nullable().optional(),
  elevationGainM: z.number().int().nonnegative().nullable().optional(),
});

const aidBody = z.object({
  kmMark: z.number().nonnegative(),
  hasWater: z.boolean().optional(),
  hasIsotonic: z.boolean().optional(),
  hasGels: z.boolean().optional(),
  stageIndex: z.number().int().positive().nullable().optional(),
});

const raceBody = z.object({
  name: z.string().min(1),
  date: dateString,
  startAt: z.string().datetime().nullable().optional(),
  estimatedDurationMin: z.number().int().positive(),
  type: z.string().min(1),
  distanceKm: z.number().nonnegative().nullable().optional(),
  elevationGainM: z.number().int().nonnegative().nullable().optional(),
  carbLoading: z.enum(["NONE", "TWO_DAY", "ONE_DAY"]).optional(),
  isMultiStage: z.boolean().optional(),
  stages: z.array(stageBody).optional(),
  aidStations: z.array(aidBody).optional(),
});

const gutBody = z.object({
  targetKind: z.enum(["RACE", "DATE"]),
  raceId: z.string().nullable().optional(),
  targetDate: dateString,
  startGh: z.number().int().nonnegative(),
  goalGh: z.number().int().positive(),
  defaultGh: z.number().int().nonnegative().nullable().optional(),
  tooFast: z.boolean().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  steps: z
    .array(
      z.object({
        index: z.number().int().nonnegative(),
        gh: z.number().int().nonnegative(),
        approxDate: dateString.nullable().optional(),
        status: z.enum(["DONE", "CURRENT", "UPCOMING"]),
      }),
    )
    .optional(),
});

type RaceBody = z.infer<typeof raceBody>;
type StageBody = z.infer<typeof stageBody>;
type AidBody = z.infer<typeof aidBody>;

function stageCreate(stage: StageBody) {
  return {
    id: nid("stg"),
    index: stage.index,
    date: parseDay(stage.date),
    startAt: new Date(stage.startAt),
    estimatedDurationMin: stage.estimatedDurationMin,
    type: stage.type,
    distanceKm: stage.distanceKm ?? null,
    elevationGainM: stage.elevationGainM ?? null,
  };
}

function aidCreate(station: AidBody) {
  return {
    id: nid("aid"),
    kmMark: station.kmMark,
    hasWater: station.hasWater ?? false,
    hasIsotonic: station.hasIsotonic ?? false,
    hasGels: station.hasGels ?? false,
  };
}

function raceCreate(userId: string, body: RaceBody): Prisma.RaceCreateInput {
  return {
    id: nid("race"),
    user: { connect: { id: userId } },
    name: body.name,
    date: parseDay(body.date),
    startAt: body.startAt ? new Date(body.startAt) : null,
    estimatedDurationMin: body.estimatedDurationMin,
    type: body.type,
    distanceKm: body.distanceKm ?? null,
    elevationGainM: body.elevationGainM ?? null,
    carbLoading: body.carbLoading ?? "NONE",
    isMultiStage: body.isMultiStage ?? false,
    stages: body.stages ? { create: body.stages.map(stageCreate) } : undefined,
    aidStations: body.aidStations ? { create: body.aidStations.map(aidCreate) } : undefined,
  };
}

const raceInclude = {
  stages: { include: { aidStations: true, recovery: true }, orderBy: { index: "asc" as const } },
  aidStations: true,
  strategies: true,
  loadingDays: true,
  rehearsal: true,
} as const;

type RaceRow = Prisma.RaceGetPayload<{ include: typeof raceInclude }>;

function presentRace(row: RaceRow) {
  return {
    id: row.id,
    name: row.name,
    date: day(row.date),
    startAt: iso(row.startAt),
    estimatedDurationMin: row.estimatedDurationMin,
    type: row.type,
    distanceKm: num(row.distanceKm),
    elevationGainM: row.elevationGainM,
    carbLoading: row.carbLoading,
    isMultiStage: row.isMultiStage,
    stages: row.stages.map((stage) => ({
      id: stage.id,
      index: stage.index,
      date: day(stage.date),
      startAt: iso(stage.startAt),
      estimatedDurationMin: stage.estimatedDurationMin,
      type: stage.type,
      distanceKm: num(stage.distanceKm),
      elevationGainM: stage.elevationGainM,
      activityId: stage.activityId,
      arrivalAt: iso(stage.arrivalAt),
      arrivalSource: stage.arrivalSource,
      aidStations: stage.aidStations.map(presentAid),
      recovery: stage.recovery ? presentRecovery(stage.recovery) : null,
    })),
    aidStations: row.aidStations.map(presentAid),
    strategies: row.strategies.map(presentStrategy),
    loadingDays: row.loadingDays.map((item) => ({
      id: item.id,
      day: item.day,
      date: day(item.date),
      targetCarbsG: item.targetCarbsG,
      isRehearsal: item.isRehearsal,
    })),
    rehearsal: row.rehearsal
      ? {
          id: row.rehearsal.id,
          date: day(row.rehearsal.date),
          status: row.rehearsal.status,
          longRideWorkoutId: row.rehearsal.longRideWorkoutId,
          dismissedAt: iso(row.rehearsal.dismissedAt),
        }
      : null,
  };
}

function presentAid(row: { id: string; kmMark: Prisma.Decimal; hasWater: boolean; hasIsotonic: boolean; hasGels: boolean; stageId: string | null }) {
  return {
    id: row.id,
    kmMark: num(row.kmMark),
    hasWater: row.hasWater,
    hasIsotonic: row.hasIsotonic,
    hasGels: row.hasGels,
    stageId: row.stageId,
  };
}

function presentStrategy(row: Prisma.RaceStrategyGetPayload<object>) {
  return {
    id: row.id,
    refillPoints: row.refillPoints,
    description: row.description,
    carryList: row.carryList,
    chosen: row.chosen,
  };
}

function presentRecovery(row: Prisma.StageRecoveryPlanGetPayload<object>) {
  return {
    id: row.id,
    stageId: row.stageId,
    gapCase: row.gapCase,
    gapMin: row.gapMin,
    carbsTargetG: row.carbsTargetG,
    proteinTargetG: row.proteinTargetG,
    fluidTargetMl: row.fluidTargetMl,
    sodiumTargetMg: row.sodiumTargetMg,
    sensitiveStomach: row.sensitiveStomach,
    meals: row.meals,
    engineVersion: row.engineVersion,
  };
}

function presentAchievement(row: Prisma.AchievementGetPayload<object>) {
  return {
    id: row.id,
    type: row.type,
    valueGh: row.valueGh,
    workoutId: row.workoutId,
    achievedAt: iso(row.achievedAt),
    celebratedAt: iso(row.celebratedAt),
  };
}

function presentPlan(
  row: Prisma.GutTrainingPlanGetPayload<{ include: { steps: true; decisions: true } }>,
) {
  return {
    id: row.id,
    targetKind: row.targetKind,
    raceId: row.raceId,
    targetDate: day(row.targetDate),
    startGh: row.startGh,
    goalGh: row.goalGh,
    defaultGh: row.defaultGh,
    tooFast: row.tooFast,
    status: row.status,
    engineVersion: row.engineVersion,
    warningAbove120: row.goalGh > 120,
    steps: row.steps
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((step) => ({
        id: step.id,
        index: step.index,
        gh: step.gh,
        approxDate: day(step.approxDate),
        status: step.status,
      })),
    decisions: row.decisions.map((item) => ({
      id: item.id,
      outcome: item.outcome,
      fromGh: item.fromGh,
      toGh: item.toGh,
      inputLogIds: item.inputLogIds,
      reason: item.reason,
      engineVersion: item.engineVersion,
      createdAt: iso(item.createdAt),
    })),
  };
}

async function activePlan(userId: string) {
  return prisma.gutTrainingPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { steps: true, decisions: true },
    orderBy: { createdAt: "desc" },
  });
}

async function loadContainer(userId: string, id: string) {
  const row = await prisma.container.findFirst({
    where: { id, userId },
    include: containerInclude,
  });
  if (!row) throw new HttpError(404, "Container not found.");
  return row;
}

async function loadProduct(userId: string, id: string) {
  const row = await prisma.product.findFirst({ where: { id, userId, deletedAt: null } });
  if (!row) throw new HttpError(404, "Product not found.");
  return row;
}

async function loadRace(userId: string, id: string) {
  const row = await prisma.race.findFirst({ where: { id, userId }, include: raceInclude });
  if (!row) throw new HttpError(404, "Race not found.");
  return row;
}
