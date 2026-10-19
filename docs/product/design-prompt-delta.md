# CarbAdapt — Design Prompt (Delta): Add Only What's Missing (iPhone)

You already designed part of the CarbAdapt iPhone app (file: "CarbAdapt - Screen Designs (2026-10-17).html"). Now add **only** what is listed below. Do not redesign or restyle existing screens beyond the listed changes. Do not add features, screens or data not described here. Where something is marked [Undecided] or TBD, use a neutral, minimal treatment and do not invent a solution.

## Style
- Match the existing designed screens exactly: same components, cards, chips, tab bar, spacing and iconography.
- Brand v1 colors: Night Fuel #101A2B, Glucose #C6F135, Ember #FF6A3D, Tarmac #2B3A55, Bone #F4F1EA / #FFFFFF.
- Type: Bricolage Grotesque (display), JetBrains Mono (every number and unit), DM Sans (body).
- Every screen in light and dark mode. US English copy ("fueling").
- GI symptom scale: none / mild / moderate / severe.

## A. Changes to existing designed screens
1. **Tab bar:** 4 tabs on every tab-level screen: Home, Calendar, Progress, Profile ("Profile & Settings").
2. **Home (both modes):** add a Sweat test workout card in a distinct color and shape so it reads as "must be completed". Card style: Tarmac #2B3A55 background, Glucose #C6F135 border, one clipped (cut) corner, and a "Sweat test" label.
3. **Home To do:** remove the "bottle loads" item (mix concentration is fixed, so there's nothing to adjust). Add four To do items: "Pre-race strategy" (B6), "Data conflict" (B7: a manual value differs from a synced one), "Estimate my g/h" (B9), and "Loading rehearsal" (B10).
4. **Carry list (Home and Workout detail):** add a "+" button that opens the label scan (B1).
5. **Post-workout questionnaire:** add a post-weight step when the workout is a sweat test (B4). After any sip-update step, show the achievement celebration (B3), then return to Home.
6. **Profile:** add a Product Library row (opens B1), right after Gear. Section order: Mode & plan, Subscription, Physical data, Gear, Product Library, Connections.
7. **Mode selection (onboarding):** full screen with two large cards, each about half the screen. Gut training on top, "Fuel my workouts" below. Each card explains what that mode does. Tapping Gut training asks for the timeframe (e.g. target date). Fuel my workouts needs no extra input.
8. **Workout types everywhere** (Calendar badges, Unstructured setup, Workout detail, Manual workout): Base, Threshold, VO2max, Anaerobic, Recovery. Add a distinct chip color for Anaerobic.

## B. New screens to design
1. **Product Library and label scan**
   - Product Library (from Profile): list grouped by type (Drink mix, Gel, Solid). Favorites pinned at the top of their group. Row: name, brand, and per serving carbs (g), sodium (mg), caffeine (mg).
   - Scan entry: a "+" in the Product Library nav bar and the carry-list "+" (A4).
   - Scan confirmation card: summary of the detected label values, with Confirm and Edit (Edit only to fix wrong fields).
   - OCR failure: go straight to a manual entry form (same fields). No retry prompt, no database lookup.
   - Product detail: full label data, with Edit, Delete and Favorite (toggle).
   - Delete warning: if the product is used in a planned workout, warn and let the user pick a replacement from the library. No automatic replacement.
2. **Progress tab** (vertical scroll)
   - Top: tolerated g/h, big.
   - Achievement type (#143): only a new higher tolerated g/h; each time g/h goes up, that is an achievement. No ladder-step or highest-total-carbs achievements for now.
   - Middle: streak/summary of workouts with mild-or-less symptoms that met the carb target.
   - Bottom: chart of the last ~12+ workouts, Y = g/h. One point per workout, colored by symptom level (4 accessible colors). Tapping a point opens that Workout detail directly (no tooltip).
3. **Achievement celebration:** a full-screen Strava-style celebration (burst lines, avatar, big value) at the end of the post-workout questionnaire, only when an achievement is earned.
4. **Sweat test** (measures sweat rate only)
   - Entry: the Home To do item (suggested every 3 months with the season change).
   - Protocol screen. Use realistic conditions the user actually trains in, not idealized ones:
     1. 60-min endurance (Z2) in your normal conditions (same time of day, clothing, indoor/outdoor setup).
     2. Before: urinate, then weigh nude on a bathroom scale.
     3. During: drink as needed and log it (calibrated containers supply the volume). Avoid urinating and solid food if possible.
     4. After: towel off, weigh nude before drinking or eating.
     5. Sweat rate (L/h) = pre − post + fluid consumed − urine (if any).
     6. Temperature and humidity come from the weather. Repeat every 3 months.
   - Home dashboard card: Tarmac #2B3A55 background, Glucose #C6F135 border, one clipped (cut) corner, and a "Sweat test" label.
   - Pre-weight entry, then a Start button.
   - Push mockups:
     - End-of-test push that deep-links to finishing the test: "Time's up. Towel off and weigh in now to get your sweat rate."
     - Test-day weigh-in reminder: "Sweat test day! Step on the scale before you start."
     - Incomplete-data reminder: "Almost there! Finish your sweat test entry."
     - Quarterly repeat-due notice: "It's been 3 months. Retest your sweat rate to keep plans accurate."
     - Night-before push (new): "Sweat test tomorrow! Weigh in before you start."
     - Timing: night before the test (night-before push); 1 h before the planned workout start (test-day reminder); when the test time is up (end of test); 2 h after the end of the test (incomplete data); 3 months after the last test, sent the night before that week's recovery day (quarterly retest).
   - Post-weight: a step in the post-workout questionnaire (A5).
   - Result screen: sweat rate (L/h), plus the test's temperature and humidity. No comparison with the previous test.
   - If it falls on a carb-loading day, it is automatically moved to at least one week after the race.
   - Scheduling: the app detects the user's usual recovery-ride day (usually the same weekday) and schedules the test on that day, but the test is ridden in Z2, not as a recovery ride, keeping it off heavy interval days. If no recovery day falls in the week the test is due, it is moved to another day. The carb-loading rule above still applies.
5. **Manual workout** (from Calendar "+")
   - Fields: date, duration, workout type (5 types). No start time, elevation or route.
   - After saving: show the what-to-carry summary and fueling plan, and note that the plan is sent to the Connect IQ device.
   - Stays in CarbAdapt only (not synced to TrainingPeaks or the Garmin calendar).
   - Add intake and Last-session feedback reuse the existing post-workout questionnaire. They need no new screen.
6. **Add race and pre-race strategy**
   - Add race (from the "Add your next race" To do item). Fields: race name, date, estimated duration, type, distance, elevation gain, aid stations, and carb loading (None / 2-day / 1-day). Multiple stage race checkbox; when checked, a stage list where each stage has its own fields and aid stations; allow more than one stage per day (morning/afternoon). For each aid station: km mark and what it offers (water, isotonic drink, gels).
   - Pre-race strategy screen (from a To do item). It is offered when the race's needs don't fit, or aren't practical to fit, in the user's containers. The user enters where the refill points are, the system generates plan options, and the user picks one (never automatic).
   - More than one plan: a horizontal carousel of cards. Each card shows the strategy and where to refill on top, and the carry list below. A single plan has no carousel.
7. **Physical data** (from Profile and "Complete your profile")
   - Fields: weight, FTP, sweat rate, g/h tolerance, max HR and HR zones, age, sex, height.
   - All fields are editable. FTP, weight and zones also sync from connections.
   - When a manual value differs from a synced one, a To do item asks the user which to keep (no automatic winner).
8. **Connections:** Garmin, TrainingPeaks and Strava, each with its status and a Connect / Disconnect button. No last-sync time, sync button or data details.

9. **Mode & plan** (from Profile)
   - One screen. Mode toggle at the top: Gut training OR Fuel my workouts (only one at a time).
   - When Gut training is selected:
     - Target picker: a race already added, or a date. Races in a horizontal carousel of tiles (name + date), with a "+" tile at the end that opens Add race (B6).
     - g/h goal below the target. Too-fast goals (e.g. 60 → 120 g/h in 2 weeks) are flagged as too fast / not achievable. Default is a science-based achievable value for the timeframe. Max 200 g/h; warning above 120 g/h that no science validates benefits of higher intake. When too fast: warn and suggest an alternative (later date or lower goal), but still allow saving the entered goal. Design the too-fast warning state showing the suggestion and a way to keep the entered goal. Ramp rule: +10 g/h after 2 symptom-free sessions; above 90 g/h at most one step per week. Only sessions longer than 2 hours (cycling) or 60 minutes (running/trail) count toward progression. The default goal is the best-case value reachable by the target date.
     - Ladder last: ladder steps with approximate dates, assuming no bad symptoms.
     - The ladder reaches the target goal 4 long rides before the race; the last 4 long rides are at target.
     - Progression speed depends on weekly long-ride volume (fewer than 2 long rides per week is slower).
     - If no tolerated g/h is known, ask for approximate intake from recent workouts to set the starting point; if the user doesn't know, start at min(60 g/h, 1 g/kg). Show recent workouts pulled from the platform (duration etc.); for each, the user picks what they consumed from their Product Library and g/h updates live; the start is the highest g/h with no or mild symptoms. Design this input (entry points: a Home To do item, and an "Estimate my g/h" button when choosing Gut training without a known g/h).
   - Fuel my workouts shows only the toggle.
   - Screen order top to bottom: mode toggle, target (race carousel or date), g/h goal, ladder.

10. **Carb loading**
   - Calendar: loading days (D-2 and/or D-1 depending on the choice) appear as calendar entries with a distinct style from workouts and races.
   - Push mockup on each loading day: D-2: "Race in 2 days: Fuel up day! See your meal plan!"; D-1: "Race tomorrow: last loading day. See your meal plan!"
   - Push mockup: Night before the race: prepare your race breakfast: "Race tomorrow: prep breakfast and set your alarm."
   - Loading-day screen: the day's carb target in grams (g/kg × user weight) split by meal (breakfast, lunch, snacks, dinner) with portions and example meals (use "example foods TBD" as placeholder text), plus low-fiber / low-fat guidance, early moderate dinner on D-1, and the race-morning breakfast (~2 g/kg, 2–3 h before). For early starts: suggest preparing breakfast the night before, waking 2-3 h before to eat and going back to sleep; fallback: smaller breakfast closer to the start. Example foods list prioritizes low-FODMAP options (shown first) but still includes high-FODMAP staples (pasta, bread, honey), each marked high/low FODMAP, with a short note explaining FODMAP and suggesting more of the low ones.
   - Loading rehearsal: suggested about one week before the race, on the day before a long ride (shown as a Home To do item, a calendar entry, and a push on the rehearsal day, with a Dismiss option). Rehearsal push: "Long ride tomorrow: practice your race loading today."
   - Race-breakfast screen includes pre-race fluid and sodium, expressed as how much of the user's isotonic drink to have (and water).
11. **Between-stage recovery** (multi-stage races, B6)
   - Carbs eaten during a stage are NOT subtracted from the recovery target.
   - Gap cases (stage finish to next stage start): under 4 h, 4–12 h, overnight.
     - Under 4 h: carbs 1–1.2 g/kg/h, in intakes every 15–30 min, from arrival until 30–45 min before the next start; protein 0.3 g/kg in the first intake; prefer liquids and low-fat, low-fiber foods.
     - 4–12 h: carbs 1–1.2 g/kg/h for the first 4 h, then normal meals, plus a pre-start meal of 1–2 g/kg 2–3 h before the start; protein 0.3 g/kg at 0–1 h and in the meal, at least 3 h before the start.
     - Gap under 1.5 h: liquids and gels only (isotonic drink, chocolate milk, gel).
     - Overnight: off-bike carbs by stage duration: under 2.5 h: 5–6 g/kg; 2.5–4 h: 6–8 g/kg; 4 h or more: 7–9 g/kg; default at the low end.
   - Rest days within the race use the overnight plan at the lowest band.
   - Low in-stage intake: if the user ate less than 75% of their g/h target during the stage, add +1 g/kg to the off-bike carb target.
   - Trail running: never use the lowest overnight band (stages under 2.5 h use at least 6–8 g/kg).
   - Protein: 0.3 g/kg per serving, 1.6–2.1 g/kg/day, no pre-sleep serving. Sensitive stomach mode: 0.8 g/kg/h carbs + 0.3–0.4 g/kg/h protein.
   - Fruit: 2–3 servings/day, tart cherry optional, with a warning about high-dose vitamin C/E supplements. Caffeine and alcohol warnings.
   - Hydration: deficit = sweat rate × stage duration − fluid drunk (no weighing); always replace 125–150% of the deficit, no threshold. The deficit is not carried over: whatever isn't replaced before the next stage is not added to the next stage's plan.
   - Sodium: target 50–80 mmol/L of recovery fluid (≈1150–1840 mg/L), covered by the user's isotonic drink, with the remainder from broth or salty food.
   - Reduced fiber/FODMAP guidance applies for the whole race.
   - Push mockup: one push per stage when the stage activity arrives via the platform; if it hasn't arrived by stage start time + estimated stage duration × 1.5 (the +50% applies to the estimated duration; clarified by Francisco, 18 Oct 2026), it is sent anyway: "Stage complete. Refuel and rehydrate for the next one."
   - Recovery screen detail: same as carb loading (B10): grams per meal and portion, with example meals.

## C. Keep as placeholders
Use a black screen (#000000) with an iOS nav bar, a back button, and the title only:
- Subscription (from Profile; post-MVP)
