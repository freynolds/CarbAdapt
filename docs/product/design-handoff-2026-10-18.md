# CarbAdapt – Design Handoff: Newly Defined Screens (18 Oct 2026)

*Prepared 18 Oct 2026 from the Design Prompt (Delta), the Design Brief and the User Flows decisions log. Decision numbers (#N) refer to the User Flows log.*

## 1. Intro

**Scope:** this handoff covers only what was undefined and is now defined: new screens B1–B11 and changes to already-designed screens. Match the existing designed screens exactly (same components, cards, chips, tab bar, spacing, iconography). Do not add features, screens or data beyond what is listed. Where something says **TBD** or **[Undecided]**, use a neutral, minimal treatment.

**Brand v1 reminder**

- Colors: **Night Fuel #101A2B**, **Glucose #C6F135**, **Ember #FF6A3D**, **Tarmac #2B3A55**, **Bone #F4F1EA** (light background) / #FFFFFF (light cards).
- Type: **Bricolage Grotesque** (display), **JetBrains Mono** (every number and unit), **DM Sans** (body).
- Every screen in light and dark mode. US English copy ("fueling").
- GI symptom scale: none / mild / moderate / severe.

**iPhone tab bar:** 4 tabs on every tab-level screen: **Home, Calendar, Progress, Profile & Settings** ("Profile" in the tab bar) (#78).

## 2. New screens

### B1. Product Library and label scan

- **Opens from:** the Product Library row in Profile & Settings (right after My Gear, #142). Label scan also opens from the "+" in the carry list (Home and Workout detail).
- **Layout (Product Library list):**
  - List grouped by type: Drink mix, Gel, Solid.
  - Favorites pinned at the top of their group.
  - Row: product name, brand, and per serving carbs (g), sodium (mg), caffeine (mg), numbers in JetBrains Mono.
  - Tapping a row opens Product detail.
- **Components and states:**
  - Scan entry: a "+" in the Product Library nav bar. **[Undecided]** the exact add/scan control; use a simple "+" in the navigation bar.
  - Scan confirmation card: summary of the detected label values, with **Confirm** and **Edit** (Edit only to fix wrong fields).
  - OCR failure: go straight to a manual entry form (same fields, editable). No retry prompt, no database lookup.
  - Product detail: full label data, with **Edit**, **Delete** and **Favorite** (toggle).
  - Delete warning: if the product is used in a planned workout, warn and let the user pick a replacement from the library. No automatic replacement.
- **Decisions:** #70–#77, #142.

### B2. Progress tab (4th tab)

- **Opens from:** the Progress tab in the tab bar.
- **Layout, top to bottom (vertical scroll):**
  - Top: the user's tolerated g/h, shown big (JetBrains Mono).
  - Middle: a summary/streak of workouts with mild-or-less symptoms that met the carb target.
  - Bottom: chart of the last ~12 or more workouts, Y axis = g/h. One point per workout, colored by symptom level (none / mild / moderate / severe; four distinct, accessible colors).
- **Components and states:**
  - Tapping a chart point opens that workout's Workout detail directly (no tooltip).
  - Achievements: the only achievement is a new higher tolerated g/h; each time g/h goes up, that is an achievement. No ladder-step or highest-total-carbs achievements for now.
  - **No** separate Strava-style latest-achievement highlight on Progress; the g/h chart is enough. Nothing is added to the chart beyond the above. No achievement history list.
- **Decisions:** #78, #79 (partly superseded), #81, #82, #143, #144.

### B3. Achievement celebration

- **Opens from:** the end of the post-workout questionnaire, only when an achievement (new higher tolerated g/h) is earned: after any sip-update step, before returning to Home.
- **Layout:** full-screen Strava-style celebration: burst lines, avatar, the big value.
- **Decisions:** #80, #143, #144.

### B4. Sweat test

- **Opens from:** the sweat test To do item on Home (calibration tier; suggested every 3 months with the season change).
- **Layout and flow:**
  1. **Protocol screen** (copy):
     - 60-minute endurance (Z2) workout in your normal training conditions (same time of day, clothing, indoor/outdoor setup).
     - Before: urinate, then weigh nude on a bathroom scale.
     - During: drink as needed and log it; calibrated containers supply the fluid volume automatically. Avoid urinating and solid food if possible.
     - After: towel off sweat, then weigh nude again before drinking or eating anything.
     - Sweat rate (L/h) = pre weight − post weight + fluid consumed − urine (if any).
     - Temperature and humidity are recorded from the weather. The test repeats every 3 months with the season change.
  2. **Pre-weight entry** (JetBrains Mono), then a **Start** button begins the test.
  3. **Post-weight:** a step in the post-workout questionnaire.
  4. **Result screen:** sweat rate (L/h) plus the test's temperature and humidity. No comparison with the previous test.
- **Components and states:**
  - Home dashboard card: special workout type "Sweat test". **Tarmac #2B3A55 background, Glucose #C6F135 border, one clipped (cut) corner, and a "Sweat test" label** (#141). It reads as "must be completed".
  - Measures sweat rate only. No sweat-sodium input.
  - Scheduling: placed on the user's usual recovery-ride day (detected; usually the same weekday), but ridden in Z2, not as a recovery ride. If no recovery day falls in the week the test is due, it moves to another day (#154).
  - If it would fall on a carb-loading day, it is automatically moved to at least one week after the race (#134).
- **Push mockups (verbatim copy):**
  - Night before the test: "Sweat test tomorrow! Weigh in before you start."
  - 1 h before the planned workout start: "Sweat test day! Step on the scale before you start."
  - When the test time is up (deep-links straight to finishing the test): "Time's up. Towel off and weigh in now to get your sweat rate."
  - 2 h after the end of the test, if data is incomplete: "Almost there! Finish your sweat test entry."
  - Quarterly retest (3 months after the last test, sent the night before that week's recovery day): "It's been 3 months. Retest your sweat rate to keep plans accurate."
- **Decisions:** #84–#89, #134, #140, #141, #154, #155.

### B5. Manual workout

- **Opens from:** the Calendar "+" control.
- **Layout:** fields: date, duration, workout type (Base, Threshold, VO2max, Anaerobic, Recovery). No start time, elevation or route.
- **States:**
  - After saving: show the what-to-carry summary and fueling plan, and note that the plan is sent to the Connect IQ device.
  - Stays in CarbAdapt only (not synced to TrainingPeaks or the Garmin calendar).
- **No new screens needed:** Add intake and Last-session feedback reuse the existing post-workout questionnaire.
- **Decisions:** #91, #93–#95, #102.

### B6. Add race and pre-race strategy

- **Opens from:** the "Add your next race" To do item, and the "+" tile in the Mode & plan race carousel (B9).
- **Add race form fields:** race name, date, estimated duration, type, distance, elevation gain, aid stations, and carb loading (**None / 2-day / 1-day**).
- **Multiple stage race:** a "Multiple stage race" checkbox. When checked, show a stage list where each stage has its own fields (date, start time, estimated duration, type, distance, elevation, aid stations). Allow more than one stage per day (morning/afternoon).
- **Aid station row:** km mark and what it offers (water, isotonic drink, gels).
- **Pre-race strategy screen** (opens from a Home To do item):
  - Offered when the race's needs don't fit, or aren't practical to fit, in the user's containers.
  - The user enters where the refill points are; the system generates plan options; the user picks one (never automatic).
  - More than one plan: horizontal carousel of cards. Each card shows the strategy and where to refill on top, and the carry list below. A single plan has no carousel.
- **Decisions:** #96–#101, #125, #135, #136.

### B7. Physical data

- **Opens from:** the Profile row and Home "Complete your profile".
- **Fields:** weight, FTP, sweat rate, g/h tolerance, max HR and HR zones, age, sex, height. Values in JetBrains Mono.
- **States:**
  - All fields are editable; FTP, weight and zones also sync from connections.
  - Conflict: when a manual value differs from a synced one, a Home To do item asks the user which to keep (no automatic winner).
- **Decisions:** #103–#105.

### B8. Connections

- **Opens from:** the Profile row and Home "Connect your calendar".
- **Layout:** Garmin, TrainingPeaks and Strava, each with its status and a **Connect / Disconnect** button.
- No last-sync time, no sync button, no per-connection data details.
- **Decisions:** #106.

### B9. Mode & plan

- **Opens from:** the Profile "Mode & plan" row.
- **Layout, top to bottom:** mode toggle, target (race carousel or date), g/h goal, ladder.
- **Components and states:**
  - Mode toggle: **Gut training** OR **Fuel my workouts** (only one at a time). Fuel my workouts shows only the toggle.
  - Target picker (Gut training): a race already added, or a date. Races in a horizontal carousel of tiles (name + date), with a "+" tile at the end that opens Add race (B6).
  - g/h goal: default is an achievable value for the timeframe. Max 200 g/h; warning above 120 g/h.
  - **Too-fast warning state:** when the goal is too fast for the timeframe (e.g. 60 → 120 g/h in 2 weeks), warn and suggest an alternative (later date or lower goal), with a way to keep the entered goal (saving is still allowed).
  - Ladder (last): ladder steps with approximate dates, assuming no bad symptoms. The ladder reaches the target 4 long rides before the race.
  - Starting-point input ("Estimate my g/h"), when no tolerated g/h is known: recent workouts pulled from the platform (duration etc.); for each, the user picks what they consumed from their Product Library and g/h updates live. The start is the highest g/h with no or mild symptoms. If the user doesn't know, the start is min(60 g/h, 1 g/kg).
  - Entry points for the starting-point input: a Home To do item, and an "Estimate my g/h" button when choosing Gut training without a known g/h.
- **Decisions:** #107–#123.

### B10. Carb loading

- **Opens from:** loading-day calendar entries and the loading-day pushes. The protocol is chosen in Add race (None / 2-day / 1-day).
- **Calendar:** loading days (D-2 and/or D-1, depending on the choice) appear as calendar entries with a style distinct from workouts and races.
- **Loading-day screen:**
  - The day's carb target in grams (g/kg × user weight), split by meal (breakfast, lunch, snacks, dinner) with portions and example meals. Use "example foods TBD" as placeholder text.
  - Low-fiber / low-fat guidance, early moderate dinner on D-1, and the race-morning breakfast (~2 g/kg, 2–3 h before).
  - Early starts: suggest preparing breakfast the night before, waking 2–3 h before to eat and going back to sleep. Fallback: a smaller breakfast closer to the start.
  - Example foods list: low-FODMAP options shown first, high-FODMAP staples (pasta, bread, honey) still included, each marked high/low FODMAP, with a short note explaining FODMAP. No separate low-FODMAP mode.
  - No note about loading adding less benefit when fueling well during the race.
- **Race-breakfast screen:** includes pre-race fluid and sodium, expressed as how much of the user's isotonic drink to have, with any remainder as water.
- **Loading rehearsal:** about one week before the race, on the day before a long ride. Shown as a Home To do item, a calendar entry and a push on the rehearsal day, with a **Dismiss** option (dismissing stops all three).
- **Push mockups (verbatim copy):**
  - D-2: "Race in 2 days: Fuel up day! See your meal plan!"
  - D-1: "Race tomorrow: last loading day. See your meal plan!"
  - Night before the race: "Race tomorrow: prep breakfast and set your alarm."
  - Rehearsal day: "Long ride tomorrow: practice your race loading today."
- **Decisions:** #118, #124–#133, #137–#140.

### B11. Between-stage recovery (multi-stage races)

- **Opens from:** the stage push (below), for multi-stage races entered in B6.
- **Detail level:** same as carb loading (B10): grams per meal and portion, with example meals.
- **Screen content by gap** (stage finish to next stage start):
  - **Under 4 h:** carbs 1–1.2 g/kg/h in intakes every 15–30 min, from arrival until 30–45 min before the next start; protein 0.3 g/kg in the first intake; prefer liquids and low-fat, low-fiber foods.
  - **Under 1.5 h:** liquids and gels only (isotonic drink, chocolate milk, gel).
  - **4–12 h:** carbs 1–1.2 g/kg/h for the first 4 h, then normal meals, plus a pre-start meal of 1–2 g/kg 2–3 h before the start; protein 0.3 g/kg at 0–1 h and in the meal, at least 3 h before the start.
  - **Overnight:** off-bike carbs by stage duration: under 2.5 h: 5–6 g/kg; 2.5–4 h: 6–8 g/kg; 4 h or more: 7–9 g/kg (default at the low end).
  - **Rest days within the race:** overnight plan at the lowest band.
- **Adjustments and states:**
  - Carbs eaten during the stage are NOT subtracted from the recovery target.
  - Low in-stage intake (under 75% of the g/h target): +1 g/kg to the off-bike carb target.
  - Trail running: never the lowest overnight band (stages under 2.5 h use at least 6–8 g/kg).
  - Protein: 0.3 g/kg per serving, 1.6–2.1 g/kg/day, no pre-sleep serving.
  - **Sensitive stomach mode:** 0.8 g/kg/h carbs + 0.3–0.4 g/kg/h protein.
  - Fruit: 2–3 servings/day, tart cherry optional, with a warning about high-dose vitamin C/E supplements.
  - Caffeine and alcohol warnings.
  - Hydration: deficit = sweat rate × stage duration − fluid drunk (no weighing); always replace 125–150% of the deficit, no threshold. The deficit is not carried over to the next stage.
  - Sodium: 50–80 mmol/L of recovery fluid (≈1150–1840 mg/L), covered by the user's isotonic drink, with the remainder from broth or salty food.
  - Reduced fiber/FODMAP guidance applies for the whole race.
- **Push mockup (verbatim copy):** one push per stage when the stage activity arrives via the platform; if it hasn't arrived by stage start time + estimated stage duration × 1.5, it is sent anyway: "Stage complete. Refuel and rehydrate for the next one."
- **Decisions:** #145–#153, #156–#159.

## 3. Changes to already-designed screens (A)

1. **Tab bar:** 4 tabs on every tab-level screen: Home, Calendar, Progress, Profile ("Profile & Settings"). Replaces the earlier 3-tab bar (#78).
2. **Home (both modes):** add the Sweat test workout card: Tarmac #2B3A55 background, Glucose #C6F135 border, one clipped (cut) corner, and a "Sweat test" label (#141).
3. **Home To do:**
   - Remove the "bottle loads" item (mix concentration is fixed) (#90).
   - Add four To do items: "Pre-race strategy" (B6), "Data conflict" (B7: a manual value differs from a synced one), "Estimate my g/h" (B9), and "Loading rehearsal" (B10).
   - The sweat test item (B4) stays in the calibration tier.
4. **Carry list (Home and Workout detail):** add a "+" button that opens the label scan (B1) (#70).
5. **Post-workout questionnaire:** add a post-weight step when the workout is a sweat test (B4). After any sip-update step, show the achievement celebration (B3), then return to Home (#80, #87).
6. **Profile & Settings:** add a Product Library row (opens B1), right after My Gear. Section order: Mode & plan, Subscription, Physical data, My Gear, Product Library, Connections (#142).
7. **Mode selection (onboarding):** full screen with two large cards, each about half the screen. Gut training on top, "Fuel my workouts" below. Each card explains what that mode does. Tapping Gut training asks for the timeframe (e.g. target date); Fuel my workouts needs no extra input (#64).
8. **Workout types everywhere** (Calendar badges, Unstructured setup, Workout detail, Manual workout): Base, Threshold, VO2max, Anaerobic, Recovery. Add a distinct chip color for Anaerobic (#95).
9. **Progress:** only g/h achievements (new higher tolerated g/h) and no separate latest-achievement highlight (#143–#144). See B2.

## 4. Push notifications

| Push | Trigger | Timing | Copy |
|---|---|---|---|
| Sweat test, night before | Sweat test scheduled | Night before the test | "Sweat test tomorrow! Weigh in before you start." |
| Sweat test day | Sweat test scheduled | 1 h before the planned workout start | "Sweat test day! Step on the scale before you start." |
| Sweat test end | Test duration ends (deep-links to finishing the test) | When the test time is up | "Time's up. Towel off and weigh in now to get your sweat rate." |
| Sweat test incomplete | Test data not yet entered | 2 h after the end of the test | "Almost there! Finish your sweat test entry." |
| Quarterly retest | 3 months since the last test | Night before that week's recovery day | "It's been 3 months. Retest your sweat rate to keep plans accurate." |
| Carb loading D-2 | 2-day loading chosen for a race | On the D-2 loading day (time of day not specified) | "Race in 2 days: Fuel up day! See your meal plan!" |
| Carb loading D-1 | 2-day or 1-day loading chosen | On the D-1 loading day (time of day not specified) | "Race tomorrow: last loading day. See your meal plan!" |
| Race breakfast | Race scheduled | Night before the race | "Race tomorrow: prep breakfast and set your alarm." |
| Loading rehearsal | Rehearsal suggested (not dismissed) | On the rehearsal day (day before a long ride, ~1 week before the race) | "Long ride tomorrow: practice your race loading today." |
| Stage complete | Stage activity arrives via the platform API/webhook | On arrival; fallback at stage start + estimated duration × 1.5; one per stage | "Stage complete. Refuel and rehydrate for the next one." |

*Already-designed pushes, for reference:* the daily briefing push (opens Workout detail; example copy title "Endurance 2:30", body "150 g carbs · 1.8 L · 900 mg Na — 2 bottles + 3 gels"; user-configurable time, evening before or same day; none on no-workout days) (#66–#69). The workout-complete push opens the post-workout questionnaire (#57).

## 5. Still placeholder, TBD or out of scope

- **Subscription** (from Profile): post-MVP. Design as a placeholder: black screen (#000000), iOS nav bar, back button, title only. The MVP has no paywall (#65). **[Undecided]** how free vs paid tiers are presented in the Profile row; show a single neutral row (e.g. "Plan · Beta — all features").
- **Carb loading example foods:** "example foods TBD" placeholder text on the loading-day screen.
- **Carb-loading push time of day:** the docs say a push is sent on each loading day but don't specify the time.
- **Product Library add/scan control:** **[Undecided]**; use a simple "+" in the navigation bar.
- Still **[Undecided]** in already-designed screens (unchanged by this handoff):
  - Gut-training ladder orientation and animation.
  - Workout detail block table exact layout.
  - Target adjustment control and placement (simple stepper suggested).
  - Sip calibration optional 4-sip round and completion screen.
