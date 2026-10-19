# CarbAdapt – Build Plan

Status: v2, 16 Oct 2026 (v1 + decisions D1–D7 closed by Francisco on 16 Oct 2026, recorded as User Flows #27–#33; new §12 on the Connect IQ Mobile SDK for iOS). This plan covers what to do before any coding agents start. It assumes the decisions recorded in the Master Plan (§9) and in User Flows (§16 Decisions log). Inputs: Master Plan, Scientific Evidence, User Flows, the Design Docs (3 iOS mockup artboards, 25 screens) and Brand Board V1. All of these sit in the CarbAdapt Drive folder.

**MVP baseline (decided):** Next.js web · Node.js backend · MySQL · Swift/SwiftUI iOS · Garmin Connect IQ (Monkey C). Integrations: Garmin (primary), TrainingPeaks and Strava. No paywall in MVP; beta testers get every feature. Languages: EN (US English) / ES / PT from day one. Light and dark mode. Login: Garmin, Strava, TrainingPeaks OAuth + email magic link. Adaptive gut-training progression. Symptom scale: mild / moderate / severe. MVP includes label OCR, automatic weather, guided sweat test and sip calibration. Pairing: on-screen code. Hosting: TBD (D6, still deferred).

Labels: **[Decision needed]** = Francisco must choose. **[Verify]** = confirm with the vendor or docs before relying on it. **[Recommendation]** = our proposal.

---

## 0. Summary of recommended next steps

1. ~~Close the blocking product decisions~~ **Done 16 Oct 2026:** D1–D5 and D7 decided (User Flows #27–#31, #33); D6 hosting still deferred (#32), decide before production webhooks. Remaining check: Apple Guideline 4.8 (see §3.3).
2. **Open the accounts with long lead times now:** Apple Developer (Organization, needs a D-U-N-S number), the Garmin Connect Developer Program application (paused, so it is the critical path), Connect IQ developer key, Strava and TrainingPeaks app credentials, domains, and privacy/terms pages.
3. **Set up one monorepo** with contracts first. Write OpenAPI 3.1 for the app API, a small versioned JSON contract for the device, and webhook fixtures per provider. Generate the TS and Swift clients from these.
4. **Freeze the MySQL data model v0.** Include the new entities the designs add: gear, calibrations, sweat profile, weather, report, auth identities.
5. **Build the engines as a pure, tested package before any UI:** plan, adaptation, sweat, calibration and the initial report. Use golden tests generated from the Master Plan tables.
6. **Turn Brand Board V1 into design tokens** (JSON → CSS, Swift, Monkey C). Produce the icon set, including the monochrome and Garmin variants.
7. **Run the milestones in order:** M0 Foundations → M1 Backend and integrations → M2 Engines → M3 iOS ∥ M3w Web → M4 Connect IQ → M5 Loop and adaptation → M6 Beta. Then split each milestone into agent-sized tickets using the template in §8.

---

## 1. Inputs reviewed and what they contain

| Source | Content | Notes |
|---|---|---|
| Design Docs / 1 – Welcome and questionnaire | 11 iOS screens: welcome ("Invite-only beta"), Q1 sport + race vs general training, Q2 weight, Q3 effort (power/HR, FTP/max HR), Q4 max carbs ever (g/h or total, plus a "not sure" estimator), Q5 fuel types + label scan + manual entry, Q6 sweat (estimate vs test), Q7 GI history | Each question has a "Why we ask" card |
| Design Docs / 2 – Mode, account, notifications, watch, report | 6 screens: mode choice, "Sign in with your training account" (Garmin / Strava / TrainingPeaks; no email), briefing time, Garmin pairing (auto + 6-digit code), starting-point report, next-workout fueling | The report matches free-report items (a)–(d) in the Decisions log |
| Design Docs / 3 – Gear, sip calibration and use | 8 screens: my gear, add container, sip calibration (kitchen scale), keypad step, sip result, squeeze result (soft flask), dashboard "To complete", workout fueling in sips, plus a watch preview card | Matches User Flows §4a |
| Brand / Brand Board V1 | Mark (folded gut tube + Ember dot), wordmark, light and dark app icons, palette, type, sample progress component | Basis for §6 |

Packaging note: the 4 zips are **separate parts, not versions of one another**. Each has a different artboard. The runtime files (support.js, vendor/react*.js) are byte-identical in all four (same MD5), and each README differs only in its title. The brand zip's `Main.dc.html` shares its filename with part 1 but is a different file (the brand board). The parts total ~650 lines including the runtime (~450 lines of design HTML). Rendered PNG previews were added next to each artboard in Drive.

---

## 2. Repository strategy

**[Recommendation] One monorepo** (GitHub, private), with pnpm workspaces and Turborepo for the TypeScript side. The Swift and Monkey C projects live in the same repo under `apps/` with their own toolchains.

```
carbadapt/
  apps/
    web/            Next.js (App Router), i18n EN/ES/PT
    api/            Node.js service (REST + webhooks + jobs)
    worker/         Node.js queue workers (webhook fetch, notifications, weather, plan regen)
    ios/            Xcode project (SwiftUI), Swift Package for generated API client
    garmin-ciq/     Connect IQ data field (+ glance/widget for pairing/status)
  packages/
    contracts/      OpenAPI 3.1 (app API), device API JSON Schemas, webhook fixtures
    engine/         Pure TS: plan, adaptation, sweat, calibration, report (no I/O)
    db/             MySQL schema + migrations (Prisma or Drizzle) + seed products
    design-tokens/  tokens.json -> CSS vars, Tailwind preset, Swift, Monkey C constants
    i18n/           Source message catalogs (EN/ES/PT) -> web JSON, iOS .xcstrings, CIQ strings.xml
    config/         eslint/tsconfig/prettier shared
  docs/             ADRs, runbooks, links to Drive docs
```

Why a monorepo:
- A contract change (OpenAPI, device JSON, tokens, strings) lands in one PR with the web, API, iOS and CIQ changes that depend on it. This is the main source of breakage when several agents work in parallel.
- The engine is used by both the API and the web app's previews, and must have only one implementation.
- CI runs only the parts a PR touches: Turborepo filters for TS, and path filters for the Xcode and CIQ jobs (macOS runner for iOS, Linux runner with the CIQ SDK for the device app).

Alternative: split into repos (`web+api`, `ios`, `ciq`) only if separate teams or vendors own the clients. Even then, keep `contracts` and `design-tokens` as a published package or git submodule.

Conventions: trunk-based development with short-lived branches; Conventional Commits; CODEOWNERS per app; ADRs in `docs/adr/` for every decision in §11.

---

## 3. Architecture and API contracts first

### 3.1 Components
- **API (Node.js):** auth, OAuth callbacks, REST for web and iOS, device API, provider webhooks (must ack fast: Strava requires a 2 s ack, so enqueue and return 200).
- **Worker:** queue consumers (fetch activity details, match to planned session, deduplicate across providers, regenerate protocols, schedule notifications, fetch weather, run the adaptation engine).
- **Queue:** a job queue (BullMQ on Redis, or the host's managed queue once hosting is chosen [Decision needed]).
- **MySQL 8:** the system of record. **Object storage:** label photos and FIT files (if fetched).
- **Push:** APNs, token-based (.p8 key). **Weather:** forecast at the workout's location and time. [Recommendation] Apple WeatherKit REST: it is included with the Apple Developer membership up to a monthly call quota, and the backend can call it [Verify quota and terms]. Alternative: Open-Meteo commercial plan.
- **OCR for labels:** [Recommendation] on-device Apple Vision text recognition in iOS (supports EN/ES/PT text), with server-side parsing of the extracted text into carbs, sodium and volume. Web: manual entry first; add OCR later.
- **Engine package:** pure functions, versioned (`engineVersion` stored with every protocol and adaptation decision, so results can be audited and replayed).

### 3.2 Contracts to write before code (in `packages/contracts`)
1. **App API (OpenAPI 3.1).** Resources: `auth` (OAuth start/callback, session refresh), `me`, `onboarding` (questionnaire answers, idempotent upserts per step, since answers exist before the account does), `connections`, `sessions` (planned/completed/manual), `protocols` (per session: totals, per hour, schedule, carry list, in sips/squeezes where calibrated), `products`, `scans`, `gear`, `calibrations`, `sweat` (profile, test), `reports/initial`, `checkins` (post-workout), `plan` (gut-training weeks), `progress`, `devices`, `pairing`, `settings`. Generate a TS client for web and a Swift client (swift-openapi-generator) for iOS.
2. **Device API (JSON Schema, versioned `v1`).** Keep it tiny for Connect IQ memory: `POST /device/pairing` → {code, nonce, expiresAt}; `GET /device/pairing/{nonce}` → {token}; `GET /device/protocol?date=` → compact schedule [{t (s), kind (eat/drink/squeeze/sip), qty, unitKey, containerLabel, choG}], with i18n keys rather than free text where possible plus a short label; `POST /device/intake-events` (optional confirmations).
3. **Webhook fixtures:** recorded or sample payloads for Strava (activity create/update/delete, deauthorization), TrainingPeaks (workout created/updated/deleted) and Garmin (activity push or ping, once approved). Contract tests replay them.
4. **Domain events:** `SessionPlanned`, `SessionChanged`, `ActivityCompleted`, `CheckinSubmitted`, `AdaptationDecided`, `ProtocolRegenerated`, `DeviceSynced`. Make them explicit so workers stay decoupled.
5. **Error model and idempotency:** a standard error envelope; `Idempotency-Key` on POSTs from mobile; ETags on protocol fetches (the device can skip downloads).

### 3.3 Identity (decided: D1, User Flows #27)
Login options: **Garmin, Strava and TrainingPeaks OAuth, plus an email magic link** (passwordless, single-use token, short expiry, rate-limited). One user can hold several identities (`auth_identities`), so a provider can be added or removed without a migration; identities are merged when the verified email matches, only after the user confirms.
- Garmin login ships only after Garmin Connect Developer Program approval (paused). Until then: Strava (10-athlete cap), TrainingPeaks and the magic link.
- **[Verify before App Review] Apple Guideline 4.8.** Apps that use a third-party login for the primary account must also offer an equivalent login that limits data to name and email, lets the user keep their email private, and does not collect interactions for advertising without consent (App Review Guidelines §4.8, developer.apple.com/app-store/review/guidelines, read 16 Oct 2026). A magic link needs the real email, so it may not meet the "keep email private" point. [Recommendation] Plan for Sign in with Apple on iOS as an extra identity (small effort with `auth_identities`), and confirm with App Review notes or a pre-submission question. Guideline 5.1.1(v) also requires in-app account deletion.

---

## 4. Data model v0 (MySQL 8, utf8mb4, all timestamps UTC + user IANA timezone)

| Table | Key fields / notes |
|---|---|
| users | id, email (nullable, verified_at), locale (en-US/es/pt), theme (system/light/dark), timezone, units (metric/imperial), mode (fuel_right/gut_training), body_mass_kg, created_at |
| auth_identities | user_id, provider (garmin/strava/trainingpeaks/email; apple reserved for 4.8), subject, email (nullable) — many per user |
| magic_link_tokens | email, token_hash, expires_at, used_at, ip/user-agent (abuse checks) |
| onboarding_drafts | anon_id, step answers (JSON), merged into the user on account creation |
| provider_connections | user_id, provider, external_user_id, tokens (encrypted, KMS/app-level), scopes, status, webhook_subscription_id |
| planned_sessions | user_id, provider, external_id, start (UTC), sport, duration, intensity (TSS/IF/zones), structure JSON, source_updated_at, is_manual |
| completed_activities | user_id, provider, external_id, planned_session_id (match), start/end, duration, avg power/HR/pace, kcal (if given), temperature, dedupe_group_id |
| fuel_protocols | planned_session_id, engine_version, target_g_per_h, ratio, fluid_ml_per_h, sodium_mg_per_h, weather_snapshot_id, totals, schedule JSON, carry_list JSON, status (current/superseded) |
| products | owner (global/user), brand, name, format (gel/drink/bar/chew/fruit/syrup/solid/fat_mix), cho_g, glucose_g, fructose_g (nullable), sodium_mg, caffeine_mg, volume_ml, serving_g, source (manual/scan/seed), locale |
| product_scans | user_id, image_ref, ocr_text, parsed JSON, confidence, product_id |
| gear_containers | user_id, type (bottle/flask/bladder), name, capacity_ml, usual_content (water/isotonic g/L/gel concentrate), product_id (flask fill) |
| container_calibrations | container_id, method (kitchen), weights JSON [full, 1, 2, 3], ml_per_sip or g_per_squeeze, density_used, created_at (keep latest + history) |
| calibration_validations | container_id, completed_activity_id, pre/post weight or remaining volume, prompts_followed, prescribed vs actual, outlier_flag, new_estimate |
| sweat_profiles | user_id, source (estimate/test), sweat_rate_l_per_h, sodium_mg_per_l, assumptions JSON |
| sweat_tests | user_id, status (to_complete/done), pre/post body mass, fluid in, urine (optional), duration, conditions, result |
| weather_snapshots | lat/lon (coarse), time, temp, humidity, source, fetched_at, user_override JSON |
| gut_profiles | user_id, current_stage, tolerated_g_per_h, max_ever (value, duration, context), gi_history JSON, red_flags JSON |
| gut_training_plans | user_id, goal (race date, distance, sport) or general (hours/week, longest session), target_g_per_h, weeks JSON, status |
| checkins | completed_activity_id, cho_ingested_g, intake_window_min, fluid_ml, products used, gi_upper / gi_lower / gi_systemic (enum none/mild/moderate/severe, D3), rpe/feeling, notes |
| adaptation_decisions | user_id, plan_id, input checkin ids, decision (advance/hold/step_back/move_to_next_long), symptom-free streak count, reason, engine_version |
| reports | user_id, type (initial), payload JSON (a–e), engine_version |
| devices | user_id, platform (garmin_ciq), model/part number, ciq_device_id, pairing_method (code/garmin_account/ciq_mobile), token hash, last_sync_at, app_version |
| pairing_codes | code, nonce, expires_at, claimed_by_user_id |
| notification_prefs / notification_jobs | briefing mode (evening/morning) + local time; jobs with type, scheduled_at (UTC), payload, status, apns_id |
| consents / audit_log | health-data consent (GDPR special category; Argentina Ley 25.326), versioned policy acceptance; security audit |

Notes: store all values in metric and convert in clients. Keep provider raw payloads for 7 days at most where provider terms require it (TrainingPeaks 7-day cache rule). Strava data may be shown only to its owner and must never feed model training.

---

## 5. Environment and accounts setup (start now; long lead times first)

| Item | Owner | Lead time | Notes |
|---|---|---|---|
| Legal entity + D-U-N-S number | Francisco | 1–3 weeks | Needed for Apple Developer *Organization* enrollment and for Garmin's business application |
| Apple Developer Program (Organization) | Francisco | days–weeks | Bundle IDs, App Store Connect app record "CarbAdapt", APNs .p8 key, Sign in with Apple capability (likely needed for Guideline 4.8, see §3.3), WeatherKit key, TestFlight |
| Garmin Connect Developer Program | Francisco | unknown (paused) | **Critical path.** Apply now, describe the use case (Activity API + OAuth), follow up regularly. Needs website + privacy policy |
| Connect IQ developer setup | Dev | 1 day | SDK Manager, developer key (keep it safe; losing it blocks store updates), device simulators for target models, Connect IQ Store developer account |
| Strava API application | Francisco/Dev | 1 day | Already held. Set callback domain(s) for staging/prod; 10-athlete cap; review before wider beta |
| TrainingPeaks partner credentials | Francisco | — | Already held. Confirm sandbox vs production, webhook (early access) enablement, branding rules |
| Domains | Francisco | now | Buy carbadapt.com + carbadapt.app (appeared available 15 Oct 2026; re-check at purchase). DNS, TLS, transactional email domain (SPF/DKIM/DMARC), support@ mailbox |
| Legal pages | Francisco | 1–2 weeks | Privacy policy (health data, EN/ES/PT), terms, medical disclaimer. Required by Apple, Garmin, Strava |
| Trademark search | Francisco | weeks | CarbAdapt is provisional until this clears |
| Hosting | Francisco | [Decision needed] | Needed before production webhooks. Meanwhile run a staging environment with a public HTTPS URL (managed PaaS free tier or a tunnel) so provider callbacks can be tested |
| Tooling | Dev | 1 day | GitHub org + repo, CI (GitHub Actions; macOS runner for iOS), secrets manager, error tracking (e.g. Sentry for web/API/iOS), product analytics (privacy-light) |
| Environments | Dev | — | local / staging / production; separate OAuth apps and APNs environments per stage |

---

## 6. Design system from Brand Board V1

### 6.1 Tokens (source: `packages/design-tokens/tokens.json`)
- **Color (brand):** Night Fuel `#101A2B` (base background), Glucose `#C6F135` (primary/accent, progress), Ember `#FF6A3D` (attention, gaps, the "energy dot"), Tarmac `#2B3A55` (surfaces/controls), Bone `#F4F1EA` / `#FFFFFF` (light backgrounds, text on dark).
- **Color (UI, from the mockups):** canvas `#0A1220`, surface-2 `#182640` (info cards), text-secondary `#C9D2E0`, text-tertiary `#A3B0C4`, muted `#8A97AB`, on-light-muted `#5B6880`, border-light `#D9D4C7`.
- **Contrast (WCAG, computed):** Glucose on Night 13.3:1 ✔; `#A3B0C4` on Tarmac 5.2:1 ✔; Ember on Night 6.1:1 ✔; **Ember on Tarmac 4.0:1 (large text only)**; **Glucose on white 1.3:1 ✖. Never use Glucose for text or the mark on light backgrounds**; use Night with the Ember dot, as the board's light lockup does.
- **Type:** Bricolage Grotesque 500/800 (display), DM Sans 400/500/700 (body/coaching copy), JetBrains Mono 500/700 (**all numbers and units**). All three are open-licensed Google Fonts [Verify OFL for each before bundling]. Bundle the fonts in iOS and self-host them on the web (no runtime Google Fonts call, for privacy/GDPR). Check that all three render ES/PT diacritics (á, ã, ç, ñ) in every weight used.
- **Scale (from mockups):** H2 30/1.1 (−1 px tracking), welcome H2 40, big numbers 44–72 mono, body 15/1.45, captions 12–13, labels 11–12 mono with 1.5–2 px tracking.
- **Shape and spacing:** radius 14 (controls), 16 (cards), 22/27 (pills/buttons), 44 (device frame only); min touch target 44–54 px; screen padding 24 px; gaps 8/12/14 px.
- **Components to build first:** Button (primary Glucose, secondary Tarmac, ghost text), Option (selected = 2 px inset Glucose ring), Info card ("Why we ask" / "Good to know"), Number display (value + unit), Stepper (−/+), Progress segments, Chip, Input (mono value), Keypad, To-complete card (Ember dot), Carry-list row, Schedule row.
- **Mode (decided D7):** light **and** dark mode in MVP on web and iOS, following the system setting with a user override. The mockups are dark-only, so the light theme needs designing: derive light semantic tokens from the board's light lockups (Bone/white backgrounds, Night text, Ember dot) and never use Glucose for text on light (1.3:1). Structure tokens as semantic roles (`bg`, `surface`, `text-primary`, `accent`…) with light and dark values. Connect IQ follows the device's own background (dark on AMOLED).

### 6.2 Logo and icon assets (derived SVGs in Brand/assets (derived), needing designer sign-off)
| Need | Spec | Status |
|---|---|---|
| Mark on dark | Glucose stroke + Ember dot | From the board |
| Mark on light | Night stroke + Ember dot | From the board |
| **Monochrome mark (black / white)** | Single-colour stroke + dot | **Missing on the board.** Derived draft provided. Needed for the iOS tinted icon, Garmin MIP/low-colour screens, the favicon mask, notification small icons and embossing |
| Wordmark lockups | "Carb" 500 + "Adapt" 800, Bricolage. Light (Night text) and dark (Bone + Glucose) | Export as outlined SVG (no font dependency) |
| iOS app icon | 1024×1024 PNG, full-bleed, no transparency (iOS applies the mask). Default icon: [Open, designer] light (Glucose bg) or dark (Night bg); iOS 18+ **dark** and **tinted** variants (the tinted one needs the mono mark) | To produce |
| Web | favicon.svg (consider a simplified mark: at 16 px the dot and bends merge, so test it), favicon.ico 32/16, apple-touch-icon 180, PWA icons 192/512 + maskable 512 (safe zone ~80%), OG image 1200×630 | To produce |
| **Garmin Connect IQ** | Launcher icon per target device (size comes from each device's definition in the SDK, commonly ~40–80 px; supply per-resolution resources with qualifiers) [Verify for each target]; store listing icon and screenshots/hero images per the Connect IQ Store requirements [Verify]. AMOLED devices: Glucose/Ember on black. **MIP devices (e.g. Edge, Forerunner MIP models) have limited palettes: test the Glucose/Ember mapping and use the mono mark if they degrade.** Use system fonts on device (custom bitmap fonts cost memory); mono-style digits only if memory allows | To produce |
| App Store / TestFlight | Screenshots 6.9"/6.5" in EN/ES/PT; privacy nutrition labels | Later (M6) |

### 6.3 Copy and i18n
- **English variant (decided D7): US English** (`en-US`) for all product copy: "fueling", "color", "fiber", "liter" (units stay metric; spelling is US). Change the "fuelling" instances in the mockups. Internal docs may keep their current spelling.
- Write all strings into the `packages/i18n` catalogs from the start (EN source; ES/PT translated and reviewed by a native sports-nutrition-literate reviewer). Generate web JSON, iOS `.xcstrings` and CIQ `resources-spa` / `resources-por` strings.
- Design for roughly 30% text expansion in ES/PT: watch data-field strings need short variants.
- Number formats: decimal comma in ES/PT ("0,7 L/h"); units in mono.

---

## 7. Milestones and dependencies (MVP)

```
M0 Foundations ──► M1 Backend core & integrations ──► M2 Engines ──► M5 Loop & adaptation ──► M6 Beta
       │                     │                          │   ▲
       │                     ├──────────► M3 iOS ◄──────┘   │
       │                     ├──────────► M3w Web ◄─────────┤
       │                     └──────────► M4 Connect IQ ────┘
       └─ accounts, legal, contracts, tokens (unblocks everything)
Garmin Connect API approval: external dependency → enables Garmin login, auto-pair, Garmin webhooks (slots into M1/M4 whenever it arrives)
```

| Milestone | Scope | Depends on | Exit criteria |
|---|---|---|---|
| **M0 Foundations** (~1–2 wks) | Accounts in §5 started; monorepo + CI; contracts v0 (OpenAPI, device JSON, webhook fixtures); DB schema v0; tokens + base components spec; i18n pipeline; ADRs for §11 decisions | — | Contracts reviewed; decisions D1–D7 recorded; staging URL live |
| **M1 Backend core and integrations** | Auth: Strava + TrainingPeaks OAuth and email magic link first; Garmin OAuth when approved; identity model ready for Sign in with Apple (4.8); onboarding draft → account merge; TP + Strava connections; webhook ingestion → queue → fetch → match → dedupe; planned-session import (TP 7 days, manual sessions); APNs plumbing; consent capture | M0 | Strava + TP accounts sync end-to-end in staging; webhook replay tests green |
| **M2 Engines** (pure package) | Fuel-right protocol (duration bands §7.1, intensity, sport); sweat estimate + weather adjust; product/gear translation (carry list, sips/squeezes); initial report (a–e); gut-training plan with **adaptive progression (D2): advance after 2–3 symptom-free key sessions, hold on moderate, step back on severe**; symptom enum mild/moderate/severe (D3); calibration math + in-field validation | M0 (can start in parallel with M1) | Golden tests from Master Plan tables pass; every heuristic flagged in output metadata |
| **M3 iOS** | Onboarding Q1–Q7 (+ "not sure" estimator), mode, account, notifications permission, report, next-workout card, dashboard, product library + Vision label OCR, guided sweat test, gear + sip/squeeze calibration flows (all MVP per D4), light/dark themes, briefing deep link, settings, pairing (code entry), i18n | M1 API, M2 outputs, tokens | Full onboarding → report on device in 3 languages; TestFlight internal build |
| **M3w Web** | Same onboarding (account at the end), report, plan/calendar, product library (manual), gear, progress, settings, connections management | M1, M2, tokens | Parity with iOS for non-device features |
| **M4 Connect IQ** | Data field: pairing code display (MVP pairing, D5), token storage, protocol fetch + cache the day before, timer-based alerts with vibration, "next intake" view, offline state, i18n; glance/widget for status; device matrix (round AMOLED, MIP, Edge); **spike: "Pair with iPhone" via the Connect IQ Mobile SDK (§12)** | M1 device API, M2 schedule format | Simulator matrix green; on-device test on Francisco's own Garmin(s); CIQ beta build |
| **M5 Loop and adaptation** | Completed-activity → check-in push (4–5 questions, GI as none/mild/moderate/severe, + calibration weigh-in for the first 3–4 sessions); manual "log session"; reminder once; adaptation decisions applied; "move to next long workout" rule; progress chart (tolerated g/h over time); protocol regeneration on workout changes + device re-sync | M1, M2, M3/M3w, M4 | A full week simulated end-to-end with fixtures; decisions auditable |
| **M6 Beta hardening** | Accessibility pass, ES/PT review, analytics, privacy review, data deletion/export, rate-limit handling, monitoring/alerts, TestFlight external review, CIQ beta distribution, beta runbook, feedback channel | M3–M5 | ≤10 external testers onboarded (Strava cap), crash-free > 99%, feedback loop running |

Parallelism: M2 can start on day 1 of M1. M3, M3w and M4 can start against mocked contracts (generated mock server) before M1 is finished.

---

## 8. Splitting work into agent-sized tasks (later)

Rules:
- **Contracts are the boundary.** Every task names the contract (OpenAPI path, JSON schema, token, string keys) it implements or consumes. A contract change is its own task, merged first.
- **Size:** one PR, one app/package, about ½–1 day of work, ≤ ~400 changed lines excluding generated code.
- **Vertical slices for features**, horizontal tasks only for shared infrastructure (DB migration, codegen, CI).
- **The definition of done is executable:** unit tests, contract tests, and screenshots for UI (iOS snapshot / Playwright) in all 3 locales.
- **No task without acceptance criteria** derived from User Flows (actors, trigger, steps, edge cases) and the mockup screen IDs.

Ticket template:
```
ID / Title
Context: links (User Flows §, mockup screen, Master Plan §)
Contract(s): paths/schemas/tokens/strings touched
Inputs/Outputs: data in/out
Acceptance criteria: Given/When/Then incl. edge cases (missed workout, no webhook, device offline, manual entry, workout changed)
Tests: what must be added
Out of scope:
Dependencies: ticket IDs
```

Example first tickets (M0–M2): `contracts: device protocol v1 schema` · `db: migration v0 (users, auth_identities, onboarding_drafts…)` · `engine: duration-band target (Master Plan §7.1) + golden tests` · `engine: sweat estimate (weight × rate × weather) with heuristic flags` · `engine: carry-list translation into products and containers` · `api: Strava OAuth login + identity merge` · `api: Strava webhook ack + enqueue + replay tests` · `tokens: tokens.json + CSS/Swift/Monkey C generators` · `i18n: catalog pipeline + EN source for onboarding Q1–Q7`.

---

## 9. Testing and beta

- **Engine:** table-driven golden tests built from Master Plan §3–7 (stages, ratios, duration bands, advancement rule as decided), plus property tests (no target above the user's proven max in week 1; never above the plan cap).
- **Contracts:** OpenAPI schema validation in CI; a generated mock server for client development; provider webhook replay fixtures (including duplicates across Strava/TP, out-of-order events, deletes, deauthorization).
- **Backend:** integration tests against MySQL in Docker; time-zone tests for briefing scheduling (UTC-3 Argentina, Brazil, Europe DST).
- **iOS:** XCTest for view models, snapshot tests per locale and Dynamic Type size, XCUITest for onboarding; TestFlight internal (up to 100 members of the team), then external (up to 10,000 testers, after Beta App Review).
- **Web:** Playwright e2e in EN/ES/PT; axe accessibility checks.
- **Connect IQ:** simulator runs across a target device matrix (at least: one round AMOLED watch, one MIP watch, one Edge bike computer); memory profiling; offline/cached-protocol tests; Bluetooth-drop tests; field tests on real devices during rides/runs. Beta distribution: [Verify] the current Connect IQ Store beta/private-app options. Fallback: sideload builds to testers' devices for a small cohort.
- **Beta cohort:** ≤10 athletes while Strava is the only login (10-athlete cap). Request a Strava review before expanding. Mix of cycling, running and triathlon; EN/ES/PT speakers; at least 2 Garmin device classes.
- **Feedback:** an in-app feedback entry plus a weekly check-in; log every adaptation decision for review with Francisco.

---

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Garmin Connect Developer Program paused | No Garmin login, no auto-pair via Garmin account, no Garmin webhooks | Apply now; Strava/TP/magic-link login + TP data path; on-screen code pairing (D5); Connect IQ Mobile SDK spike for code-free pairing (§12); Garmin users often auto-sync to Strava |
| Apple Guideline 4.8 (third-party login) | App Review rejection if the email magic link is not accepted as the privacy-preserving equivalent | Email magic link is in (D1); [Verify] before App Review; keep Sign in with Apple ready as an extra identity (§3.3) |
| Strava 10-athlete cap and terms (no AI/model use, owner-only display) | Beta size; data use limits | Keep Strava data out of any model training; request a review before scaling |
| Heuristics presented as precise (sweat 10 mL/kg/h and 900 mg/L, sip density 1.02, kcal-based "recommended g/h") | Wrong fluid/sodium/CHO advice; credibility | Label as estimates in the UI, add them to Scientific Evidence as [Heuristic] with sources or rationale, and make them editable and refined by the sweat test and check-ins |
| Connect IQ fragmentation and memory | Crashes or missing alerts on some devices | Minimal payload, device matrix in CI, cache the day before, short strings |
| i18n from day one across 4 surfaces | Slower delivery, untranslated strings | Single catalog source + CI check for missing keys |
| OCR accuracy on ES/PT labels and per-serving vs per-100 g | Wrong product data | User confirmation step; manual edit; flag low confidence |
| Health-data compliance (GI symptoms) | Legal | Explicit consent, minimisation, deletion/export, DPA with the host; the hosting choice affects data residency |
| Hosting undecided | Blocks production webhooks and the APNs/WeatherKit server setup | Decide in M0. Staging can use a temporary managed host |
| Scope (D4: OCR, weather, sweat test, sip calibration all in MVP) | Delays | All four are in; build each behind a feature flag so a late one can be held without blocking the beta; in-field calibration validation can follow the first calibration |

---

## 11. Conflicts and gaps found (design + flows vs Master Plan and decisions)

**Conflicts**
1. **D1 – Login. Resolved 16 Oct 2026 (User Flows #27):** Garmin, Strava, TrainingPeaks OAuth + email magic link. Garmin only after API approval. Open: [Verify] Apple Guideline 4.8 (§3.3). The mockup "Sign in with your training account" screen needs a TrainingPeaks button and an "email me a link" option.
2. **D2 – Adaptation rule. Resolved (User Flows #28):** adaptive — advance after 2–3 symptom-free key sessions, hold with moderate symptoms, step back with severe. Supersedes the 15 Oct fixed weekly ladder. Master Plan §3.3 and User Flows §11 updated. Open: does "mild" count as symptom-free? Mode-screen copy ("A fixed week-by-week progression…") must be rewritten.
3. **D3 – GI scale. Resolved (User Flows #29):** none / mild / moderate / severe for upper GI, lower GI and systemic, user-facing and stored. Master Plan §3.1 and data model updated. Brand-board chip "Gut comfort 4/5" should become e.g. "Gut: mild" (note for the designer).
4. **Pairing. Resolved (User Flows #31):** on-screen code in MVP; automatic via Garmin account once the Garmin API is approved. Connect IQ Mobile SDK findings in §12.
5. **Q4 copy:** "The plan builds up from it, never above it" contradicts itself. Suggested: "We start at your proven intake and build up from there."
6. **Spelling. Resolved (D7):** US English; fix "fuelling" in the mockups (§6.3).

**Gaps (not yet designed or specified)**
7. Missing screens: post-workout check-in (incl. calibration weigh-in), plan view/calendar, progress chart, product library management + label-scan confirm, settings (User Flows §13 still open), sweat-test protocol screens, rest-day/no-workout state, connection errors and revoked tokens, deletion/consent screens.
8. **Web:** no web designs at all (flows say Web + iOS onboarding).
9. **Connect IQ:** no data-field layouts (round/rectangular, MIP vs AMOLED, Edge), alert design, offline state or pairing-code screen on the watch.
10. **Onboarding vs Master Plan §3.1:** the red-flag screen (blood in stool/vomit, diagnosed GI disease, NSAID use) and per-product glucose/fructose split are missing from Q5/Q7; "situations" only partly covered (Race / Long ride / Heat chips); no time-zone/location step (needed for weather and briefing).
11. **Algorithms not specified in the Master Plan:** the kcal → "recommended g/h" logic shown in the report (the Master Plan uses duration bands); the sweat estimate (10 mL/kg/h, 900 mg/L) and weather adjustment; sip math (density 1.02); in-field calibration correction; the "not sure" estimator (gels × 25 g + bottles × 45 g). All need [Heuristic] entries in Scientific Evidence or the Master Plan.
12. **MVP scope. Resolved (D4, User Flows #30):** OCR, weather, sweat test and sip calibration are in; Master Plan §9.0 table and data model updated on 16 Oct 2026 (additional entities paragraph).
13. **Light/dark. Resolved (D7):** both modes in MVP; light screens still need designing (§6.1).
14. **Brand assets missing:** monochrome mark, iOS tinted/dark icon variants, favicon simplification, Garmin launcher/store assets, outlined wordmark.
15. **Tagline** "Train the gut. Fuel the race." echoes "Fuel the Goal" (a competitor) and "TrainedGut" phrasing. Minor; check before trademark filing.
16. **Hosting** still TBD; it blocks production webhooks, data residency and the DPA.

**Decision status (16 Oct 2026)**
| ID | Decision | Status | Log |
|---|---|---|---|
| D1 | Login: Garmin / Strava / TrainingPeaks OAuth + email magic link | Decided; [Verify] Apple 4.8 | User Flows #27 |
| D2 | Adaptive progression (advance / hold / step back) | Decided; supersedes fixed ladder | #28 |
| D3 | Symptom scale none / mild / moderate / severe | Decided | #29 |
| D4 | MVP includes label OCR, automatic weather, guided sweat test, sip calibration | Decided | #30 |
| D5 | Pairing: on-screen code in MVP; Garmin-account auto-pair after API approval; CIQ Mobile SDK under evaluation (§12) | Decided | #31 |
| D6 | Hosting provider + region | **Still deferred** — needed before production webhooks | #32 |
| D7 | Light and dark mode; US English | Decided (default app icon still open for the designer) | #33 |

---

## 12. Connect IQ Mobile SDK for iOS: findings (researched 16 Oct 2026)

Question (D5): can the iPhone app pair with and sync to the CarbAdapt Connect IQ app through the Connect IQ Mobile SDK (iPhone ↔ Garmin Connect Mobile ↔ CIQ app or data field), without the Garmin Connect web API?

### 12.1 What the SDK does (Garmin's official SDK, `garmin/connectiq-companion-app-sdk-ios`, docs v1.8.0)
- **Device discovery goes through Garmin Connect Mobile (GCM).** `showConnectIQDeviceSelection` opens GCM; the user picks devices there and GCM returns them to our app through a URL scheme or universal link. The app keeps the `IQDevice` list (UUID, model, name) and must persist it. GCM has to be installed and the watch paired to it.
- **Messaging:** `sendMessage:toApp:` sends to a specific CIQ app (identified by its app UUID, in dashed format on iOS) and `registerForAppMessages` receives from it. Payloads are property-list style: NSString, NSNumber, NSArray, NSDictionary, NSNull. A transient-message option exists.
- **App status and launch:** `getAppStatus` tells whether our CIQ app is installed on the device and its version; `openAppRequest` asks the user on the watch to open it; `showConnectIQStoreForApp` sends the user to the store to install it.
- **Transport:** after discovery the SDK talks to the device over BLE. With the optional iOS background mode "Uses Bluetooth LE accessories" the iPhone app can be woken when the device has data for it; BLE state restoration is supported.
- **Limit:** only one companion app may register for a given CIQ app's messages.
- Sources: github.com/garmin/connectiq-companion-app-sdk-ios (README and docs; last commit 15 Jan 2026); developer.garmin.com/connect-iq/core-topics/mobile-sdk-for-ios/.

### 12.2 What the watch / Edge side can do (Monkey C)
- `Toybox.Communications` provides `registerForPhoneAppMessages` (receive), `transmit` (send to the phone app) and `makeWebRequest` (HTTPS through GCM). Garmin's API doc: "This module was made available to foreground data fields with API 5.0.0." (developer.garmin.com/connect-iq/api-docs/Toybox/Communications.html)
- **Data fields on devices below CIQ 5.0:** communications only run in a **background service**. Phone messages arrive through `Background.registerForPhoneAppMessageEvent()` and `ServiceDelegate.onPhoneAppMessage`. Temporal events run at most every 5 minutes and each background run lasts about 30 s. (developer.garmin.com/connect-iq/api-docs/Toybox/Background.html; forum: forums.garmin.com/developer/connect-iq/f/discussion/350615/does-a-datafield-support-a-companion-app)
- **CIQ 5.0+ (System 7) devices:** data fields can use Communications in the foreground. Forum reports cite Edge x40/x50 and newer watches on System 7. (forums.garmin.com/developer/connect-iq/f/discussion/407776/streaming-data-from-garmin-edge-to-external-device; …/402946/webconnect-in-the-foreground; …/362994/system-7-comm-for-data-fields-backward-compatibility)
- **Reliability reports (developer forum, not official):** a message from an iOS app to an Edge 540 data field was lost, and sending right after connection can drop messages (…/372069/update-data-field-from-companion-app). Developers on older devices still have no real-time phone path for data fields (…/443774/solutions-for-real-time-phone-communication-on-older-devices). Simulator phone↔device messaging is documented as Android-only, so iOS messaging must be tested on real hardware (…/366804/ios-companion-app-to-feed-data-to-edge-datafield).

### 12.3 What this means for CarbAdapt
- **Pairing without a code is feasible on iPhone.** The iOS app (signed in) gets the device from GCM and sends a one-time device token in a message. The CIQ app stores it and confirms with `transmit`. This replaces typing a code, but it is **not** a Garmin-account link: the device identity comes from the phone's GCM, so it does not give Garmin login or Garmin activity webhooks. That still needs the Garmin Connect web API.
- **It does not solve sync for a data field on older devices by itself.** The message only arrives on the next background run (≤ every 5 min, about 30 s), and only while the data field is in an active data screen. The more robust path stays the one already planned: the data field fetches its protocol from our backend with `makeWebRequest` (through GCM) and caches it the day before.
- **iPhone-side constraint [Inference from the SDK docs, verify in the spike]:** the background BLE mode wakes the iOS app for device→phone messages; phone→device pushes happen only while the iOS app is running or has been woken, so they cannot be the only sync path.

### 12.4 Recommendation
1. **Keep the on-screen code as the MVP baseline** (decided, D5). It works on every device and does not need the iPhone.
2. **Add a "Pair with iPhone" spike in M4** (≈2–3 days): iOS calls `showConnectIQDeviceSelection` → `getAppStatus` → `sendMessage` with the device token; the CIQ data field receives it in its background service (all devices) or in the foreground (CIQ 5.0+); the code stays as fallback. Exit criteria: works on at least one CIQ 5.0+ Edge or watch and one pre-5.0 device on real hardware.
3. **Protocol sync stays on `makeWebRequest` to the backend**, cached the day before. Use SDK messages only as a secondary push ("your plan changed, refresh") and accept the 5-minute background cadence on pre-5.0 devices.
4. **Consider a glance or widget** in the CIQ app for pairing and status: they can use Communications more freely than a data field on older devices [Verify per device].
5. Store `pairing_method` (code / ciq_mobile / garmin_account) on `devices` so the three paths can coexist; when the Garmin API arrives, link the Garmin account on top.

[Verify] All forum points are developer reports, not Garmin documentation; confirm each on real devices in the spike.

---

## Appendix A – Design Docs index (Drive)
- Design Docs / 1 – Welcome and questionnaire: Main.dc.html, README (Doc + .md), rendered preview PNG, support.js, vendor/
- Design Docs / 2 – Mode, account, notifications, watch, report: Setup.dc.html, README, preview PNG, runtime
- Design Docs / 3 – Gear, sip calibration and use: Gear.dc.html, README, preview PNG, runtime
- Brand: Main.dc.html (Brand Board V1), README, preview PNG, runtime, assets (derived)/ (mark and app-icon SVGs, including draft mono variants)
To view the HTML artboards: download the folder and serve it locally (`python3 -m http.server`), then open the .dc.html file. Some browsers block the scripts over file://.
