# CarbAdapt – Master Plan

*Product brief and gut-training plans for cycling, running and triathlon. The full scientific evidence lives in the companion document [Scientific Evidence](https://docs.google.com/document/d/1nGXGiHrlJXTzrFlTf5Uf-fckFgQhhXz-2RlD3NO4nCk/edit) (validated and corrected 15 Oct 2026).*  
*MVP usage flows (being defined with Francisco): [CarbAdapt – User Flows](https://docs.google.com/document/d/19Xpg6ALUWvWGwhNYZ2Cb17ugGgI2u3D2fUIPLa3E97Y/edit)*

**How to read the labels in this document**

- **\[Evidence\]**: comes directly from a cited study or position statement (see Scientific Evidence for details).  
- **\[Heuristic\]**: our practical design choice, built from the evidence but not tested as a protocol in any study. CarbAdapt should validate these with user data and adjust them.

---

## 1\. App brief

**Problem.** Endurance performance in events longer than \~2 h depends on how much carbohydrate (CHO) an athlete can eat, absorb and oxidise. Guidelines have moved from \~30–60 g/h to 90 g/h, and elite cyclists now report 90–120+ g/h. But gastrointestinal (GI) symptoms are common (roughly 30–50% of endurance athletes, and up to \~31% with serious symptoms in Ironman races). Many athletes never reach the intakes that would help them, because their gut has not been trained.

**What the app does.** CarbAdapt guides an athlete through a structured, science-based "gut training" block. The goal is to safely raise the amount of CHO per hour they tolerate in training and racing, then turn that into a race-day fuelling plan.

**Target users.** Amateur to elite cyclists, runners (road, trail, ultra) and triathletes (70.3, Ironman), plus coaches and sports dietitians who support them.

**Core features (product brief).**

| Module | What it does | Evidence anchor | |

---

## 2\. Synopsis of the Scientific Evidence

Full document (validated 15 Oct 2026): [**CarbAdapt – Scientific Evidence**](https://docs.google.com/document/d/1nGXGiHrlJXTzrFlTf5Uf-fckFgQhhXz-2RlD3NO4nCk/edit)

- **The gut is trainable.** Repeated CHO intake during exercise improves gastric comfort and consistently lowers gut discomfort; malabsorption and overall symptom scores are more mixed (Martinez 2023). Habitual high-CHO intake raises exogenous CHO oxidation (Cox 2010). Direct human SGLT1 data are lacking; animal data and human gastric-emptying adaptations support the concept (Jeukendrup 2017; Cunningham 1991).  
- **Results come quickly.** \~2 weeks of near-daily (≈5 days/week) 1-h runs with \~90 g/h CHO cut GI symptoms by \~60% and improved within-group distance by \~4–5% while placebo fell \~2% (Costa 2017; Miall 2018 — same lab; samples may overlap). A 7-day feeding challenge lowered symptoms but had no no-feeding control (Martinez 2025).  
- **CHO type and ratio.** Above \~60 g/h use multiple transportable CHO. Evidence supports a fructose:glucose window of \~0.5–1.0:1, with **\~0.8:1 preferable from \~90–108 g/h upward** (Rowlands 2015; O'Brien 2011/2013). 2:1 remains acceptable around 90–108 g/h (Wallis 2005; King 2018). Peak exogenous oxidation with MTC is roughly 1.3–1.75 g/min depending on dose.  
- **Doses.** Guidelines: 30–60 g/h for 1–2.5 h and up to 90 g/h for \>2.5 h (Jeukendrup 2014; ACSM 2016), for well-trained athletes (aspiring athletes may need less). Morton 2026 proposes 120 g/h as an upper limit for trained athletes (not yet a position stand). Lab capacity optimum ≈107 g/h (95% CI 92–122); **150 g/h gives no further benefit** (Martyn 2026). 120 g/h can attenuate the drop in critical power after 3 h versus 60 g/h (Norte 2026). One trail field cohort (Viribay/Urdampilleta 2020, 2:1 gels) improved recovery markers at 120 g/h without changing race time. Pro cycling *reports* 90–120+ g/h (UCI Sports Nutrition Project review — practice, not efficacy).  
- **Format and fluid.** Formats oxidise similarly at 120 g/h (Hearris 2022). Hydrogels: one positive running study (Rowe 2022); overall no consistent advantage (King 2020; Mears 2020; Mlinaric 2025). Pair CHO with fluid (Lambert 2008).  
- **Variability.** Individual responses vary widely. GI history predicts race symptoms (Pfeiffer 2012). Marathon field mean intake was \~35 g/h (not "most athletes").  
- **Gaps.** Race-performance trials at 120 g/h; female athletes; best block length and how long adaptations last; heat and ultra (\>6 h). Oxidation data *do* exist above 120 g/h (144–150 g/h) but without capacity benefit at 150\.

---

## 3\. Core framework used by every plan

### 3.1 Onboarding

1. **Screening \[Evidence-based, Costa 2025; Pfeiffer 2012\]:** history of GI problems during exercise, diagnosed GI disease, red flags (blood in stool or vomit, severe recurring pain), NSAID use, current typical intake. Refer to a clinician or sports dietitian when indicated.  
2. **Baseline gut challenge \[Evidence, adapted from Costa 2017 / Miall 2018 / Martinez 2025\]:** 2 h at a steady, race-like intensity (\~60–70% VO2max), with CHO every 20 min at the current tolerated rate (60 g/h if unknown) plus water, followed by a short effort test.  
3. **Symptom scale \[Heuristic cut-offs\]:** rate 0–10 every 20 min for upper GI (nausea, reflux, bloating, fullness), lower GI (cramps, urge, diarrhoea, flatulence) and systemic symptoms. 0–2 \= mild, 3–4 \= moderate, ≥5 \= severe.

### 3.2 Intake stages (target g/h)

| Stage | Target CHO (g/h) | Ratio glucose/maltodextrin : fructose | Basis |
| :---- | :---- | :---- | :---- |
| S0 Foundation | 30–60 | Single source OK, or 2:1 | \[Evidence\] ACSM 2016; Jeukendrup 2014 |
| S1 | 60–75 | 2:1 | \[Heuristic\] intermediate step; typical for many amateur runners \[Heuristic\] |
| S2 | 75–90 | 2:1 or \~1:0.8 (0.5–1.0:1 window) | \[Evidence\] 90 g/h guideline; gut-training trials \~90 g/h; O'Brien/Rowlands support \~0.8:1 near 90–108 g/h |
| S3 | 90–105 | \~1:0.8 preferred | \[Heuristic\] transition; \[Evidence\] Martyn 2026 capacity optimum \~107 g/h |
| S4 Advanced | 105–120 | \~1:0.8 | \[Evidence\] Hearris 2022; Podlogar 2022; Norte 2026\. Not Viribay (that cohort used 2:1). Cap: 150 g/h shows no extra benefit (Martyn 2026\) |

### 3.3 Advancement rule \[Heuristic\]

- **Advance** one step (+10–15 g/h) after 2–3 key sessions in a row at the current step with all symptom scores ≤2 and normal session quality.  
- **Hold** if any score is 3–4.  
- **Step back** one step if any score is ≥5, the session was cut short, or performance clearly dropped (King 2019 suggests overdosing can hurt performance).  
- **Cap:** do not go beyond the sport/event target below unless performance data support it.

### 3.4 Rules for every gut-training session

- Spread intake evenly every 15–20 min \[Evidence: every protocol used 20-min dosing\].  
- Drink with every gel. The studies used \~10% w/v CHO and \~290 mL water per 20 min (Martinez 2025\) \[Evidence\]. Adjust for sweat rate and heat \[Heuristic\].  
- Use the products, formats and intensity planned for the race \[Evidence: Jeukendrup 2017 principle; specific product choice is heuristic\].  
- Keep daily CHO high on heavy days (≈6–10 g/kg/day; up to 8–12 g/kg for very high loads) \[Evidence: ISSN 2017 for the upper range; 6–10 is a heuristic midpoint\]. Avoid long periods on a low-CHO diet during the block \[Evidence: Costa 2025\].  
- For athletes prone to symptoms, a short-term low-FODMAP diet in the 24–48 h before key sessions and races \[Evidence: Costa 2025; caveat Gaskell 2020 in heat\]. Avoid NSAIDs \[Evidence: Costa 2025\]. Heat mitigation is promising, not yet "consistent benefit".

---

## 4\. Training plans by block length

| Plan | Length | Sessions | Dose | Basis |
| :---- | :---- | :---- | :---- | :---- |
| **A. Pre-race tune-up** | 7 days | 5–7 × 60 min at \~60% VO2max, CHO every 20 min | Race-day g/h (≥ current tolerance) | \[Evidence\] Martinez 2025 (7-day feeding challenge; no no-feeding control) |
| **B. Core 2-week block** | 14 days | \~5 days/week × 60 min at \~60% VO2max (shortest well-studied block; not proven as a minimum) | \~90 g/h, 2:1 or \~1:0.8, gels preferred for malabsorption benefit | \[Evidence\] Miall 2018; Costa 2017 (gels \> food for H2/glucose) |
| **C. Standard progression** | 4–6 weeks | 2–4 key sessions/week (60–180 min) at the current stage, plus a high-CHO diet | Advance through S0 → S4 using the rule in 3.3 | \[Evidence\] Cox 2010 (28 days high CHO); progression scheme \[Heuristic\] |
| **D. Maintenance** | Ongoing in the race season | ≥1 long session/week at race-day g/h | Race-day g/h | \[Heuristic\]; adaptations likely fade with low CHO (Jeukendrup 2017), but how fast is unknown |

**Recommended sequencing \[Heuristic\]:** baseline test → Plan C (4–6 weeks; Plan B can be its first 2 weeks) → re-test (repeat the baseline challenge) → Plan D → Plan A in race week minus 1\.

---

## 5\. Training plans by level / target g/h

### 5.1 Level 1 – "Fuel the basics" (target 60 g/h)

- **For:** beginners, runners currently at \<40 g/h, events of 1.5–3 h.  
- **Plan \[Heuristic\]:** 4 weeks, 2–3 sessions/week. Weeks 1–2 at 40–50 g/h, weeks 3–4 at 60 g/h. A single CHO source or 2:1 is fine.  
- **Success criteria:** 60 g/h for ≥2 h with symptoms ≤2.

### 5.2 Level 2 – "Guideline max" (target 90 g/h)

- **For:** athletes already tolerating \~60 g/h; events \>2.5 h (marathon to 70.3, gran fondo).  
- **Plan:** the core 2-week block at 90 g/h \[Evidence: Miall 2018 / Costa 2017\], then 2–4 weeks of key sessions at 75 → 90 g/h \[Heuristic\]. Ratio 2:1 or \~1:0.8 \[Evidence\]. Gels preferred if the goal includes lowering malabsorption \[Evidence: Costa 2017\].  
- **Success criteria:** 90 g/h for ≥3 h with symptoms ≤2 and stable or better performance on re-test.

### 5.3 Level 3 – "High-performance" (target 105–120 g/h)

- **For:** well-trained cyclists, long-course triathletes, trail/ultra runners already comfortable at 90 g/h; events \>4 h.  
- **Plan \[Heuristic\]:** 4–6 weeks. Raise intake by 10–15 g/h every 1–2 weeks (90 → 100 → 110 → 120\) in long sessions (2–5 h), preferring \~1:0.8 from \~90–108 g/h upward \[Evidence: O'Brien 2011/2013; Hearris 2022; Podlogar 2022; Martyn 2026\]. Do not push past \~120 g/h expecting more benefit \[Evidence: Martyn 2026 — no capacity gain at 150 g/h\]. Use a mix of drink, gel and chew/solid \[Evidence: similar oxidation, Hearris 2022\].  
- **Caution:** race-performance gains above 90 g/h are still limited; lab data support \~90–120 g/h for trained athletes (Norte 2026; Martyn 2026\) and show **no benefit at 150 g/h**. Check performance and symptoms at each step \[Evidence: King 2018/2019; King 2022 runners; Martyn 2026\].

---

## 6\. Training plans by sport

*The weekly structures are \[Heuristic\] templates that apply the evidence-based principles above.*

### 6.1 Cycling (road, gran fondo, gravel)

- **Event targets:** 2.5–4 h: 60–90 g/h (2:1 or \~1:0.8), up to 90–120 g/h if trained. \>4 h: 90–120 g/h as reported pro practice / advanced lab target — not a guarantee of faster racing \[Evidence: Jeukendrup 2014; Hearris 2022; Martyn 2026; UCI Sports Nutrition Project review 2026\].  
- **Weekly template (Plan C):**

| Day | Session | Gut-training dose |
| :---- | :---- | :---- |
| Tue | 90 min with race-intensity efforts | Current stage g/h, drink \+ gels |
| Thu | 60–90 min endurance | Current stage g/h, try new products |
| Sat | 3–5 h long ride | Current stage g/h; this is the advancement test session |
| Sun (optional) | 2 h endurance | Current stage g/h, solids allowed |

- **Sport notes:** solids are easier on the bike, especially early and at lower intensity \[Heuristic\]. In racing, eat more early, because race intensity is now higher early on \[Evidence: UCI 2026\].

### 6.2 Road running (half-marathon to marathon)

- **Event targets:** 1–2.5 h: 30–60 g/h. Marathon (\>2.5 h): 60–90 g/h if gut-trained \[Evidence: Jeukendrup 2014; ACSM 2016\]. Typical real-world intake is only \~35 g/h \[Evidence: Pfeiffer 2012\], so most runners should start at Level 1–2.  
- **Weekly template (Plan B → C):**

| Day | Session | Gut-training dose |
| :---- | :---- | :---- |
| Mon–Fri (Plan B, 14 days) | 60 min easy (\~60% VO2max) | \~90 g/h gels every 20 min \+ water \[Evidence: Miall 2018\] |
| Then (Plan C) Wed | 60–75 min with marathon-pace segments | Race-day g/h |
| Then (Plan C) Sun | 90–150 min long run | Race-day g/h, exact race gels |

- **Sport notes:** running jostles the gut more, so favour gels and drinks over solids \[Heuristic\]. Hydrogels are optional for runners prone to GI symptoms \[Evidence: Rowe 2022 positive; King 2020 review neutral\]. Practise taking gels at water-station spacing \[Heuristic\].

### 6.3 Trail and ultra running

- **Event targets:** 2.5–4 h: 60–90 g/h. \>4 h: 90 g/h, and up to 120 g/h for gut-trained athletes — one mountain-marathon cohort (two papers) showed better recovery markers at 120 g/h with 2:1 gels; race time unchanged \[Evidence: Viribay/Urdampilleta 2020\].  
- **Weekly template \[Heuristic\]:** 1 back-to-back weekend (long run of 3–5 h \+ 2 h the next day) at race-day g/h, plus 1 mid-week 75-min session with uphill hiking and gels. Rehearse real food (bars, rice, potatoes) at lower intensity. Small fat/protein snacks are acceptable in very long, low-intensity events \[Evidence: Martinez 2025 showed a similar symptom reduction with a fat snack, but fat adds little fast fuel\].  
- **Sport notes:** practise in heat and downhill terrain if the race has them; data in these conditions are limited \[Gap\].

### 6.4 Triathlon (70.3 and Ironman)

- **Event targets:**  
  - 70.3: 60–90 g/h overall, most of it taken on the bike \[Heuristic split; dose from Jeukendrup 2014\].  
  - Ironman: 80–100+ g/h on the bike, 60–90 g/h on the run \[Heuristic\]. In Ironman, higher CHO intake was linked to faster finishing times, and \~31% of athletes had serious GI symptoms \[Evidence: Pfeiffer 2012\].  
- **Weekly template (Plan C):**

| Day | Session | Gut-training dose |
| :---- | :---- | :---- |
| Wed | Brick: 90 min bike \+ 20–30 min run | Bike at race g/h; run at race g/h with gels |
| Sat | Long ride 3–5 h at race-target power | Race-day bike g/h (advancement test session) |
| Sun | Long run 75–120 min (sometimes the day after a long ride) | Race-day run g/h |

- **Sport notes:** glucose+fructose drinks improve fluid delivery as well as fuel delivery, which helps in the heat \[Evidence: Jeukendrup & Moseley 2010\]. Always rehearse the bike-to-run switch with the gut loaded \[Heuristic\].

---

## 7\. Race-day protocols

### 7.1 Targets by sport and duration

*For athletes who have completed the matching training level. Never use a dose or product on race day that was not rehearsed.*

| Event duration | Cycling | Road running | Trail / ultra | Triathlon \[Heuristic placement by typical finish time\] |
| :---- | :---- | :---- | :---- | :---- |
| \< 45 min | None | None | — | — (no standard triathlon distance) |
| 45–75 min | Mouth rinse / small amounts | Mouth rinse / small amounts | — | Elite sprint (\~1 h): mouth rinse or small amounts |
| 1–2.5 h | 30–60 g/h | 30–60 g/h | 30–60 g/h | Age-group sprint (\~1–1.5 h) and elite/fast Olympic (\~1:45–2:30): 30–60 g/h, mostly on the bike |
| 2.5–4 h | 60–90 g/h; up to 90–120 if trained (\~1:0.8) | 60–90 g/h if trained (field mean \~35 g/h, Pfeiffer 2012\) | 60–90 g/h | Slower Olympic (\>2.5 h); elite 70.3 (\~3.5–4 h): 60–90 g/h, mostly on the bike |
| \> 4 h | 90–120 g/h (reported pro practice; lab optimum \~107 g/h, Martyn 2026\) | — | 90 g/h; up to 120 if gut-trained (one trail cohort, 2:1 gels, recovery not race time; Viribay/Urdampilleta 2020\) | Age-group 70.3 (4–6 h): 60–90 g/h mostly on bike. Ironman: 80–100+ bike / 60–90 run \[Heuristic\]; higher CHO correlated with faster IM times (Pfeiffer 2012\) |

Sources: \[Evidence\] Jeukendrup 2014; ACSM 2016; Hearris 2022; Martyn 2026; Norte 2026; UCI Sports Nutrition Project review 2026 (practice); Viribay/Urdampilleta 2020 (one cohort); Pfeiffer 2012\. Triathlon row placement and Ironman splits are \[Heuristic\].

### 7.2 Race-day checklist

1. CHO loading 24–48 h before events longer than 90 min. Lab studies used \~8 g/kg for 24 h (Hearris 2022; Norte 2026\) or \~12 g/kg/day over 36 h (Martyn 2026). ISSN 8–12 g/kg/day is a daily glycogen-maximising intake, not a loading protocol per se \[Evidence / note\].  
2. Pre-race meal of \~1–4 g/kg CHO, 1–4 h before \[Evidence: ACSM 2016; Hearris 2022 used 2 g/kg\]. Keep it low in fibre and fat, and low-FODMAP if prone to symptoms \[Evidence: Costa 2025 for FODMAP; the rest is heuristic\].  
3. Start fuelling within the first 15–30 min and dose every 15–20 min \[Heuristic\].  
4. Lower the dose when absolute intensity is low \[Evidence: Jeukendrup 2014\]. Front-loading early in cycling races is an inference from higher early-race intensity (UCI 2026), not a prescribed protocol \[Heuristic\].  
5. Drink with CHO and avoid dehydration \[Evidence: Lambert 2008\].  
6. Fallback: if symptoms reach ≥3, drop one stage (−15 g/h), switch to a drink, and sip water \[Heuristic\].  
7. No NSAIDs before or during the race \[Evidence: Costa 2025\].

---

## 8\. Safety and limitations

- CarbAdapt gives educational guidance, not medical advice. Red-flag symptoms stop the plan and trigger referral.  
- Most evidence comes from trained men. Use extra caution when extrapolating to female, junior or masters athletes \[Gap\].  
- The heuristics in this plan (step sizes, advancement thresholds, sport splits) should be re-checked against CarbAdapt user data and new studies. See "Open questions" in the Scientific Evidence document.

---

## 9\. Product Specification

*Source: Francisco's spoken requirements (Spanish, summarised and translated), plus MVP decisions of 15 Oct 2026 and desk research on integration feasibility. Every feasibility claim links to its source. Items marked **\[Verify\]** still need confirmation with the vendor.*

### 9.0 MVP Scope & Phasing

#### MVP (ship first)

| Piece | Scope |
| :---- | :---- |
| **Web app** | Onboarding, plan view, history, integrations, product library, admin |
| **Backend / server** | All OAuth, tokens, webhooks, plan engine, adaptation engine, notifications, device pairing API |
| **iOS app (Swift / SwiftUI)** | Daily briefing push, post-workout questionnaire, device pairing, session cards |
| **Garmin Connect IQ app** | In-workout eat/drink alerts on Garmin watches and Edge (paired to the user account) |
| **Integrations (MVP)** | **Garmin (primary)** \+ **TrainingPeaks** (Francisco already has API/SDK access) \+ **Strava** (Francisco already has API access; 10-athlete limit is acceptable for MVP) |
| **Modes** | Fuel-right and optional gut-training |

Monetization (MVP): none — no subscription/paywall. Beta via TestFlight \+ Connect IQ beta with all features unlocked as if subscribed. Subscription/payments deferred to post-MVP (User Flows §17).  
Initial free report (after onboarding): (a) weekly energy expenditure \+ carb needs; (b) gap vs current intake; (c) current tolerance g/h \+ achievable target; (d) next-workout fueling; (e) soft preview of the rest of the week's plan (not shown as locked).  
Languages (MVP): English, Spanish, and Portuguese — i18n from day one across web, iOS, Connect IQ, and notifications.  
Weather (MVP): fluid/sodium adjustment uses automatic forecast at the user's location and workout time; user can edit. Sweat rate & sodium (MVP): start from evidence-based standard estimates by weight and weather; optional guided sweat test (pre/post weigh-in) to refine.  
Tech stack (MVP, decided 15 Oct 2026): Next.js (web), Node.js (backend), Swift (iOS), MySQL (database), Monkey C (Garmin Connect IQ).  
**Top-priority action item:** apply to the **Garmin Connect Developer Program** (Activity / Training APIs). Francisco uses Garmin for everything; this is the primary MVP integration. See risk and mitigation in §9.4 and §9.7.

#### Phase 2+

| Piece | Notes |
| :---- | :---- |
| **Android app (Kotlin)** | Deferred from MVP; same feature parity as iOS later |
| Wahoo Cloud API \+ phone alerts | No on-device ELEMNT apps |
| Zwift Training Connections (push only) | No public read API |
| RestOrTrain partnership | No public API |
| Intervals.icu | Strong bridge / analytics |
| Apple Health / WorkoutKit | iOS alerts on Apple Watch |
| Health Connect | With Android |
| Hammerhead Karoo (karoo-ext) | On-device bike-computer alternative |
| Polar / COROS / Suunto / Final Surge | Expand device coverage |

### 9.1 Overview

CarbAdapt is a fuelling and gut-training companion for endurance athletes. It:

1. Imports the athlete's planned training from the platforms they already use.  
2. Sends a **daily fuelling briefing** for each session: how much carbohydrate, water and sodium to carry and when to take it.  
3. Optionally runs an evidence-based **gut-training programme** (see sections 3–7) toward a goal race, with load that progresses and peaks in the final weeks.  
4. Collects a **post-workout questionnaire**, triggered automatically when the provider reports the workout as finished, to build a longitudinal tolerance profile. This profile decides whether to raise CHO/h or hold.  
5. Gives **in-workout eat and drink alerts** on the watch or bike computer through native device apps linked to the phone app.

**Modes:** (a) *Fuel-right mode*: per-session fuelling guidance only, no gut-training plan. (b) *Gut-training mode*: fuel-right mode plus a progressive plan toward a goal.

### 9.2 Platforms

| Client | Phase | Technology | Role |
| :---- | :---- | :---- | :---- |
| Web app | **MVP** | Next.js (decided 15 Oct 2026\) | Onboarding, plan, history, integrations, product library |
| Backend | **MVP** | Node.js \+ MySQL \+ queue \+ APNs (decided 15 Oct 2026\) | OAuth, webhooks, engines, notifications, device API |
| iOS app | **MVP** | Native Swift / SwiftUI | Briefings, questionnaire, pairing, session cards |
| Garmin Connect IQ | **MVP** | Monkey C data field (+ optional widget) — decided | In-workout alerts on watches and Edge |
| Android app | Phase 2 | Native Kotlin / Jetpack Compose | Parity with iOS; Health Connect |
| Wahoo device | Phase 2 | No on-device apps; Cloud API only | Data \+ phone-alert fallback |
| Hammerhead Karoo | Phase 2 | karoo-ext | On-ride alerts |
| Apple Watch | Phase 2 | WorkoutKit / watchOS | In-workout alerts |

### 9.3 Architecture

#### 9.3.1 Backend responsibilities

- **All third-party connections live in the backend.** OAuth 2.0 flows, token storage (encrypted at rest, e.g., a KMS-wrapped secrets table), token refresh, scope management, deauthorisation handling. Client apps never hold provider secrets.  
- **Integration adapters:** one connector per provider behind a common interface (`listPlannedWorkouts`, `getCompletedActivity`, `subscribeWebhooks`, `pushWorkout`). The rest of the system is provider-agnostic.  
- **Webhook ingestion:** a public HTTPS endpoint per provider that acknowledges quickly. Strava, for example, requires a 200 within 2 seconds and retries up to 3 times. Events go onto a queue; workers fetch the details asynchronously.  
- **Plan engine:** computes each session's fuelling protocol (g/h, ratio, fluid, sodium, timing) from session duration, intensity and sport, the athlete's stage and goal, and their product library. Applies the rules in sections 3–7.  
- **Adaptation engine:** uses the post-workout questionnaire data to advance, hold or step back the athlete's stage (rule 3.3).  
- **Notification service:** schedules the briefing pushes (APNs in MVP; FCM when Android ships in Phase 2\) in the user's time zone, and triggers the post-workout questionnaire push from webhook events.  
- **Device service:** device pairing codes, device registration, and a lightweight device API (session protocol download, alert schedule, sync acknowledgement).  
- **Decided stack (15 Oct 2026): Next.js (web), Node.js (backend), Swift / SwiftUI (iOS), MySQL (database), Monkey C (Garmin Connect IQ). Job queue (e.g., SQS / Cloud Tasks), object storage for FIT files, and APNs (MVP); FCM in Phase 2 when Android ships. Hosting provider for backend and database: \[Open — deferred; to be decided later\].**

#### 9.3.2 Data model sketch

| Entity | Key fields |
| :---- | :---- |
| User | id, email, locale, timezone, sport(s), body mass, mode (fuel-right / gut-training), notification preferences (briefing time, "day before" vs "same day") |
| ProviderConnection | user\_id, provider, external\_user\_id, access/refresh token (encrypted), scopes, status, webhook\_subscription\_id |
| PlannedSession | id, user\_id, provider, external\_id, date/time, sport, duration, intensity metrics (TSS/IF/zones), structure (optional), source\_updated\_at |
| CompletedActivity | id, user\_id, provider, external\_id, planned\_session\_id (match), start/end, duration, avg HR/power/pace, temperature (if available), FIT file ref |
| FuelProtocol | id, planned\_session\_id, target\_g\_per\_h, ratio\_glu\_fru, fluid\_ml\_per\_h, sodium\_mg\_per\_h, feeding\_interval\_min, schedule \[{t\_min, item, grams\_cho, ml}\], items\_to\_carry \[{product\_id, qty}\] |
| Product | id, owner (global / user), brand, name, format (gel/drink/bar/chew/food/fat-mix/fruit/syrup), cho\_g, glucose\_g, fructose\_g, sodium\_mg, caffeine\_mg, volume\_ml |
| GutProfile | user\_id, current\_stage, current\_tolerated\_g\_per\_h, baseline answers, history-of-GI flag, red flags |
| GutTrainingPlan | id, user\_id, goal\_event (date, sport, expected duration), block type (A/B/C/D), weekly targets \[{week, g\_per\_h, sessions}\], status |
| PostWorkoutLog | id, completed\_activity\_id, cho\_ingested\_g, duration\_of\_intake\_min, fluid\_ml, sodium\_mg (derived), products used, GI scores (upper / lower / systemic 0–10), overall feeling, free text |
| Device | id, user\_id, platform (garmin/karoo/…), model, pairing status, last\_sync\_at, device\_token |
| PairingCode | code, device\_nonce, expires\_at, claimed\_by\_user\_id |
| NotificationJob | id, user\_id, type (briefing / post-workout / reminder), scheduled\_at, payload, status |

#### 9.3.3 Notifications

- **Daily briefing:** the user picks a time (e.g., 20:00 the day before, or 08:00 the same day). The backend generates the briefing from that day's PlannedSession(s), re-checks for plan changes about 1 h before sending, and pushes via APNs (MVP; FCM later) with a deep link to the session's fuelling card.  
- **Pre-workout reminder (optional):** sent X minutes before the planned start time (if the provider supplies one): "Pack: 3 gels, 2 × 750 mL bottles with 1 g sodium."  
- **Post-workout questionnaire:** triggered by a completed-activity webhook (Strava activity `create`, Wahoo `workout_summary`, Garmin activity push, TrainingPeaks `workout-created/updated`, Intervals.icu activity webhook). Deduplicate across providers (the same ride often reaches several platforms), then push once. Fallback if no webhook: a scheduled check after the planned end time.

### 9.4 Integrations

#### 9.4.1 MVP integrations (decided)

| Provider | Role in MVP | Access status (Francisco) |
| :---- | :---- | :---- |
| **Garmin** | **Primary.** Completed activities (when Connect Developer Program is approved); Connect IQ on-device alerts (does **not** need that programme). Planned-workout *read* from Garmin calendar is not documented — rely on TrainingPeaks \+ manual/templates meanwhile | **Must apply now** to Garmin Connect Developer Program (top-priority action). Intake of new API requests has been reported as paused (see table) |
| **TrainingPeaks** | Planned workouts (up to 7 days), completed-workout webhooks, optional nutrition summaries | **Already has API/SDK access** |
| **Strava** | Completed-activity webhooks; no planned workouts | **Already has API access; 10-athlete limit OK for MVP** |

#### 9.4.2 Proposed additional integrations (Phase 2+)

| Integration | Why it is worth adding | Feasibility note |
| :---- | :---- | :---- |
| **Intervals.icu** | Popular coaching/analytics platform. Public API with OAuth, calendar read/write and webhooks. Many athletes route Polar/Suunto/MyWhoosh data through it (RestOrTrain uses it this way). Also a practical **bridge for planned workouts while Garmin/TrainingPeaks access is blocked** | High: self-service API ([Open API](https://www.intervals.icu/features/open-api/), [API cookbook](https://forum.intervals.icu/t/intervals-icu-api-integration-cookbook/80090)) |
| **Apple Health \+ WorkoutKit (iOS)** | Completed workouts from Apple Watch and others. WorkoutKit can schedule custom workouts with **step alerts** on Apple Watch, which could deliver eat/drink cues natively | High, on-device only ([WorkoutKit WWDC23](https://developer.apple.com/videos/play/wwdc2023/10016/), [WorkoutScheduler](https://developer.apple.com/documentation/workoutkit/workoutscheduler/schedule\(_:at:\))) |
| **Health Connect (Android)** | Completed exercise sessions, and **planned sessions** (PlannedExerciseSessionRecord) | High, on-device only ([Training plans](https://developer.android.com/health-and-fitness/health-connect/features/training-plans)) |
| **Hammerhead Karoo** | The only major bike computer besides Garmin with **on-device third-party extensions** (karoo-ext), so a direct substitute for the Wahoo device app | Medium–High ([karoo-ext](https://github.com/hammerheadnav/karoo-ext), [Extensions FAQ](https://support.hammerhead.io/hc/en-us/articles/31150180125083-FAQ-Hammerhead-Extensions)) |
| **Polar** | Large running/triathlon user base. AccessLink is self-service OAuth2 | High ([Polar AccessLink](https://www.polar.com/accesslink-api/)) |
| **COROS** | Growing running/trail/ultra share | Medium: partner application required ([COROS Partner API](https://support.coros.com/hc/en-us/articles/53181766856724-Partner-API-Access)) |
| **Suunto** | Trail/ultra audience | Medium: company application required ([Suunto API Zone](https://apizone.suunto.com/how-to-start)) |
| **Final Surge** | Popular with run coaches | Low: no public API found; partnership by inquiry only ([Connected apps](https://www.finalsurge.com/connected-apps)) |

#### 9.4.3 Feasibility table

| Provider | API availability and access | Read planned workouts? | Completed-workout webhook? | Push workouts to device? | Key constraints | Sources |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Garmin Connect** (**MVP primary — apply now**) | Garmin Connect Developer Program (Health, Activity, Training, Courses APIs); business approval needed. **New API access requests are reportedly paused** ("temporarily paused the review and approval of new API access requests", per Garmin support replies quoted by developers on Garmin's forum, mid-2026 through early Oct 2026\) | **No documented read of the user's own Garmin calendar.** The Training API is for *publishing* workouts and plans to Garmin Connect | **Yes**: push or ping/pull notifications for activities after device sync | **Yes**: Training API publishes and schedules workouts, which sync to devices | Approval blocked for now; commercial terms. **Top-priority action: submit application and follow up.** Meanwhile use Connect IQ \+ TrainingPeaks/Strava data path | [Program overview](https://developer.garmin.com/gc-developer-program), [Activity API](https://developer.garmin.com/gc-developer-program/activity-api/), [Forum: onboarding paused](https://forums.garmin.com/developer/fit-sdk/f/discussion/435484/developer-onboarding-blocked) |
| **Garmin Connect IQ (device apps)** (**MVP**) | Free SDK; apps published on the Connect IQ Store after Garmin review. **Separate from the Connect Developer Program** | n/a (our app downloads our own protocol from our backend) | n/a | n/a | Device memory/API-level fragmentation; web requests go via the phone over Bluetooth or Wi-Fi | [SDK](https://developer.garmin.com/connect-iq/sdk/), [Publishing](https://developer.garmin.com/connect-iq/core-topics/publishing-to-the-store/), [Communications](https://developer.garmin.com/connect-iq/api-docs/Toybox/Communications.html) |
| **Wahoo** (Phase 2+) | Wahoo Cloud API, OAuth2; app must be **approved** (sandbox and production are separate applications). Scopes include workouts\_read/write, plans\_read/write, offline\_data | **Partly.** Workouts and plans in the Wahoo cloud can be read (`workouts_read`, `plans_read`), but only those stored in Wahoo (e.g., from SYSTM or partners) \[Verify coverage\] | **Yes**: `workout_summary` webhook (needs `offline_data`); retries at 30 min, 4 h, 24 h, 72 h | **Yes**: plans attached to workouts scheduled today to \+6 days appear on ELEMNT/BOLT/ROAM; extra "Wahoo Plans" entitlement via partnerships@ \[Verify\] | **No third-party on-device apps** on ELEMNT | [Cloud API docs](https://cloud-api.wahooligan.com/), [Developer portal](https://developers.wahooligan.com/cloud), [Planned workouts on ELEMNT](https://support.wahoofitness.com/hc/en-us/articles/115001223770-Planned-Workouts-ELEMNT) |
| **TrainingPeaks** (**MVP — Francisco already has API/SDK access**) | Partner API, approved commercial developers only. Public intake currently closed to *new* partners ("while we do some maintenance on our API systems"), which does not affect existing access | **Yes**: planned workouts up to **7 days ahead** | **Yes (Early Access)**: `workout-created/updated/deleted` webhook subscriptions | **Yes**: push planned workouts to the TP calendar (which then syncs to devices). Also **nutrition summaries** endpoints | Prohibits competing with TP; 7-day cache limit on content; branding rules | [Request access](https://api.trainingpeaks.com/request-access), [Help: TP API](https://help.trainingpeaks.com/hc/en-us/articles/234441128-TrainingPeaks-API), [Partner API wiki](https://github.com/TrainingPeaks/PartnersAPI/wiki/Workouts-Create), [Webhook subscription](https://github-wiki-see.page/m/TrainingPeaks/PartnersAPI/wiki/Webhook-Create-Subscription) |
| **Strava** (**MVP — Francisco already has API access; 10-athlete limit OK for MVP**) | Public API, OAuth2. Defaults: 200 req/15 min and 2,000/day overall (100/1,000 for non-upload/read). Self-service upgrade to **10 athletes**; more than 10 needs an app review; Extended Access ≥10,000 athletes. Agreement updated 1 Jun 2026; new base URL from 4 Jan 2027 | **No**: Strava has no planned-workout calendar API | **Yes**: activity create/update/delete and deauthorisation events (one subscription per app; ack within 2 s) | No | **Data may only be shown to the owning user; may not be used in AI models**; webhooks required for deauthorisation | [Rate limits](https://developers.strava.com/docs/rate-limits/), [Getting started](https://developers.strava.com/docs/getting-started/), [Webhooks](https://developers.strava.com/docs/webhooks/), [API agreement update](https://press.strava.com/articles/updates-to-stravas-api-agreement), [API FAQ](https://communityhub.strava.com/developers-knowledge-base-14/strava-api-faq-12906) |
| **Zwift** (Phase 2+) | **No public data API.** Zwift's "Training Connections" API (2024) lets *approved training providers push workouts into Zwift* (Custom Workouts). It is not for reading user data | No | No (completed Zwift rides reach us indirectly via Strava, Garmin, TrainingPeaks or Intervals.icu auto-sync) | Yes, via the Training Connections programme (approval) \[Verify current onboarding\] | Indoor ride data only via third parties | [Zwift newsroom, Training Connections](https://news.zwift.com/en-WW/236781-reach-new-fitness-heights-with-new-features-landing-this-season-on-zwift/) |
| **RestOrTrain** (Phase 2+) | **No public developer API found.** RestOrTrain is itself an AI coaching app that sends workouts to Garmin, Wahoo, COROS, Karoo, Zwift, Rouvy and Intervals.icu; no web version; contact [contact@restortrain.com](mailto:contact@restortrain.com) | **Indirectly**: its planned workouts land in Garmin/Wahoo/Intervals.icu/Zwift calendars, and can be read from there (e.g., Intervals.icu) | n/a | n/a | Needs a partnership conversation | [FAQ](https://restortrain.com/faq), [Send workouts](https://restortrain.com/send-workouts-to-garmin-wahoo-zwift) |
| **Intervals.icu** (Phase 2+; bridge if Garmin stalls) | Public API; personal API key or **OAuth** (CALENDAR:READ/WRITE); webhooks (activity upload, `CALENDAR_UPDATED`) | **Yes**: events of category WORKOUT | **Yes** | Yes (to its calendar, which syncs onward to Garmin/Wahoo) | Small vendor; check terms for commercial use \[Verify\] | [Open API](https://www.intervals.icu/features/open-api/), [OAuth](https://forum.intervals.icu/t/intervals-icu-oauth-support/2759), [Cookbook](https://forum.intervals.icu/t/intervals-icu-api-integration-cookbook/80090) |
| **Apple Health / WorkoutKit** (Phase 2+) | On-device frameworks (HealthKit, WorkoutKit) | Workouts scheduled by our own app; no read of Garmin/TP plans | HealthKit background delivery of new workouts (on-device) | **Yes**: WorkoutKit schedules custom workouts (step alerts) on Apple Watch | iOS-only, on device; reported scheduling limit \[Verify\] | [WorkoutKit WWDC23](https://developer.apple.com/videos/play/wwdc2023/10016/), [WorkoutStep alerts](https://developer.apple.com/documentation/workoutkit/workoutstep/init\(goal:alert:\)) |
| **Health Connect** (Phase 2+) | On-device Android API | **Yes**: PlannedExerciseSessionRecord (if other apps write them) | On-device change tokens | Can write planned sessions | Android-only | [Training plans](https://developer.android.com/health-and-fitness/health-connect/features/training-plans) |

**Bottom line (MVP):** Garmin is the primary integration but its Connect Developer Program intake is reportedly paused, so applying is the top-priority action. While it is pending, the MVP data path is **TrainingPeaks (planned workouts \+ webhooks; access already held) \+ Strava (completed activities; access already held, 10 athletes)**, with the **Connect IQ app** (independent of that programme) delivering in-workout alerts from our backend, plus manual/template sessions as fallback. Wahoo, Zwift, RestOrTrain, Intervals.icu, Apple Health and Android follow in Phase 2+.

### 9.5 Features and user flows

#### 9.5.1 Onboarding (both modes)

1. Account creation → sport(s), body mass, time zone, briefing time preference.  
2. Connect providers (OAuth in the backend; the client opens the provider consent page and the backend receives the callback).  
3. Import the planned schedule (where supported) or add sessions manually or with a quick template ("2 h Z2 ride Saturday").  
4. **Fuelling baseline questionnaire:**  
   - Current CHO per hour, and in which situations (training vs racing, long vs short, cycling vs running).  
   - CHO types used: natural food, fat-containing mixes (e.g., nut butter), fruit, syrups/honey, gels, drinks, bars, chews.  
   - **Named products** from a searchable product library, or user-created products with grams of CHO (and glucose/fructose split if known), sodium (mg), fluid/volume (mL) and caffeine per unit. These per-unit values feed every calculation.  
   - Typical fluid intake and sodium habits; known sweat rate (optional).  
   - GI history and red-flag screen (section 3.1).  
5. Choose the mode: **Fuel-right only**, or **Gut training** with a goal (event, date, sport, expected duration).

#### 9.5.2 Feature 1: Daily fuelling briefing

- At the chosen time, push: "Tomorrow: 3 h 30 endurance ride. Target 80 g CHO/h (2:1) → carry 4 × Gel X \+ 2 × 750 mL bottles of Drink Y (each 40 g CHO, 500 mg Na). Eat every 20 min from minute 15\. Fluid \~600 mL/h."  
- The briefing card shows a timeline (what to take, minute by minute), a packing list, and the total CHO, fluid and sodium.  
- Logic: duration and intensity from the planned session → duration-band target (section 7.1) → capped or raised by the athlete's stage (gut-training mode) → translated into the user's products. Fluid and sodium use defaults until sweat data exist. **\[Heuristic\]** defaults should be shown as editable.

#### 9.5.3 Feature 2: Gut-training programme (optional)

- Generates a plan from the baseline and the goal date, using the block structures in sections 4–6 (e.g., Plan C with a Plan A tune-up in race week minus 1). Load is **progressive and peaks in the final 3–4 weeks** before the event, which matches Francisco's requirement and the advancement rule in 3.3.  
- Gut-training sessions are tagged on top of the user's imported schedule. CarbAdapt does **not** change training load, only the fuelling prescription for selected sessions.  
- Each week the adaptation engine reviews PostWorkoutLogs and **advances, holds or steps back** the target g/h.

#### 9.5.4 Pre- and post-workout loop

1. **Pre-workout:** the briefing or reminder push with the packing list.  
2. **During:** device alerts (9.6).  
3. **Post-workout:** a completed-activity webhook arrives → matched to the PlannedSession → push "How did fuelling go?" → a 30-second questionnaire:  
   - CHO actually ingested (pre-filled from the plan, adjustable per product);  
   - over what time;  
   - water drunk;  
   - GI symptoms (upper / lower / systemic 0–10);  
   - overall feeling/energy;  
   - optional notes.  
4. The data feed the longitudinal **tolerance chart** (g/h vs symptom score over time) and the adaptation decision.

### 9.6 Device apps and pairing

#### 9.6.1 Garmin (Connect IQ) — MVP

- **App type:** a Connect IQ **data field** (runs inside the native activity profile on watches and Edge), plus an optional widget/glance for pairing and status. Data fields can show alerts (`DataFieldAlert`, API level 3.2+, supported on Edge 530/540/830/840/1030/1040/1050 and others) and vibrate or beep (`Attention`).  
- **Behaviour:** before the session, the app downloads the day's FuelProtocol (`Communications.makeWebRequest`, via the paired phone or Wi-Fi). During the activity it triggers "EAT: gel (25 g)" / "DRINK: 150 mL" alerts on the schedule, based on elapsed (timer) time. It can show a running total of CHO taken versus target. The user can tap or lap to confirm intake \[Verify UX within data-field constraints\].  
- **Constraints:** memory limits vary by device; the device needs a connection to fetch the protocol. Cache it the day before so it works offline. Background web requests are possible through a ServiceDelegate; sound and vibration are **not** available from background processes.  
- Sources: [DataFieldAlert](https://developer.garmin.com/connect-iq/api-docs/Toybox/WatchUi/DataFieldAlert.html), [Attention](https://developer.garmin.com/connect-iq/api-docs/Toybox/Attention.html), [Communications](https://developer.garmin.com/connect-iq/api-docs/Toybox/Communications.html).

#### 9.6.2 Wahoo ELEMNT / BOLT / ROAM — Phase 2

- **Finding:** Wahoo bike computers **do not support third-party on-device apps or custom data fields**. There is no Connect IQ equivalent; third-party integrations are cloud syncs of routes, planned workouts and completed rides ([Wahoo third-party authorisation](https://support.wahoofitness.com/hc/en-us/articles/115000504304-Authorize-a-3rd-party-app-for-route-planned-workout-sync-or-completed-ride-upload-ELEMNT); community confirmation in the [Xert forum](https://forum.xertonline.com/t/magic-buckets-on-wahoo/47557)).  
- **Fallback options:**  
  - (a) **Planned-workout encoding \[Verify\]:** push a Wahoo "plan" through the Cloud API whose intervals line up with feeding times and are labelled (e.g., "EAT gel"), so ELEMNT's interval transitions serve as cues. This only works for structured sessions and may clash with the athlete's own structured workout.  
  - (b) **Phone-based alerts:** our iOS app (Android in Phase 2\) runs a workout timer and sends local notifications or audio cues. The ELEMNT can mirror phone notifications if enabled \[Verify\].  
- **Recommendation:** in Phase 2, treat Wahoo as a *data* integration (webhook \+ plans) with phone-based alerts. Add **Hammerhead Karoo** (karoo-ext) for a true on-device experience on a non-Garmin bike computer.

#### 9.6.3 Pairing flow (MVP: Connect IQ ↔ iOS; Karoo and others later)

1. The user installs the device app (Connect IQ Store / Karoo Extension Library).  
2. On first launch, the device app calls `POST /devices/pairing` with a device nonce and model. The backend returns a short **pairing code** (e.g., 6 characters, expiring in 10 min), which the device shows.  
3. The user opens the phone app → *Devices → Add device* → enters the code.  
4. The backend links the device to the user account and issues a **device token**. The device app polls `GET /devices/pairing/{nonce}` until it is claimed, then stores the token.  
5. From then on, the device app fetches `GET /devices/me/protocol?date=…` and posts intake confirmations. The phone and device apps share state through the backend, so the phone shows device sync status and the device shows the protocol the phone generated.  
6. Unpairing from either side revokes the token. *(This mirrors the OAuth 2.0 device authorisation pattern, RFC 8628.)*

### 9.7 Risks and open questions

1. **Garmin Connect Developer Program paused — top risk for the primary MVP integration.** Without it there is no Garmin activity webhook and no workout push. *Action (top priority):* submit the application now and follow up regularly. *Mitigation while waiting:* the Connect IQ app does not depend on this programme; use TrainingPeaks (planned \+ completed) and Strava (completed, many Garmin users auto-sync) as the data path; Intervals.icu as a Phase-2 bridge. \[Verify current status directly with Garmin\]  
2. **TrainingPeaks:** access is already held, so the new-partner pause does not block the MVP. Comply with TP's do-not-compete clause, 7-day cache rule and branding requirements.  
3. **Reading planned workouts from Garmin:** no documented API for reading the user's own Garmin calendar. Confirm with Garmin once onboarding reopens.  
4. **Strava limits:** access already held; the 10-athlete cap is acceptable for the MVP. Submit for review before wider launch. Data may be shown only to the owning user and **must not be used in AI models**; keep Strava data out of any model training.  
5. **Zwift:** no read API. Rely on auto-sync from Zwift to Strava, Garmin, TrainingPeaks or Intervals.icu for completed rides. Check whether pushing fuelling-cue workouts via Training Connections is allowed.  
6. **RestOrTrain:** no public API. Contact [contact@restortrain.com](mailto:contact@restortrain.com) about a partnership. Meanwhile read its workouts once they land in Intervals.icu, Garmin or Wahoo.  
7. **Wahoo device experience:** no on-device app. Validate the planned-workout cue workaround and whether ELEMNT shows interval names \[Verify\]. Wahoo "Plans" entitlement terms \[Verify\].  
8. **Duplicate activities** across providers: build a matching and deduplication layer (time window plus duration plus sport).  
9. **Health and medical positioning:** GI symptom data are health data (GDPR special category in the EU; local Argentine data-protection law applies). Get explicit consent, minimise data, support deletion. Avoid medical claims, and use the red-flag referral flow.  
10. **Product database:** a seed list of common gels, drinks and bars with CHO, glucose:fructose split and sodium. Who maintains it, and how do we validate user-entered products?  
11. **Fluid and sodium personalisation** depends on sweat-rate data. Should CarbAdapt add a guided sweat test in v1.1?  
12. **Business and legal:** each provider's branding and attribution rules (Strava, TrainingPeaks, Garmin). Some approvals need an incorporated company, a privacy policy and a live website.  
13. **Phasing:** Android (Kotlin), Wahoo, Zwift, RestOrTrain, Karoo and Apple Watch are Phase 2+ and must not block the MVP.

## 10\. Competitive Landscape

App name: CarbAdapt (selected 15 Oct 2026, provisional; formerly the working name TrainGut). Verified competitor URLs and positioning below (checked Oct 2026 ART). Our wedge: an integrated, personalized system (web \+ iOS \+ Garmin Connect IQ) synced with TrainingPeaks / Strava / Garmin that adapts fueling and progressive gut training to each athlete's foods, timing, tolerance and post-workout feedback — not a one-shot race calculator, not a gel subscription alone, and not a daily meal planner without on-device execution.

### 10.1 Direct / near-direct

TrainedGut — https\://trainedgut.com  
Personalised gut-training protocol for endurance (Ironman, marathon, ultra, gran fondo, etc.), grounded in gut-training literature (Costa/Martinez/Podlogar cited on site). Week-by-week progression from current tolerance; post-session feedback adjusts dose; optional gels shipped by phase. Recruiting a first cohort for 2027 races; nutritionist-style / protocol package, not a full multi-platform training stack with live watch alerts and TP/Strava sync marketed as the product.  
Differentiation: name proximity is a branding risk (this is why the former working name TrainGut was dropped). Product-wise we compete on software-first execution (CIQ alerts, TP/Strava sync, food-level personalization, continuous feedback loop) vs their protocol \+ optional product fulfillment launching later.  
Fuel the Goal (FG) — https\://fuelthegoal.com (+ Garmin Connect IQ presence)  
Spanish-language web nutritional planner for cycling (FTP, ride type, duration, bottles, sweat/temp) producing pack lists and hydration plans; separate Garmin alerts; little progressive gut-training customization.  
Differentiation: FG is a ride planner \+ reminders, not an adaptive gut-training programme across a season with multi-sport TP/Strava sync and tolerance progression.

### 10.2 Broader endurance nutrition apps / tools

Ultrition — https\://ultrition.com (ultrition.app). Closest feature overlap: sweat test, session carb/sodium/fluid plans, timed intake schedule, watch alerts, log intake \+ gut comfort, carb tolerance progression in 5–10 g/h steps, aid-station mapping, coach link. Brand-agnostic product catalogue. Differentiation: compete on TrainingPeaks-native planning, Connect IQ execution quality, and sport-specific gut-training plans already specified in this Master Plan; verify their shipping status and platform coverage.  
CarbRate — https\://carbrate.com. Course-aware marathon/race fueling: personalized plan, week-by-week gut practice schedule, weather-adaptive race plan, audio race-day cues, product catalogue. Differentiation: CarbRate is race/course-centric (esp. marathon); we target season-long multi-sport training with TP sync and progressive programmes for bike/run/trail/tri.  
Fuelin — https\://fuelin.com (TrainingPeaks partner). Daily nutrition / fueling guidance from planned workouts via TP; pre-/during-/post targets; broader diet coaching, not a dedicated progressive gut-training \+ on-device carb ladder. Differentiation: Fuelin owns periodised daily nutrition; we own in-session CHO progression, GI feedback, and watch execution.  
Saturday — https\://saturday.fit (App Store: Saturday: Pro Fuel & Hydration). Per-workout / race carbs, fluid, sodium; DIY drink recipes; multi-brand. Differentiation: calculator/recipes vs adaptive gut-training system with synced training load and CIQ.  
Precision Fuel & Hydration Planner — https\://www\.precisionhydration.com/planner/. Free web race planner (CHO / fluid / sodium \+ race-day guide); product-led toward PF\&H SKUs; one event at a time. Differentiation: static/event planner vs continuous adaptive training product.  
Hexis — https\://hexis.live. Daily carbohydrate periodization, Carb Codes, food logging, training-app sync. Differentiation: Hexis \= day-around-training nutrition; we \= during-exercise fueling \+ gut capacity.  
Mavr — https\://www\.mavr.app. Nutrition/recovery/race plans tied to training calendar. Differentiation: overlapping plan-from-calendar space; lean into gut-training ladder \+ CIQ as the sharp edge.  
Supersapiens (historical). CGM athlete stack discontinued (\~2024; app later removed). Category lesson (hardware-dependent fueling feedback failed commercially), not an active competitor. Soft CGM integrations only if a clear partner exists later; do not depend on CGM for MVP.

### 10.3 Positioning summary

TrainedGut — Core: 2027 protocol \+ optional gels. Gap we fill: live multi-platform software \+ TP/Strava/CIQ now.  
Fuel the Goal — Core: cycling web planner \+ CIQ alerts. Gap we fill: progressive gut training, multi-sport, deep personalization.  
Ultrition — Core: session plans \+ gut ladder \+ watch. Gap we fill: TP-native plans, sport programmes, CIQ depth.  
CarbRate — Core: course-aware race fueling (run). Gap we fill: season-long multi-sport training stack.  
Fuelin / Hexis / Mavr — Core: daily / periodised nutrition. Gap we fill: in-session CHO \+ GI progression \+ device cues.  
Saturday / PF\&H planner — Core: calculators / event planners. Gap we fill: continuous adaptive product, not a one-shot plan.

## 11\. Naming candidates

Avoid names close to TrainedGut and Fuel the Goal. DECISION (15 Oct 2026): CarbAdapt is SELECTED as the app name (provisional, pending formal trademark search). All docs were renamed from the former working name TrainGut. Domain status from RDAP (rdap.org) Oct 2026: "appears available" \= no registration object (RDAP 404); "registered" \= registration object present. Conflict checks \= web \+ App Store–oriented search; not a formal trademark clearance (run USPTO/EUIPO counsel before filing).

### 11.1 Top 5 (recommended shortlist)

1\. CarbAdapt — ✅ SELECTED (provisional, 15 Oct 2026\) — .com appears available · .app appears available — Signals progressive carbohydrate adaptation; clear for athletes; no sports-nutrition app found (only unrelated carburetor hardware "Carb Adapt").  
2\. FuelGut — .com appears available · .app appears available — Direct fuel+gut promise; no same-named sports app found; distinct from TrainedGut / Fuel the Goal.  
3\. EnduFuel — .com appears available · .app appears available — Endurance \+ fuel; watch phonetic overlap with Tailwind "Endurance Fuel" product line (not an app) — acceptable with distinct branding.  
4\. FuelAdapt — .com appears available · .app appears available — Adaptive fueling without "gut" in the mark (broader appeal); no sports app found; note nearby TM FUELADAPTIVE (engines, unrelated).  
5\. AbsorbEnd — .com appears available · .app appears available — Absorption \+ endurance; unused in app search; slightly more abstract but on-message.

### 11.2 Full candidate set (14)

Columns: Name | Rationale | Conflict check | Domains (.com / .app)  
1\. CarbAdapt \[SELECTED, provisional\] | Carb adaptation / gut training in one word. | No sports-nutrition app; Wehrs "Carb Adapt" carburetor part only. | both appear available  
2\. FuelGut | Literal fuel \+ gut training. | No same-named app/TM in sports nutrition found. | both appear available  
3\. EnduFuel | Endurance fueling system. | No app; Tailwind sells "Endurance Fuel" mix (product, not software). | both appear available  
4\. FuelAdapt | Adaptive fueling emphasis. | No sports app; FUELADAPTIVE TM is automotive engines. | both appear available  
5\. AbsorbEnd | Absorption \+ endurance. | No app conflict found. | both appear available  
6\. CarbTide | Rising/falling carb load over a season. | No app conflict; far from CarbRate. | both appear available  
7\. AdaptCarb | Adaptation-first carb mark. | No sports app found. | both appear available  
8\. TolerFuel | Tolerance \+ fuel (GI capacity). | No app/TM found. | both appear available  
9\. FuelTolerance | Explicit tolerance framing. | Descriptive; weaker as TM; no app found. | both appear available  
10\. Absorbix | Compact "absorb" brandable. | No sports app found. | .app appears available; .com registered  
11\. GutForge | Building gut capacity. | "forge" crowded in fitness. | .app appears available; .com registered  
12\. IntakeGo | Intake execution / go. | Generic feel. | .app appears available; .com registered  
13\. CarbFlux | Changing carb flux / transporters. | More sciency. | .app appears available; .com registered  
14\. TrainGut (former working name) | Clear but close to TrainedGut. | High confusion risk with trainedgut.com (2027 launch). | both appear available — REJECTED  
Deprioritized: GutPace (conflicts with gutpace.ai IBS app), GutLoad (.com registered; crude), CarbLine (carbline.com \= ESG/carbon tool), any Trained\* / Fuel the\* variants.

### 11.3 Recommendation

Decision (15 Oct 2026): CarbAdapt selected as the app name (provisional). Backups if the trademark search fails: FuelGut, then FuelAdapt or EnduFuel. The former working name TrainGut is rejected (TrainedGut collision risk). Next steps: (1) formal trademark search for CarbAdapt (USPTO / EUIPO / INPI Argentina, classes 9 and 42; consider 5/29/32 if products ever ship), (2) register carbadapt.com \+ carbadapt.app \+ social handles now (they appeared available on 15 Oct 2026; re-check at purchase), (3) reserve the App Store and Connect IQ store names.