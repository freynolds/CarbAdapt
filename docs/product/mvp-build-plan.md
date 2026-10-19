# CarbAdapt – MVP Build Plan: Web App + Server (Phase 1)

*Version 2.1, 18 Oct 2026 (Express and the MySQL + Prisma seed mock data decided; seed cases proposed in §5). Version 2 was revised after Francisco's feedback: mock-data first iterations, local-only hosting, server kept minimal until integrations). Phase 1 covers the web app and server only; iOS (Swift) and Garmin Connect IQ follow once Francisco approves what he sees on the web. Sources: User Flows decisions log (#1–#159, cited as #N), Design Brief, design-prompt-delta.md, design-handoff-2026-10-18.md, Master Plan (`/workspace/carbadapt/master_current.md`), Build Plan v2 (`/workspace/carbadapt/build_plan.md`) and the research files. Nothing here adds product behavior; items marked **[Proposal]** are engineering recommendations and items marked **[Decision]** need Francisco's call (collected in §7).*

---

## 1. Scope of this phase

### 1.1 Goal
Ship a web app plus the server that iOS and Connect IQ will later reuse. The web app mirrors the iPhone screens defined in the Brief and the handoff (B1–B11 plus the already-designed screens), so Francisco can review the full product loop in a browser before iOS starts.

### 1.2 Phasing inside this phase (decided by Francisco, 18 Oct 2026)
- **Mock first.** The first iterations build the web app with no connections to external services: no OAuth, no provider APIs, no email, no weather. All app data still comes from our own server, but the server serves **mock data**: fixtures we design ourselves to look good in the preliminary views. Francisco's reason: real API data is constraining, and making our own data is easier for early iterations.
- **Real logic later.** The calc engine, real write paths and auth come in a later milestone. Integrations, webhooks and background jobs come after that (see §6).
- **Hosting (decided; resolves D6/#32 for now):**
  - At first everything runs on **localhost or on the box** for testing. No deploy, no staging, no public URL.
  - Later iterations move to **Vercel**.
  - Production hosting will probably be on **AWS**.
- In the list below, "Mock phase" means the screen is built and filled with fixture data. The real behavior arrives in the milestone shown in §6.

### 1.3 In scope (web + server, across all milestones)

**Platform basics**
- Next.js web app, Node.js API, MySQL via Prisma (Francisco's request). In the mock phase, Prisma + MySQL hold the fixtures (see §2.0).
- EN (US English) / ES / PT from day one (Master Plan §9.0, 15 Oct decision); light and dark mode (#33).
- No paywall; every beta user gets all features. Subscription is a placeholder screen (#65).

**Account and connections** (screens in the mock phase; real OAuth, magic link and sync in M3/M4)
- Onboarding questionnaire before the account (Flows §3), mode selection (#64), initial free report (a)–(e) (Flows §17 decision; Master Plan §9.0).
- Login with Strava OAuth, TrainingPeaks OAuth and email magic link (#27). Garmin login only after Garmin Connect Developer Program approval. One user can hold several identities.
- In-app account deletion (#51).
- Connections screen (B8, #106): TrainingPeaks, Strava; Garmin once approved. Planned-workout import, completed-activity webhooks, dedupe across providers.

**Screens (all from the Brief / handoff; all built against mock data first)**
- Home in both modes, with the To do list and its tiers (#36–#41, #90, A3), plus the sweat-test card (#141).
- Calendar (#44–#48), Workout detail (#43, #52–#56), Manual workout (B5, #93–#95).
- Post-workout questionnaire, also used for Add intake and Last-session feedback (#57, #58, #63, #91, #92, #102).
- Achievement celebration (B3, #80, #143).
- Progress tab (B2, #78–#82, #143, #144).
- Profile & Settings with the section order from #142 (Account, Mode & plan, Subscription placeholder, Physical data, My Gear, Product Library, Connections).
- My Gear, color picker and sip calibration flow (#59–#62), with in-field sip validation in the questionnaire (#63).
- Product Library with manual entry, favorites and the delete warning (B1, #70–#77). Label OCR on web is a **[Decision]** (see §1.5).
- Physical data with sync and conflict handling (B7, #103–#105).
- Mode & plan (B9, #107–#123): toggle, race or date target, g/h goal validation, ladder, and the "Estimate my g/h" starting-point flow.
- Sweat test (B4, #84–#89, #134, #154, #155): protocol, pre-weight, Start, post-weight step, result.
- Add race, multi-stage races, aid stations and pre-race strategy (B6, #96–#101, #125, #135, #136).
- Carb loading: loading days, rehearsal, race breakfast and pre-race hydration (B10, #118, #124–#133, #137–#140).
- Between-stage recovery (B11, #145–#153, #156–#159).

**Server-side services**
- Mock phase: a minimal API serving fixtures (§2.0).
- Calc engine as a pure package (§2.3), from M3. Until then, computed values (fueling plans, ladders, loading, recovery) are hand-made fixtures.
- Automatic weather for fluid and sodium; the user can edit it (Master Plan §9.0, D4 #30). Weather is a fixture until M4.
- Scheduling of every notification in the push table (§2.5), with fallback timers, from M4.
- Static USDA FoodData Central food list, seeded once with no API integration (#138, #139). It is a local seed with no external call, so it can be used from the mock phase.

### 1.4 Deferred beyond the web phase

| Item | Deferred to | Why / source |
|---|---|---|
| Push delivery (APNs) for all 13 notification types | iOS | Pushes are delivered on iOS (Master Plan §9.3.3). The server schedules them from M4 |
| Sign in with Apple | iOS | #34 (Guideline 4.8 applies to the iOS app) |
| Device pairing code entry (code shown on Garmin, entered in iOS) | iOS + Connect IQ | #31 |
| Device API (`/device/pairing`, `/device/protocol`) | Connect IQ phase | Master Plan §9.6.3; Build Plan §3.2 |
| In-workout eat/drink alerts and data field | Connect IQ | Flows §9 |
| "Plan sent to Connect IQ device" after manual workout save | Connect IQ (web shows the note, no delivery) | B5, #94 |
| On-device label OCR (Apple Vision) | iOS | Build Plan §3.1 recommendation |
| Garmin login and Garmin webhooks | When Garmin approves the developer program | #27, Master Plan §9.7 |
| Subscription, paywall and payments | Post-MVP | #65, Flows §17 |

### 1.5 Web-specific open points (details in §7)
- **Notifications on web: can wait.** Francisco is deferring this to the integrations milestone (M4), where scheduling exists. Options to pick from then:
  - (a) an in-app inbox (a bell, plus To do items);
  - (b) Web Push;
  - (c) modeled server-side only.

  In the mock phase, notification texts can appear as fixture entries if a screen needs them. Nothing is sent.
- **Label scan on web [Decision]:** manual entry only (Build Plan proposal), or server-side OCR of an uploaded photo. Not needed before M3.
- **Web layout [Decision]:** all designs are iPhone. **[Proposal]** Render the iPhone layouts in a centered mobile-width column on desktop instead of designing new desktop layouts.

---

## 2. Architecture overview

### 2.0 Mock-data phase: minimal setup
- **Runs on:** localhost or the box. Two processes (`web`, `api`) plus MySQL 8 in Docker. Nothing else: no Redis, no BullMQ, no worker, no queues, no external services, no deploy.
- **API:** a small Node.js HTTP server exposing the read endpoints the screens need (§4.2, marked *mock*), plus a few simple writes so forms feel real (e.g. add product, save race). Responses keep the same shape the real API will have, so screens don't change when logic arrives.
- **Login:** a mock sign-in. The login buttons (Strava, TrainingPeaks, email) are rendered but log in as one of several seeded demo athletes; a dev-only switcher changes athlete or mode. No OAuth or email until M3/M4.
- **Mock data source: decided by Francisco (18 Oct 2026).** The mock data lives in **MySQL, loaded by a Prisma seed** from typed fixture files that we author (`packages/fixtures`, TypeScript typed against the Prisma models). We design every case ourselves (§5). `pnpm db:reset` drops, migrates and reseeds. Computed outputs (fueling plans, ladder, loading days, recovery plans) are hand-made rows marked `engineVersion = "fixture"`. M3 replaces them with engine output.
- **Dates [Proposal]:** fixture dates are offsets from the day the seed runs ("today − 3 days", "race in 12 days"), so Home, the Calendar and in-progress races always look current.

### 2.1 Target architecture **[Proposal]**: Next.js web app + separate Node API (+ worker from M4)

| Option | Pros | Cons |
|---|---|---|
| **A. Next.js (UI only) + separate Node API** (recommended); a worker is added in M4 | One API for web now and iOS / Connect IQ later. From M4, webhooks ack fast and long-running workers process them, and timers (sweat-test pushes, stage fallback, briefing) get a persistent process. Matches Build Plan v2 §2 | Two processes locally (three from M4). CORS / cookie domain to set up |
| B. Next.js route handlers only | One app, less boilerplate. Fine for the mock phase | Route handlers suit request/response, not queues, retries or delayed jobs. On Vercel, functions have duration limits, so they don't suit timers. iOS and devices would depend on the web app's deploy cycle |

**Why A:** the server is the long-lived part of the product. In later milestones it holds OAuth, webhooks, the engine, notifications and the device API (Master Plan §9.3.1), and iOS and Connect IQ plug into it unchanged. In the mock phase it stays tiny.

**API framework: Express (decided by Francisco, 18 Oct 2026).** Express is the Node.js web-server framework that handles routing, request/response JSON and middleware for the API. It is used from M0 for the minimal mock API and kept for the real API later. **[Proposal]** Express has no built-in schema validation, so request validation and OpenAPI generation would use a schema library alongside it (e.g. Zod), chosen in M0.

**Hosting path (decided):** localhost or the box first, then Vercel, with production probably on AWS. Vercel suits the Next.js web app. The worker needs a long-running process, and Vercel functions don't provide one, so where the API and worker run once integrations start is an open point (§7). One assumption: the API and worker may stay on AWS or a container host even when the web is on Vercel.

### 2.2 Monorepo layout **[Proposal]** (pnpm workspaces + Turborepo; same layout as Build Plan v2 §2)

```
carbadapt/
  apps/
    web/          Next.js (App Router), i18n EN/ES/PT, light/dark
    api/          Node.js + Express API: mock endpoints first; later REST (OpenAPI 3.1), OAuth callbacks, webhooks, device API
    worker/       (from M4) Node.js job runner: sync, webhook processing, scheduling, notification dispatch
    ios/          (later) SwiftUI app, generated Swift client from OpenAPI
    garmin-ciq/   (later) Monkey C data field
  packages/
    fixtures/     Hand-designed mock data (typed TS) for demo athletes; seeds MySQL
    engine/       (from M3) Pure TS calc engine (no I/O), versioned
    db/           Prisma schema, migrations, seed (USDA food list, i18n copy keys)
    contracts/    OpenAPI 3.1 spec, device JSON schema, webhook fixtures; generated TS client
    integrations/ (from M4) Provider adapters: trainingpeaks, strava, garmin (common interface)
    i18n/         Message catalogs EN/ES/PT incl. all push copy (verbatim EN source)
    design-tokens/ Brand v1 tokens → CSS vars / Tailwind preset (Swift later)
    config/       tsconfig, eslint, prettier
  docs/           ADRs, runbooks
```

### 2.3 Shared calc engine (`packages/engine`), from M3
Pure, deterministic TypeScript functions: no database or network, unit and golden tested. Every result carries `engineVersion` so it can be audited and replayed. Modules:

| Module | Inputs → outputs | Rules (source) |
|---|---|---|
| `fueling` | workout (duration, type, sport, structure), physical data, sweat rate, weather, products, containers, mode, target g/h → totals (carbs, fluid, sodium), intake schedule markers, carry list (per container, grams and scoops, gels, solids) | Master Plan §7.1 duration bands; #37, #43, #53–#55; sips per calibrated container (Flows §4a). Fueling-mode g/h logic beyond Master Plan bands is still to be specified (Build Plan §11 item 11) |
| `ladder` (R1) | start g/h, goal g/h, target date, sport, weekly long-ride volume, planned sessions → ladder steps with approximate dates, default goal (best-case simulation), too-fast flag | #110, #113–#117, #119–#121. Research reference: `research/ramp_sim.py` |
| `adaptation` | current step + post-workout logs → advance / hold / step back | R1: +10 g/h after 2 symptom-free sessions (mild counts), max 1 step/week above 90 g/h; moderate holds, severe steps back (#114, Brief §19). Eligible sessions: cycling >2 h, running/trail >60 min (#115, #120). Late entries (#92) |
| `startingPoint` | recent workouts + picked products → g/h per workout; start = highest g/h with none/mild symptoms; fallback min(60 g/h, 1 g/kg) | #121, #122 |
| `carbLoading` | race duration, weight, choice (B / C) → D-2 / D-1 g/kg and grams, meal split, example foods (FODMAP ordering), race-breakfast ~2 g/kg, pre-race fluid/sodium in isotonic drink + water | #124, #126–#128, #133, #138–#139 |
| `stageRecovery` | stage finish/arrival, next start, stage duration, in-stage intake vs target, sport, weight, sweat rate, fluid drunk, isotonic sodium → gap case, carb/protein/fluid/sodium targets, meals | #145–#151, #153, #156–#159 |
| `sweatRate` | pre/post weight, fluid, urine, duration → L/h | #86 |
| `achievements` | tolerated g/h history → new GH_INCREASE achievement or none | #143 |
| `schedule` | domain events → notification instances (type, time, dedupe key) | #67, #140, #152, #154, #155; Flows §10 reminder |
| `sweatScheduling` | usual recovery-ride weekday, due week, carb-loading days → test date | #134, #154 |

### 2.4 Auth **[Proposal]**, from M3 (mock sign-in until then, §2.0)
- **Identities:** Strava OAuth, TrainingPeaks OAuth and email magic link now; Garmin after approval; Apple in the iOS phase (#27, #34). They are stored in `AuthIdentity`, many per user, and merged only after the user confirms (Build Plan §3.3).
- **Sessions:** the API issues opaque session tokens (hashed in `Session`). Web keeps them in an httpOnly, Secure, SameSite cookie on a shared parent domain (e.g. `app.` and `api.` subdomains). iOS later uses the same tokens as bearer tokens.
- **Onboarding before the account:** answers are saved against an anonymous id (`OnboardingAnswers.anonId`) and attached to the user at signup (Flows §3).
- **Provider tokens:** encrypted at rest (envelope encryption; key in the host's secret manager once hosted). Clients never hold provider secrets (Master Plan §9.3.1).

### 2.5 Background jobs and scheduling **[Proposal]**, from M4 (not needed in the mock phase)
- **Queue:** BullMQ on Redis for delayed and retryable jobs. MySQL stays the source of truth: every scheduled notification is a `Notification` row with a unique `dedupeKey`, so jobs can be rebuilt after a restart. Alternative if Redis is unwanted: a MySQL-polled scheduler. The choice is made at M4, together with where the worker is hosted.
- **Platform sync:** on connect, then on webhooks, plus a periodic reconciliation sweep. TrainingPeaks: respect the 7-day cache rule (Build Plan §4).
- **Recalculation:** on any change to a workout, physical data, gear, products or plan, regenerate the affected `FuelingPlan` and reschedule notifications. A workout changed after the briefing is sent updates silently, with no new push (#69).
- **Notification rules** (all copy comes from i18n keys; EN verbatim from the handoff):

| Type | Scheduled when | Time | Cancel / dedupe |
|---|---|---|---|
| Daily briefing | Workout exists for the day | User-chosen time, evening before or same day (#67) | None on no-workout days (#68) |
| Post-workout | Completed-activity webhook matched | On arrival (#57) | Dedupe across providers; reminder once later (Flows §10); fallback check after planned end if no webhook (Master Plan §9.3.3) |
| Sweat test night before / day / end / incomplete / quarterly | Sweat test scheduled or started | Night before; 1 h before planned start; at test end; 2 h after end if data missing; 3 months after last test, night before that week's recovery day (#155) | Moved with the test (#134, #154) |
| Carb loading D-2 / D-1 | Race saved with 2-day / 1-day loading | On each loading day; time of day TBD | Cancelled if loading changed to None |
| Race breakfast | Race saved | Night before the race (#129); time of day TBD | — |
| Loading rehearsal | Rehearsal suggested | Rehearsal day (#131); time of day TBD | Cancelled on dismiss (#137) |
| Stage complete | Stage activity webhook arrives, or fallback timer | On arrival; fallback at stage start + estimated duration × 1.5 (#152) | One per stage (`dedupeKey = STAGE_COMPLETE:<stageId>`); the arrival time feeds `stageRecovery` |

### 2.6 Integration webhooks, from M4
- Each provider has its own adapter in `packages/integrations` behind one interface: `listPlannedWorkouts`, `getCompletedActivity`, `subscribeWebhooks`, `refreshToken` (Master Plan §9.3.1).
- The webhook endpoint (`POST /webhooks/:provider`) verifies the event, stores a `WebhookEvent` (idempotent on provider + externalId + eventType), acks fast (Strava requires 200 within 2 s) and enqueues the work. The worker then fetches details, matches the event to a planned workout, dedupes and emits domain events (`ActivityCompleted`, `WorkoutChanged`, …).
- Strava data is shown only to its owner and never used for model training (Master Plan §9.7).
- Webhook fixtures in `packages/contracts` are replayed in CI.
- Provider callbacks need a public HTTPS URL. There is none in the local phase, so they are first tested by replaying fixtures locally. Live callbacks start once the app moves to Vercel or AWS in M4.

### 2.7 Where iOS and Connect IQ plug in later (M5)
- **iOS** consumes the same OpenAPI with a generated Swift client and the same session tokens, adding APNs device-token registration (`POST /me/push-tokens`), Sign in with Apple and Vision OCR. Notifications switch `channel` to `APNS`, and the scheduler is unchanged.
- **Connect IQ** gets a small versioned device API: pairing code and nonce, then `GET /device/protocol?date=` returning a compact intake schedule built from `FuelingPlan.schedule` (Build Plan §3.2). A `Device` / `PairingCode` model is added in that phase.

---

## 3. High-level Prisma schema (MySQL)

Notes: high level only (key fields, relations and enums). JSON columns hold structures the engine owns (schedules, carry lists, meals). Fields marked `// inferred` are proposals not stated in the docs. Validated with `prisma validate` (Prisma 5.22).

```prisma
// CarbAdapt – high-level Prisma schema (MVP, web + server phase)
// Fields marked "// inferred" are not stated in the docs; they are proposals to confirm.
// Units: metric only, stored in base units (kg, g, ml, mg, min, km, m). Timestamps UTC.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ───────────── Enums ─────────────

enum Mode {
  FUEL_MY_WORKOUTS
  GUT_TRAINING
}

enum Locale {
  EN_US
  ES
  PT
}

enum ThemePref {
  SYSTEM
  LIGHT
  DARK
}

enum AuthProvider {
  EMAIL_MAGIC_LINK
  STRAVA
  TRAININGPEAKS
  GARMIN // only after Garmin Connect Developer Program approval
  APPLE  // Sign in with Apple, iOS phase (#34)
}

enum DataProvider {
  TRAININGPEAKS
  GARMIN
  STRAVA
}

enum ConnectionStatus {
  CONNECTED
  DISCONNECTED
  REVOKED // inferred: token revoked by provider
}

enum Sport {
  CYCLING
  RUNNING
  TRAIL_RUNNING
  OTHER // inferred
}

enum WorkoutType {
  BASE
  THRESHOLD
  VO2MAX
  ANAEROBIC
  RECOVERY
}

enum WorkoutKind {
  STANDARD
  SWEAT_TEST // special workout type (#87, #141)
}

enum WorkoutSource {
  MANUAL
  TRAININGPEAKS
  GARMIN
  STRAVA
}

enum WorkoutStatus {
  PLANNED
  COMPLETED
  SKIPPED // inferred (Flows §14: skipped/changed workout)
}

enum Symptom {
  NONE
  MILD
  MODERATE
  SEVERE
}

enum ContainerType {
  BOTTLE
  SOFT_FLASK
  BLADDER
}

enum ContainerContent {
  WATER
  ISOTONIC
  GEL_CONCENTRATE
}

enum ProductType {
  DRINK_MIX
  GEL
  SOLID
}

enum ProductSource {
  SCAN
  MANUAL
}

enum FodmapLevel {
  LOW
  HIGH
}

enum SweatTestStatus {
  SCHEDULED
  IN_PROGRESS
  AWAITING_DATA
  COMPLETED
  RESCHEDULED // #134 / #154
}

enum PlanStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum LadderStepStatus {
  DONE
  CURRENT
  UPCOMING
}

enum AdaptationOutcome {
  ADVANCE
  HOLD
  STEP_BACK
}

enum GutTargetKind {
  RACE
  DATE
}

enum CarbLoadingChoice {
  NONE
  TWO_DAY // protocol B (#124)
  ONE_DAY // protocol C (#124)
}

enum LoadingDay {
  D_MINUS_2
  D_MINUS_1
}

enum RehearsalStatus {
  SUGGESTED
  DISMISSED // #137
  DONE      // inferred
}

enum StageGapCase {
  UNDER_4H
  H4_TO_12H
  OVERNIGHT
  REST_DAY
}

enum ArrivalSource {
  PLATFORM_WEBHOOK
  FALLBACK_TIMER // start + estimated duration × 1.5 (#152)
}

enum AchievementType {
  GH_INCREASE // only type for now (#143)
}

enum TodoType {
  LAST_SESSION_FEEDBACK
  SIP_CALIBRATION
  SIP_VALIDATION
  SWEAT_TEST
  COMPLETE_PROFILE
  ADD_BOTTLE
  ADD_RACE
  CONNECT_CALENDAR
  PRE_RACE_STRATEGY
  DATA_CONFLICT
  ESTIMATE_GH
  LOADING_REHEARSAL
}

enum TodoTier {
  HIGHEST
  CALIBRATION
  LOWER
}

enum TodoStatus {
  OPEN
  DONE
  DISMISSED
}

enum NotificationType {
  DAILY_BRIEFING
  POST_WORKOUT
  POST_WORKOUT_REMINDER // "remind once later" (Flows §10)
  SWEAT_TEST_NIGHT_BEFORE
  SWEAT_TEST_DAY
  SWEAT_TEST_END
  SWEAT_TEST_INCOMPLETE
  SWEAT_TEST_QUARTERLY
  CARB_LOADING_D2
  CARB_LOADING_D1
  RACE_BREAKFAST
  LOADING_REHEARSAL
  STAGE_COMPLETE
}

enum NotificationChannel {
  APNS   // iOS phase
  IN_APP // web phase, pending decision
}

enum NotificationStatus {
  SCHEDULED
  SENT
  CANCELLED
  FAILED
}

enum SubscriptionStatus {
  BETA_ALL_ACCESS // MVP: no paywall (#65)
}

// ───────────── Identity & account ─────────────

model User {
  id         String    @id @default(cuid())
  email      String?   @unique
  emailVerifiedAt DateTime?
  name       String?
  locale     Locale    @default(EN_US)
  theme      ThemePref @default(SYSTEM)
  timezone   String    // IANA, e.g. America/Argentina/Buenos_Aires
  mode       Mode      @default(FUEL_MY_WORKOUTS)
  briefingTimeLocal String? // "HH:mm" (#67) – inferred format
  briefingDayBefore Boolean @default(true) // evening before vs same day (#67)
  createdAt  DateTime  @default(now())
  deletedAt  DateTime? // in-app account deletion (#51)

  identities     AuthIdentity[]
  sessions       Session[]
  physical       PhysicalData?
  conflicts      PhysicalDataConflict[]
  connections    ProviderConnection[]
  containers     Container[]
  products       Product[]
  workouts       Workout[]
  activities     Activity[]
  sweatTests     SweatTest[]
  gutPlans       GutTrainingPlan[]
  races          Race[]
  achievements   Achievement[]
  todos          TodoItem[]
  notifications  Notification[]
  subscription   Subscription?
  onboarding     OnboardingAnswers?
}

model AuthIdentity {
  id             String       @id @default(cuid())
  userId         String
  provider       AuthProvider
  providerUserId String
  email          String?
  linkedAt       DateTime     @default(now())
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerUserId])
}

model MagicLinkToken {
  id        String    @id @default(cuid())
  email     String
  tokenHash String    @unique
  expiresAt DateTime
  usedAt    DateTime?
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model OnboardingAnswers {
  id        String   @id @default(cuid())
  userId    String?  @unique
  anonId    String   @unique // answers exist before the account (Flows §3)
  answers   Json     // per-step questionnaire answers
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PhysicalData {
  userId        String   @id
  weightKg      Decimal? @db.Decimal(5, 2)
  ftpW          Int?
  sweatRateLPerH Decimal? @db.Decimal(4, 2)
  sweatRateSource String? // "estimate" | "sweat_test" (Flows §3) – inferred as string
  ghTolerance   Int?     // tolerated g/h
  maxHr         Int?
  hrZones       Json?
  age           Int?
  sex           String?  // inferred: free enum TBD
  heightCm      Int?
  fieldSources  Json?    // per field: MANUAL or provider (#104) – inferred shape
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PhysicalDataConflict { // #105: To do asks which value to keep
  id           String       @id @default(cuid())
  userId       String
  field        String       // ftp | weight | zones
  manualValue  Json
  syncedValue  Json
  provider     DataProvider
  resolvedWith String?      // "manual" | "synced"
  resolvedAt   DateTime?
  createdAt    DateTime     @default(now())
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ProviderConnection {
  id             String           @id @default(cuid())
  userId         String
  provider       DataProvider
  externalUserId String
  accessTokenEnc String           @db.Text // encrypted at rest
  refreshTokenEnc String?         @db.Text
  expiresAt      DateTime?
  scopes         String?
  status         ConnectionStatus @default(CONNECTED)
  webhookSubscriptionId String?
  lastSyncAt     DateTime?        // stored, not shown in UI (#106)
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, provider])
}

model WebhookEvent { // raw inbound events, idempotency + replay
  id          String       @id @default(cuid())
  provider    DataProvider
  externalId  String
  eventType   String
  payload     Json
  receivedAt  DateTime     @default(now())
  processedAt DateTime?

  @@unique([provider, externalId, eventType])
}

model Subscription { // placeholder, post-MVP (#65)
  userId String             @id
  status SubscriptionStatus @default(BETA_ALL_ACCESS)
  user   User               @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ───────────── Gear & products ─────────────

model Container {
  id           String           @id @default(cuid())
  userId       String
  type         ContainerType
  name         String           // e.g. "Red bottle"
  colorHex     String?
  capacityMl   Int
  usualContent ContainerContent @default(WATER)
  createdAt    DateTime         @default(now())
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  calibrations ContainerCalibration[]
}

model ContainerCalibration {
  id            String    @id @default(cuid())
  containerId   String
  weightsG      Json      // [start, after 1, after 2, after 3 sips]
  mlPerSip      Decimal?  @db.Decimal(5, 2)
  gPerSqueeze   Decimal?  @db.Decimal(5, 2) // soft flasks
  createdAt     DateTime  @default(now())
  validationsLeft Int     @default(4) // in-field validation, first 3–4 workouts – inferred counter
  container     Container @relation(fields: [containerId], references: [id], onDelete: Cascade)
}

model Product {
  id          String        @id @default(cuid())
  userId      String
  type        ProductType
  name        String
  brand       String?
  servingG    Decimal?      @db.Decimal(6, 2)
  scoopG      Decimal?      @db.Decimal(6, 2) // scoop size from label (#37)
  carbsG      Decimal       @db.Decimal(6, 2) // per serving
  sodiumMg    Int?
  caffeineMg  Int?
  label       Json?         // full label data (#75)
  favorite    Boolean       @default(false)
  source      ProductSource @default(MANUAL)
  createdAt   DateTime      @default(now())
  deletedAt   DateTime?
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model FoodItem { // static curated USDA FoodData Central list (#138–#139), seeded
  id          Int          @id @default(autoincrement())
  fdcId       Int          @unique
  name        String
  category    String?      // inferred
  carbsPer100g   Decimal   @db.Decimal(6, 2)
  proteinPer100g Decimal?  @db.Decimal(6, 2) // inferred: needed for between-stage protein
  fatPer100g     Decimal?  @db.Decimal(6, 2) // inferred: low-fat guidance
  fiberPer100g   Decimal?  @db.Decimal(6, 2) // inferred: low-fiber guidance
  portionG    Decimal?     @db.Decimal(6, 2) // inferred: default portion
  portionLabel String?     // inferred
  fodmap      FodmapLevel? // #127
}

// ───────────── Workouts, plans, intake ─────────────

model Workout { // planned (synced or manual)
  id              String        @id @default(cuid())
  userId          String
  source          WorkoutSource
  externalId      String?
  sport           Sport
  kind            WorkoutKind   @default(STANDARD)
  workoutType     WorkoutType?  // null = Unstructured (#48)
  name            String
  plannedStart    DateTime?     // manual workouts have no start time (#93)
  plannedDate     DateTime      @db.Date
  durationMin     Int?
  structure       Json?         // blocks/zones from the platform
  status          WorkoutStatus @default(PLANNED)
  sourceUpdatedAt DateTime?
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  fuelingPlans    FuelingPlan[]
  activity        Activity?
  feedback        PostWorkoutLog?
  sweatTest       SweatTest?

  @@unique([source, externalId])
  @@index([userId, plannedDate])
}

model Activity { // completed activity from a provider
  id           String       @id @default(cuid())
  userId       String
  provider     DataProvider
  externalId   String
  workoutId    String?      @unique // match to planned workout
  startAt      DateTime
  durationMin  Int
  summary      Json?        // avg power/HR/pace, kJ
  dedupeGroup  String?      // same ride on several platforms
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  workout      Workout?     @relation(fields: [workoutId], references: [id])

  @@unique([provider, externalId])
}

model FuelingPlan {
  id             String   @id @default(cuid())
  workoutId      String
  engineVersion  String
  targetGPerH    Int?
  totalCarbsG    Int
  totalFluidMl   Int
  totalSodiumMg  Int
  schedule       Json     // intake markers (water/isotonic/gel/solid) over time
  carryList      Json     // per container + gels + solids (scoops, grams)
  userAdjusted   Boolean  @default(false) // more/less stepper (#55 area)
  isCurrent      Boolean  @default(true)
  weather        Json?    // forecast snapshot, user-editable
  createdAt      DateTime @default(now())
  workout        Workout  @relation(fields: [workoutId], references: [id], onDelete: Cascade)
}

model PostWorkoutLog { // questionnaire; also Add intake / Last-session feedback
  id             String   @id @default(cuid())
  workoutId      String   @unique
  intakeCarbsG   Int?
  intakeItems    Json?    // products picked from the library
  intakeTiming   Json?
  fluidMl        Int?
  symptomUpper   Symptom?
  symptomLower   Symptom?
  symptomSystemic Symptom?
  feeling        String?
  containerWeighIns Json?  // sip validation, first 3–4 workouts
  followedPrompts Boolean?
  sipProposal    Json?    // proposed ml/sip + accepted/rejected
  sweatPostWeightKg Decimal? @db.Decimal(5, 2) // sweat test step
  countsForPlan  Boolean  @default(true) // false for late entries from earlier periods (#92)
  submittedAt    DateTime @default(now())
  workout        Workout  @relation(fields: [workoutId], references: [id], onDelete: Cascade)
}

// ───────────── Sweat test ─────────────

model SweatTest {
  id            String          @id @default(cuid())
  userId        String
  workoutId     String?         @unique
  status        SweatTestStatus @default(SCHEDULED)
  scheduledFor  DateTime        @db.Date
  preWeightKg   Decimal?        @db.Decimal(5, 2)
  postWeightKg  Decimal?        @db.Decimal(5, 2)
  fluidMl       Int?
  urineMl       Int?
  startedAt     DateTime?
  endedAt       DateTime?
  temperatureC  Decimal?        @db.Decimal(4, 1)
  humidityPct   Int?
  sweatRateLPerH Decimal?       @db.Decimal(4, 2)
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  workout       Workout?        @relation(fields: [workoutId], references: [id])
}

// ───────────── Gut training ─────────────

model GutTrainingPlan {
  id          String        @id @default(cuid())
  userId      String
  targetKind  GutTargetKind
  raceId      String?
  targetDate  DateTime      @db.Date
  startGh     Int
  goalGh      Int           // max 200, warn > 120 (#110)
  defaultGh   Int?          // simulated best case (#114)
  tooFast     Boolean       @default(false) // #113 saved anyway
  status      PlanStatus    @default(ACTIVE)
  engineVersion String
  createdAt   DateTime      @default(now())
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  race        Race?         @relation(fields: [raceId], references: [id])
  steps       LadderStep[]
  decisions   AdaptationDecision[]
}

model LadderStep {
  id          String           @id @default(cuid())
  planId      String
  index       Int
  gh          Int
  approxDate  DateTime?        @db.Date
  status      LadderStepStatus @default(UPCOMING)
  plan        GutTrainingPlan  @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@unique([planId, index])
}

model AdaptationDecision {
  id         String            @id @default(cuid())
  planId     String
  outcome    AdaptationOutcome
  fromGh     Int
  toGh       Int
  inputLogIds Json             // PostWorkoutLog ids used
  reason     String?
  engineVersion String
  createdAt  DateTime          @default(now())
  plan       GutTrainingPlan   @relation(fields: [planId], references: [id], onDelete: Cascade)
}

model Achievement {
  id          String          @id @default(cuid())
  userId      String
  type        AchievementType @default(GH_INCREASE)
  valueGh     Int
  workoutId   String?
  achievedAt  DateTime        @default(now())
  celebratedAt DateTime?      // celebration shown at end of questionnaire
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ───────────── Races, stages, loading, recovery ─────────────

model Race {
  id                String            @id @default(cuid())
  userId            String
  name              String
  date              DateTime          @db.Date
  estimatedDurationMin Int
  type              String            // race type – values TBD
  distanceKm        Decimal?          @db.Decimal(7, 2)
  elevationGainM    Int?
  carbLoading       CarbLoadingChoice @default(NONE)
  isMultiStage      Boolean           @default(false)
  createdAt         DateTime          @default(now())
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  stages            Stage[]
  aidStations       AidStation[]
  strategies        RaceStrategy[]
  loadingDays       CarbLoadingDay[]
  rehearsal         LoadingRehearsal?
  gutPlans          GutTrainingPlan[]
}

model Stage {
  id                String     @id @default(cuid())
  raceId            String
  index             Int
  date              DateTime   @db.Date
  startAt           DateTime
  estimatedDurationMin Int
  type              String
  distanceKm        Decimal?   @db.Decimal(7, 2)
  elevationGainM    Int?
  activityId        String?    // matched completed activity – inferred
  arrivalAt         DateTime?  // defined by the stage push (#152)
  arrivalSource     ArrivalSource?
  race              Race       @relation(fields: [raceId], references: [id], onDelete: Cascade)
  aidStations       AidStation[]
  recovery          StageRecoveryPlan?

  @@unique([raceId, index])
}

model AidStation {
  id           String  @id @default(cuid())
  raceId       String?
  stageId      String?
  kmMark       Decimal @db.Decimal(7, 2)
  hasWater     Boolean @default(false)
  hasIsotonic  Boolean @default(false)
  hasGels      Boolean @default(false)
  race         Race?   @relation(fields: [raceId], references: [id], onDelete: Cascade)
  stage        Stage?  @relation(fields: [stageId], references: [id], onDelete: Cascade)
}

model RaceStrategy { // pre-race strategy plan options (#100–#101)
  id          String   @id @default(cuid())
  raceId      String
  refillPoints Json    // user-entered
  description String   @db.Text
  carryList   Json
  chosen      Boolean  @default(false) // user picks, never automatic
  race        Race     @relation(fields: [raceId], references: [id], onDelete: Cascade)
}

model CarbLoadingDay {
  id           String     @id @default(cuid())
  raceId       String
  day          LoadingDay
  date         DateTime   @db.Date
  gPerKg       Decimal    @db.Decimal(4, 1)
  targetCarbsG Int
  meals        Json       // per meal + portion, example foods (FoodItem ids)
  isRehearsal  Boolean    @default(false)
  race         Race       @relation(fields: [raceId], references: [id], onDelete: Cascade)

  @@unique([raceId, day, isRehearsal])
}

model LoadingRehearsal { // #130, #131, #137
  id          String          @id @default(cuid())
  raceId      String          @unique
  date        DateTime        @db.Date // day before a long ride, ~1 week pre-race
  longRideWorkoutId String?
  status      RehearsalStatus @default(SUGGESTED)
  dismissedAt DateTime?
  race        Race            @relation(fields: [raceId], references: [id], onDelete: Cascade)
}

model StageRecoveryPlan { // #145–#153, #156–#159
  id             String       @id @default(cuid())
  stageId        String       @unique // the stage just finished
  gapCase        StageGapCase
  gapMin         Int?
  carbsTargetG   Int
  proteinTargetG Int?
  fluidTargetMl  Int?
  sodiumTargetMg Int?
  sensitiveStomach Boolean    @default(false)
  meals          Json         // grams per meal and portion, example meals
  engineVersion  String
  stage          Stage        @relation(fields: [stageId], references: [id], onDelete: Cascade)
}

// ───────────── To do & notifications ─────────────

model TodoItem {
  id         String     @id @default(cuid())
  userId     String
  type       TodoType
  tier       TodoTier
  refType    String?    // e.g. "Workout", "Race", "Container", "PhysicalDataConflict"
  refId      String?
  payload    Json?
  status     TodoStatus @default(OPEN)
  createdAt  DateTime   @default(now())
  closedAt   DateTime?
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
}

model Notification {
  id          String              @id @default(cuid())
  userId      String
  type        NotificationType
  channel     NotificationChannel
  scheduledAt DateTime
  sentAt      DateTime?
  readAt      DateTime?           // in-app inbox, if chosen
  copyKey     String              // i18n key for the verbatim copy
  deepLink    String?
  refType     String?
  refId       String?
  dedupeKey   String              @unique // e.g. STAGE_COMPLETE:<stageId> – one per stage (#152)
  status      NotificationStatus  @default(SCHEDULED)
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status, scheduledAt])
}
```

**Deliberately not modeled yet:** Device and PairingCode (Connect IQ phase); APNs push tokens (iOS phase); payments (post-MVP); a product-scan audit table (depends on the web OCR decision); a weather snapshot table (kept as `FuelingPlan.weather` JSON for now).

---

## 4. Web app structure

### 4.1 Route / page map (Next.js App Router)

| Route | Screen | Source |
|---|---|---|
| `/onboarding/[step]` | Questionnaire (no account yet) | Flows §3 |
| `/onboarding/mode` | Mode selection (two large cards) | A7, #64 |
| `/signup`, `/login`, `/auth/callback/[provider]`, `/auth/magic` | Account creation / login | #27 |
| `/report` | Initial free report (a)–(e) | Flows §17 |
| `/home` | Home, Fueling or Gut-training variant, To do list | #36–#41, A2–A3 |
| `/calendar` | Continuous list anchored on today | #44–#48 |
| `/calendar/new` | **B5** Manual workout | #93–#95 |
| `/workouts/[id]` | Workout detail (chart, carry list, block table, adjust) | #43, #52–#56 |
| `/workouts/[id]/questionnaire` | Post-workout questionnaire / Add intake / Last-session feedback (modal route) | #57, #91, #102 |
| `/celebration/[achievementId]` | **B3** Achievement celebration (modal route) | #80 |
| `/progress` | **B2** Progress tab | #78–#82, #143–#144 |
| `/profile` | Profile & Settings (section order #142) | #49–#50, #142 |
| `/profile/account` | Account + Delete account | #51 |
| `/profile/mode-plan` | **B9** Mode & plan (+ too-fast warning state) | #107–#113 |
| `/profile/mode-plan/estimate` | **B9** "Estimate my g/h" starting-point input | #121–#123 |
| `/profile/physical-data` | **B7** Physical data | #103–#105 |
| `/profile/gear`, `/profile/gear/[id]` | My Gear, add/edit container (+ color picker sheet) | #59–#61 |
| `/profile/gear/[id]/calibrate` | Sip calibration flow | #62 |
| `/profile/products`, `/profile/products/new`, `/profile/products/[id]` | **B1** Product Library, manual entry / scan confirm, detail | #70–#77 |
| `/profile/connections` | **B8** Connections | #106 |
| `/profile/subscription` | Placeholder (black screen, title only) | #65, C |
| `/sweat-test/[id]` | **B4** Protocol → pre-weight → Start → in-progress → result | #84–#89 |
| `/races/new`, `/races/[id]/edit` | **B6** Add race (+ multi-stage, aid stations) | #96–#97, #125, #136 |
| `/races/[id]/strategy` | **B6** Pre-race strategy (plan carousel) | #98–#101 |
| `/races/[id]/loading/[day]` | **B10** Loading-day screen (D-2 / D-1 / rehearsal) | #124–#127 |
| `/races/[id]/breakfast` | **B10** Race-breakfast screen (+ hydration) | #128, #133 |
| `/races/[id]/stages/[stageId]/recovery` | **B11** Between-stage recovery | #145–#159 |
| `/notifications` | In-app inbox (only if option (a) in §1.5 is chosen at M4) | [Decision, M4] |

### 4.2 Main API endpoints (REST, OpenAPI 3.1)

*Mock phase (M1–M2): all `GET` endpoints, plus simple create/update for products, gear, races and manual workouts, serving or saving fixture rows, plus `POST /dev/login-as` and `POST /dev/reset` (local only). Auth, connections, webhooks, notifications and admin endpoints arrive in M3/M4.*


- **Auth:** `POST /auth/magic-link`, `POST /auth/magic-link/verify`, `GET /auth/:provider/start`, `GET /auth/:provider/callback`, `POST /auth/logout`, `POST /onboarding/answers` (anon, idempotent per step), `POST /onboarding/claim`
- **Me:** `GET/PATCH /me` (locale, theme, timezone, mode, briefing time), `DELETE /me`, `GET/PATCH /me/physical-data`, `GET /me/conflicts`, `POST /me/conflicts/:id/resolve`
- **Connections:** `GET /connections`, `POST /connections/:provider` (start OAuth), `DELETE /connections/:provider`
- **Webhooks:** `POST /webhooks/strava` (+ `GET` subscription validation), `POST /webhooks/trainingpeaks`, `POST /webhooks/garmin` (later)
- **Workouts:** `GET /workouts?from&to`, `POST /workouts` (manual), `GET/PATCH/DELETE /workouts/:id`, `GET /workouts/:id/fueling-plan`, `PATCH /workouts/:id/fueling-plan` (more/less adjust), `POST /workouts/:id/feedback` (questionnaire)
- **Home:** `GET /home` (hero + To do), `PATCH /todos/:id` (done / dismiss)
- **Progress:** `GET /progress`, `GET /achievements/pending` (celebration), `POST /achievements/:id/celebrated`
- **Gear:** `GET/POST /containers`, `GET/PATCH/DELETE /containers/:id`, `POST /containers/:id/calibrations`, `POST /calibrations/:id/proposal` (accept / reject sip update)
- **Products:** `GET/POST /products`, `GET/PATCH/DELETE /products/:id` (delete returns affected workouts → replacement), `POST /products/scan` (only if web OCR is chosen)
- **Foods:** `GET /foods?query` (static USDA list)
- **Gut plan:** `GET/PUT /gut-plan`, `POST /gut-plan/preview` (validation, default goal, ladder), `GET /gut-plan/starting-point/workouts`, `POST /gut-plan/starting-point`
- **Sweat test:** `POST /sweat-tests`, `GET /sweat-tests/:id`, `POST /sweat-tests/:id/start` (pre-weight), `POST /sweat-tests/:id/complete`
- **Races:** `GET/POST /races`, `GET/PATCH/DELETE /races/:id`, stages and aid stations nested, `POST /races/:id/strategies/generate`, `POST /races/:id/strategies/:sid/choose`, `GET /races/:id/loading/:day`, `GET /races/:id/breakfast`, `POST /races/:id/rehearsal/dismiss`, `GET /stages/:id/recovery`, `PATCH /stages/:id/recovery` (sensitive stomach toggle)
- **Notifications:** `GET /notifications`, `POST /notifications/:id/read` (in-app option)
- **Internal / admin:** `GET /admin/notifications` (scheduled queue view), `POST /admin/webhooks/replay` (non-production only)

---

## 5. Proposed seed cases (mock data) **[Proposal: for Francisco to review]**

These are the demo athletes and scenarios the Prisma seed will load in M1, chosen so that every screen in §4.1 and every state in the handoff has data to show. The names and numbers are illustrative; the rules each case shows come from the cited decisions. No seed code has been written yet. In the mock phase the values are hand-made: they should follow the cited rules, and M3 checks them against the engine.

### 5.1 Demo athletes

| # | Athlete | Sport | Mode | Story |
|---|---|---|---|---|
| A | **Ana** | Road cyclist | Gut training, **in progress** | Ladder 60 → 90 g/h toward a future Gran Fondo. Full gear and library, two platforms connected. The main showcase |
| B | **Bruno** | Trail runner | Gut training, **completed** | Reached 100 g/h. Now mid-way through a multi-stage **trail** race |
| C | **Carla** | Road cyclist | **Fuel my workouts** | Mid-way through a 7-stage road race that covers every between-stage gap case |
| E | **Eli** | Road runner | **Fuel my workouts** | Calibration, validation and data-conflict states; sweat test with missing data; a race without loading |
| D | **Dani** | Cyclist | Not chosen yet → Gut training without a known g/h | Just onboarded, with every empty state and "first steps" To do item |

The dev switcher (§2.0) moves between athletes and can flip mode on any of them.

### 5.2 Scenario coverage

**Modes and Home**

| Case | Athlete | Seeded data | Feeds |
|---|---|---|---|
| Gut-training Home | A | Current ladder step, today's eligible long ride (> 2 h) with plan at the step's g/h | Home (Gut training) |
| Fuel-my-workouts Home | C, E | Today's workout with fueling plan and carry list | Home (Fueling) |
| New-user Home | D | No workouts. To do: Complete your profile, Connect your calendar, Add a bottle, Add your next race, Estimate my g/h | Home empty states, A3 tiers |
| Sweat-test card | A | Sweat test scheduled this week (Tarmac card, Glucose border, clipped corner, #141) | Home |

**Workouts and Calendar**

| Case | Athlete | Seeded data | Feeds |
|---|---|---|---|
| Mixed calendar | A | Synced TrainingPeaks planned workouts, completed Strava activities, rest days, a **manual** workout (B5), an **unstructured** workout (no type, #48), loading-day entries, race entries, a sweat-test entry and a rehearsal entry | Calendar, Workout detail, Manual workout |
| Structured workout detail | A, C | Block structure, intake markers, carry list per container, weather snapshot | Workout detail (#43, #52–#56) |
| Duplicate across providers | A | One ride present on Strava and TrainingPeaks, stored as a single Activity | Calendar (dedupe display) |

**Ladder and g/h target (B9)**

| Case | Athlete | Seeded data | Feeds |
|---|---|---|---|
| Ladder in progress | A | Start 60, goal 90 g/h, race target. Steps DONE / CURRENT / UPCOMING with approximate dates; target reached 4 long rides before the race (#117) | Mode & plan, Progress |
| Ladder completed | B | Plan COMPLETED, 80 → 100 g/h, all steps DONE; steps above 90 g/h at most 1 per week (#114) | Mode & plan, Progress |
| Date target | E (switch to Gut training) | Date target instead of a race | Mode & plan target picker |
| Too-fast goal | C (switch to Gut training) | Date 2 weeks out; the mock preview endpoint returns the too-fast warning for 60 → 120 g/h with suggested alternatives | Too-fast warning state |
| Unknown g/h → Estimate my g/h | D | 4–5 recent "platform" workouts (fixtures) plus a small library, for the per-workout product picker; the live g/h result and the min(60 g/h, 1 g/kg) fallback | Starting-point input (#121–#123) |

**Questionnaire and symptom history**

| Case | Athlete | Seeded data | Feeds |
|---|---|---|---|
| Symptom mix with outcomes | A | Logged sessions rated **none, mild, moderate, severe**, with decisions **advance** (2 symptom-free incl. mild), **hold** (moderate) and **step back** (severe) (#114) | Progress history, ladder state |
| Ineligible session | A | A < 2 h ride logged but not counted for the ladder (#115) | Progress |
| Running eligibility | B | Runs > 60 min counted, < 60 min not (#120) | Progress |
| Late entry | A | Questionnaire filled in days after the workout (#92) | Progress |
| Pending feedback | A, E | "Last-session feedback" To do and an "Add intake" entry point | Questionnaire (#91, #102) |

**Achievements**

| Case | Athlete | Seeded data | Feeds |
|---|---|---|---|
| History plus pending celebration | A | g/h-increase achievements 60 → 70 → 80, plus one new achievement not yet celebrated | Achievement celebration (B3), Progress (#143) |
| Long history | B | Achievements up to 100 g/h | Progress |
| None yet | D | Empty | Progress empty state |

**Races, carb loading and race breakfast (B6, B10)**

| Case | Athlete | Seeded data | Feeds |
|---|---|---|---|
| Protocol B (2-day), race ≥ 4 h | A: Gran Fondo (target race) | D-2 and D-1 loading days at the low end of the band (D-2 10 g/kg, D-1 10–12 g/kg), meals split with "example foods TBD", FODMAP-ordered food examples | Loading-day screen, Calendar entries |
| Protocol C (1-day), race 2.5–4 h | A: road race | D-1 only (~10 g/kg high-GI, low-fiber); normal eating on D-2 | Loading-day screen |
| Protocol B, race 90 min–2.5 h | E: a second race (e.g. a 2 h road 25 km) | D-2 5–7 g/kg and D-1 7–8 g/kg band | Loading-day screen (band check) |
| No loading | E: road half marathon | Carb loading None, no loading entries | Race without loading |
| Race breakfast, normal start | A: Gran Fondo | ~2 g/kg 2–3 h before; pre-race fluid and sodium as isotonic drink plus remainder as water (#133) | Race-breakfast screen |
| Race breakfast, early start | A: road race (e.g. 06:30 start) | Early-start guidance (prepare the night before, wake 2–3 h before and go back to sleep; smaller-breakfast fallback) | Race-breakfast screen |
| Rehearsal suggested | A: Gran Fondo | Rehearsal on the day before a long ride about 1 week out: To do plus calendar entry | Loading rehearsal (#130–#131) |
| Rehearsal dismissed | A: road race | Dismissed rehearsal: no To do, no entry (#137) | Dismiss state |
| Pre-race strategy, several plans | A: Gran Fondo | Needs exceed containers; aid stations (km, water / isotonic / gels); 2–3 generated plans, none chosen | Strategy carousel (B6) |
| Pre-race strategy, one plan | B | A single plan, no carousel | Strategy (single) |

**Multi-stage races and between-stage recovery (B11)**

| Case | Athlete / stage gap | Seeded data | Feeds |
|---|---|---|---|
| Under 1.5 h | C: S1 → S2, same morning (e.g. 75 min) | Gap case under 4 h with a gap under 90 min: liquids and gels only | Recovery screen |
| Under 4 h | C: S3 → S4, same day (e.g. 3 h) | 1–1.2 g/kg/h every 15–30 min until 30–45 min before the start; protein 0.3 g/kg first intake | Recovery screen |
| 4–12 h | C: S5 → S6, morning and evening (e.g. 8 h) | First 4 h at 1–1.2 g/kg/h, then meals plus a pre-start meal 1–2 g/kg 2–3 h before | Recovery screen |
| Overnight, all duration bands | C: S2 → S3 (stage < 2.5 h → 5–6 g/kg), S4 → S5 (2.5–4 h → 6–8 g/kg); B: one stage ≥ 4 h (7–9 g/kg) | Defaults at the low end | Recovery screen |
| Rest day inside the race | C: S6 → rest day → S7 | Overnight plan at the lowest band | Recovery screen, Calendar |
| Trail rule | B: overnight after a < 2.5 h trail stage | At least 6–8 g/kg, never the lowest band | Recovery screen |
| Low in-stage intake | C: S4 (in-stage intake < 75% of target) | +1 g/kg to the off-bike carb target | Recovery screen |
| Sensitive stomach mode | C: S3 → S4 with the toggle on | 0.8 g/kg/h carbs plus 0.3–0.4 g/kg/h protein | Toggle state |
| Arrival by fallback timer | C: S5 | Stage arrival from start + duration × 1.5, not the webhook (#152) | Recovery screen (arrival source) |
| Hydration and sodium | C, B | Fluid drunk, sweat rate → deficit × 125–150%, no carry-over; sodium from isotonic drink plus broth or salty food | Recovery screen |
| Same-day double stage | C: day 1 | Two stages on one day (morning and afternoon) | Add race stage list, Calendar |

*Assumption:* the last stage of a race has no between-stage recovery plan.

**Sweat test (B4)**

| Case | Athlete | Seeded data | Feeds |
|---|---|---|---|
| Scheduled / retest due | A | Last test COMPLETED more than 3 months ago; quarterly retest SCHEDULED this week on the usual recovery-ride weekday (#154, #155) | Home card, protocol, pre-weight |
| Moved away from loading | A | Retest that would land on a loading day, moved to at least one week after the race (#134) | Calendar |
| Missing data | E | Test ended, post-weight not entered (awaiting data) | Incomplete state, questionnaire post-weight step |
| Done | B | COMPLETED with sweat rate, temperature and humidity | Result screen |
| Never tested | D | No test; sweat-test To do | Empty state |

**Product Library and gear (B1, My Gear)**

| Case | Athlete | Seeded data | Feeds |
|---|---|---|---|
| Full library | A | Drink mixes, gels and solids, favorites, one manually entered custom product, and one product used in upcoming workouts (the delete warning shows the affected workouts and offers a replacement) | Product Library, delete warning |
| Small library | D | 2–3 products for the starting-point picker | Product Library |
| Calibrated gear | A | Water bottle, isotonic bottle, soft flask with gel concentrate; colors set; calibrated | My Gear |
| Uncalibrated / in validation / proposal | E | One container uncalibrated (sip-calibration To do), one in in-field validation (2 left), one with a pending sip-update proposal (accept / reject) | Calibration flow, questionnaire validation (#62–#63) |
| No gear | D | Empty; "Add a bottle" To do | Empty state |

**Connections and physical data (B7, B8)**

| Case | Athlete | Seeded data | Feeds |
|---|---|---|---|
| Two connected | A | TrainingPeaks and Strava connected, Garmin disconnected | Connections |
| One connected | B | Strava only | Connections |
| Revoked | E | TrainingPeaks revoked by the provider (*inferred* state; the design shows only Connect / Disconnect, so it renders as disconnected) | Connections |
| None | D | Nothing connected; "Connect your calendar" To do | Connections empty |
| Data conflict | E | Manual FTP differs from the synced value: a "Data conflict" To do asks which to keep | Physical data conflict (#105) |
| Incomplete profile | D | Weight only | Complete-profile To do |

**Shared data (all athletes)**
- The curated USDA FoodData Central food list (static, #138–#139), with FODMAP marks.
- Onboarding answers (D only, attached to the account).
- All 12 To do types appear at least once across athletes. One-line coverage check: Last-session feedback (A), Sip calibration and Sip validation (E), Sweat test (A, D), Complete profile, Add bottle, Add race, Connect calendar and Estimate g/h (D), Pre-race strategy (A), Data conflict (E), Loading rehearsal (A).
- Notifications: not seeded. Web notifications are deferred to M4.

---

## 6. Milestones

There are no calendar dates: Francisco hasn't set any. M0–M2 are the mock phase, local only. Each milestone ends with Francisco reviewing it on localhost or the box.

| Milestone | Deliverables | Acceptance check |
|---|---|---|
| **M0 Local setup** | Monorepo (§2.2) with `web`, `api`, `db`, `fixtures`, `i18n`, `design-tokens`. MySQL 8 in Docker. Prisma schema v1 (§3) and migrations. Minimal Express API. Design tokens → CSS/Tailwind. i18n pipeline (EN source; ES/PT keys). Lint, typecheck and test scripts. One-command local start. No Redis, worker or deploy | `pnpm dev` starts web, api and MySQL on localhost or the box. `prisma migrate dev` and `prisma validate` pass. A health page renders in light and dark |
| **M1 Mock data** | Fixtures for the seed cases in §5 (after Francisco reviews the list), authored as typed TS files and loaded into MySQL by the Prisma seed. `db:reset`. Mock read endpoints and simple writes (§4.2). Mock sign-in and demo-athlete switcher | `pnpm db:reset` seeds every case in §5. Every mock endpoint returns fixture data in the final response shape. Switching athletes or modes changes the data |
| **M2 Screens on mock data** | All routes in §4.1 in EN/ES/PT, light/dark, matching the iPhone designs (B1–B11 + A changes), fed only by the mock API. Login, Connections and Subscription screens are visual only | Click-through of every screen in the handoff with fixture data. Francisco reviews and iterates on fixtures and screens. Smoke e2e (Playwright) through onboarding → Home → Workout detail → questionnaire → celebration, and Add race → loading day → stage recovery |
| **M3 Real logic** | `packages/engine` (§2.3) with golden tests from the Master Plan tables and decision examples. Engine output replaces hand-made computed fixtures. Real write paths and validation (Mode & plan, sip calibration, product delete warning, sweat test, questionnaire → adaptation and achievements). Real auth: magic link (local mail catcher) and sessions. Account deletion | Golden tests pass (e.g. R1 ladder 60 → 90 g/h, loading bands per #124, stage gap cases and +1 g/kg / trail rules, sweat-rate formula). Screens look unchanged except for now-computed values. A logged questionnaire moves the ladder per R1 |
| **M4 Integrations, webhooks, jobs** | Move to Vercel (web) and a public host for the API, with the target per §7. Strava and TrainingPeaks OAuth, import and webhooks (ack → queue → match → dedupe). Garmin adapter behind a flag. Redis + BullMQ + worker. Notification scheduler for all push types (§2.5) incl. the stage fallback timer. Web notification channel per the decision taken here. Weather integration. Physical-data sync and conflicts | Replayed webhook fixtures (create/update/delete/duplicate/out-of-order/deauth) give the expected results. A real Strava ride creates one Activity and one post-workout notification. A simulated multi-stage race schedules exactly one stage notification per stage, falling back at start + duration × 1.5 |
| **M5 iOS (after Francisco approves the web)** | OpenAPI v1 frozen. SwiftUI app on the same API with a generated Swift client. APNs channel. Sign in with Apple. Vision OCR. Pairing-code entry. Production hosting (probably AWS). Connect IQ device API and data field follow from here | Francisco signs off the web version before M5 starts. The iOS app runs the same flows against the same API. Pushes arrive via APNs |

## 7. Open decisions and assumptions for Francisco

**Decided (18 Oct 2026)**
- **Hosting (D6, #32), resolved for now:** localhost or the box first (no deploy, no staging, no public URL), then Vercel, with production probably on AWS.
- **First iterations use mock data** served by our own server; real logic, integrations and API data come later.
- **API framework: Express** (§2.1).
- **Mock data source:** MySQL, loaded by a Prisma seed from typed fixture files we author (§2.0). The seed cases are proposed in §5.

**Decisions needed now (mock phase)**
1. **Architecture:** separate Node API (proposed), or Next.js route handlers only (§2.1).
2. **Web layout:** mobile-width column mirroring the iPhone designs (proposed), or dedicated desktop layouts (none designed).
3. **Seed cases:** review the proposed demo athletes and scenarios in §5 (add, drop or rename cases) before M1.

**Can wait (decide by the milestone shown)**
4. **Label scan on web (M3):** manual entry only, or server-side OCR from an uploaded photo.
5. **Fueling-mode g/h logic (M3):** Master Plan §7.1 bands are the source, but the kcal-based "recommended g/h" and the sweat-estimate heuristics are unspecified (Build Plan §11 item 11).
6. **Race "type" values (M2 can use placeholders; real values by M3)** for Add race and stages.
7. **Notifications on web (M4):** in-app inbox, Web Push, or server-side model only (§1.5).
8. **Where the API and worker run once integrations start (M4):** Vercel can't host a long-running worker. Options are AWS or a container host. Queue choice: Redis/BullMQ vs a MySQL-polled scheduler.
9. **Time of day for the carb-loading D-2/D-1, race-breakfast and rehearsal pushes (M4)** (not specified in the docs).
10. **Garmin (M4):** keep the adapter behind a flag until Developer Program approval (proposed).

**Assumptions made (confirm or correct)**
- From M4, pushes are scheduled server-side exactly as on iOS; only the delivery channel differs.
- Mock-phase fixtures may show values the engine would compute differently. They are corrected when M3 replaces them with engine output.
- Age is stored as an integer and sex as free text until options are defined (inferred).
- `FoodItem` stores protein, fat, fiber and a default portion in addition to carbs. These are needed for between-stage protein and low-fat/low-fiber guidance (inferred).
- Unstructured workouts are modeled as `workoutType = null` (#48); the sweat test is a `WorkoutKind` rather than a sixth workout type (#87).
- In-field sip validation runs for the first 4 workouts after calibration ("3–4" in #63; the upper bound is used).
- The in-stage intake percentage (#156) is computed from the post-workout or stage intake log against the stage's g/h target.
- The existing design-system and Connect IQ notes in Build Plan v2 still apply and are not repeated here.
