# @carbadapt/web

Next.js App Router UI. It renders screens and calls `apps/api`. It does not own product rules or the database.

`/` replaces itself with `/home`. Screens read the mock API with the bearer token from `POST /dev/login-as`. Browser calls go to `/backend`, which Next rewrites to the API (`API_URL`, default `http://127.0.0.1:4000`). A dev bar above the column switches the demo athlete, locale, and theme. Forms that would write are local preview state and say so. The desktop layout is a centered 390px column, which is an assumption called out in that bar.

## Layout

| Path          | Role                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `app/`        | Routes listed below. Dynamic params are awaited (`Promise` in Next 16).                                                        |
| `components/` | `app-state.tsx` holds the session. `components/screens/` holds one client screen per route group.                              |
| `lib/`        | `api.ts` fetches and maps `HttpErrorCode` through `HTTP_ERROR_MESSAGE`. `parse.ts` checks responses with the contract schemas. |
| `app/fonts/`  | Self-hosted woff2 files. Latin subsets are loaded with `next/font/local`. `OFL.txt` is the license.                            |

`next.config.ts` stays UI-only. Do not add route handlers that stand in for `apps/api`. `next dev` uses webpack so the `.js` import suffixes inside `packages/contracts` and `packages/i18n` resolve to the TypeScript sources. Turbopack does not apply that alias.

Next writes `next-env.d.ts` on `next dev` and on `next typegen`. That file is gitignored. In Next 16 the two commands point it at different generated type paths, so committing it would leave a permanent diff. `npm run typecheck` runs `next typegen` before `tsc`.

## What must NOT go here

- Fueling math, ladder rules, or sweat-rate formulas (`packages/engine`).
- Prisma calls (`packages/db` is reached through the API).
- Provider tokens, OAuth, or webhook handling.
- The design-tool runtime packed inside `design/carbadapt-screens.html` (see below).
- A second copy table. Visible strings go through `@carbadapt/i18n`. API error sentences stay `HTTP_ERROR_MESSAGE`.

## Routes

| Path                                                                                       | Screen                                                                                        |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `/`                                                                                        | Redirects to `/home`                                                                          |
| `/onboarding/[step]`                                                                       | `welcome`, `sport`, `weight`, `effort`, `carbs`, `fuel`, `sweat`, `gut`, `briefing`, `device` |
| `/onboarding/mode`                                                                         | Gut training on top, fuel my workouts below                                                   |
| `/signup`, `/login`, `/auth/magic`, `/auth/callback/[provider]`                            | Demo sign-in. Providers are not connected.                                                    |
| `/report`                                                                                  | Starting point from the onboarding answers kept in `sessionStorage`                           |
| `/home`, `/calendar`, `/calendar/new`                                                      | Today, calendar, manual workout preview                                                       |
| `/workouts/[id]`, `/workouts/[id]/questionnaire`, `/celebration/[achievementId]`           | Plan, questionnaire preview, celebration                                                      |
| `/progress`, `/profile`, `/profile/account`                                                | Progress, profile, account                                                                    |
| `/profile/mode-plan`, `/profile/mode-plan/estimate`                                        | Mode and plan, g/h estimate preview                                                           |
| `/profile/physical-data`                                                                   | Physical data and conflict picker preview                                                     |
| `/profile/gear`, `/profile/gear/new`, `/profile/gear/[id]`, `/profile/gear/[id]/calibrate` | Gear and calibration preview                                                                  |
| `/profile/products`, `/profile/products/new`, `/profile/products/[id]`                     | Library, label-scan preview, detail                                                           |
| `/profile/connections`, `/profile/subscription`                                            | Connections preview, black subscription placeholder                                           |
| `/sweat-test/[id]`                                                                         | Protocol, weight, push copy, result                                                           |
| `/races/new`, `/races/[id]/edit`, `/races/[id]/strategy`                                   | Race form and strategy                                                                        |
| `/races/[id]/loading/[day]`                                                                | `d-2`, `d-1`, or `rehearsal`                                                                  |
| `/races/[id]/breakfast`                                                                    | Breakfast derived by the API                                                                  |
| `/races/[id]/stages/[stageId]/recovery`                                                    | Between-stage recovery                                                                        |

## Milestone

| When      | What lands                                                              |
| --------- | ----------------------------------------------------------------------- |
| This step | Every route above, EN/ES/PT, light/dark, filled by the mock API on read |

Login, Connections, and Subscription stay visual until their real behavior is scheduled (M3/M4, and post-MVP for payments).

## How the HTML design becomes Next screens

Source file: `design/carbadapt-screens.html` (about 6 MB). Do not rebuild the UI from scratch, and do not convert it in the scaffold step. The notes below are from unpacking that file.

### What the file actually is

It is a design-tool bundle, not a site we can drop into `app/`.

1. The root document is a gallery. A script on `DOMContentLoaded` reads three JSON islands: `__bundler/manifest`, `__bundler/page_order`, and `__bundler/template`.
2. The manifest is gzip-compressed base64. It holds **17 HTML documents**, one per gallery board. The template is a column of `<iframe>`s titled like `1 · Onboarding: welcome and questionnaire`.
3. Each of those documents is itself a bundle. Its template contains the screen markup, `@font-face` rules, a stylesheet, and one `<x-dc>` element. Its manifest holds **11 woff2 files** and three scripts: a generated `dc-runtime`, plus React 18.3.1 and ReactDOM from a CDN, saved as base64.
4. The runtime's job is to preview `<x-dc>`. The page script is an empty `DCLogic` class whose `renderVals()` returns `{}`. There is no data binding to keep.
5. The font bytes are identical across boards (same 11 sha256 hashes on the onboarding board and the post-onboarding board). The duplication is the packager embedding them in every page.

Leave `dc-runtime` and the packed React 18 in the HTML file. The Next app uses its own React. Do not add a dependency on the design-tool runtime.

### Boards

132 phone frames, 25 of them with the light-mode class `lt`. Frame size is 390×844 with a 44px radius. That chrome is the artboard, not the app shell.

| #   | Gallery label                                                     | Phones | Light frames | Styles                                      |
| --- | ----------------------------------------------------------------- | ------ | ------------ | ------------------------------------------- |
| 1   | Onboarding: welcome and questionnaire                             | 11     | 0            | Hard-coded hex, classes `.k` `.o` `.b` `.n` |
| 2   | Onboarding: mode, account, notifications, device, report          | 6      | 0            | Same onboarding stylesheet                  |
| 3   | Add and edit gear                                                 | 4      | 0            | Token classes (`.ey` `.cd` `.bt` …)         |
| 4   | Gear overview (earlier draft)                                     | 8      | 0            | Onboarding stylesheet again                 |
| 5   | Calibration: bottle                                               | 8      | 0            | Tokens                                      |
| 6   | Calibration: soft flask                                           | 9      | 0            | Tokens                                      |
| 7   | Calibration: bladder                                              | 8      | 0            | Tokens                                      |
| 8   | App: Home, Calendar, Workout detail, My Gear                      | 7      | 1            | Tokens                                      |
| 9   | App: variants (no workout, gut-training calendar, workout states) | 8      | 3            | Tokens                                      |
| 10  | B1 Product Library and label scan                                 | 11     | 5            | Tokens                                      |
| 11  | B2 Progress and chart-point detail                                | 3      | 1            | Tokens                                      |
| 12  | B4 Sweat test                                                     | 10     | 5            | Tokens                                      |
| 13  | B5 Manual workout, B6 Race, stages and strategy                   | 16     | 7            | Tokens                                      |
| 14  | B7 Physical data, B8 Connections                                  | 6      | 3            | Tokens                                      |
| 15  | Mode & plan                                                       | 3      | 0            | Tokens, drawn dark only                     |
| 16  | Post-workout, B3 celebration, Profile, Account, color picker      | 13     | 0            | Tokens, drawn dark only                     |
| 17  | Placeholder (Subscription)                                        | 1      | 0            | Single dark frame, "Subscription"           |

Board 4 is labeled **earlier draft** in the gallery. It repeats gear and calibration that boards 3 and 5–7 draw again in the token stylesheet. Treat board 4 as non-canonical unless Francisco says otherwise.

Onboarding (boards 1–2) never used the CSS variables. Its palette is the same family, plus note surfaces `#182640` and `#C9D2E0`. Those frames now use the token variables (`--note`, `--note-tx`). Board 4 stays ignored.

### How the screens were taken from the file

1. **Unpack offline.** A Node script parses the root manifest, gunzips each page, and writes one HTML file per board under something like `design/boards/` (generated, not hand-edited). Re-run it when the HTML export is replaced. The script is a dev tool, not a runtime dependency.
2. **Split phones.** Each `<div class="p">` (or `class="p lt"`) is one screen state. Map it to a route from the build plan using the gallery title and the kicker text inside the frame (for example `QUESTION 1 OF 7`, `TODAY · FUELING`). The gallery order is not the URL map.
3. **Turn a phone into a server component** under `components/screens/`, rendered by the matching `app/` route. Drop the gallery chrome: the dark board background `#0A1220`, the fixed 390×844 box, and the 44px radius. Those exist so the frames can sit side by side in the review file.
4. **Desktop.** The screens use a centered column about 390px wide, because every frame is an iPhone layout and no desktop layout was designed. The column fills the mobile viewport (`100dvh`) rather than a rounded artboard. That choice is an assumption and is labeled in the dev bar.
5. **CSS.** Lift the token stylesheet once, from a board that defines both `.p` and `.lt` (board 8 does). Put component classes in a CSS module or a single app stylesheet. Do not paste a copy of the style block into every component.
6. **Tokens.** Move colors, type, and radii into `packages/design-tokens`, then have this app consume CSS variables. Variable names already used on `.p`, with `.lt` overriding them:

   | Name   | Dark (`.p`) | Light (`.lt`) | Role            |
   | ------ | ----------- | ------------- | --------------- |
   | `--bg` | `#101A2B`   | `#F4F1EA`     | Page background |
   | `--cd` | `#2B3A55`   | `#FFFFFF`     | Card            |
   | `--tx` | `#F4F1EA`   | `#101A2B`     | Text            |
   | `--mu` | `#A3B0C4`   | `#5B6880`     | Muted text      |
   | `--ac` | `#C6F135`   | `#101A2B`     | Accent          |
   | `--ib` | `#F4F1EA`   | `#E7E2D6`     | Icon tile       |
   | `--ln` | `#3C4D6C`   | `#E1DCCF`     | Hairline        |

   Several colors are raw hex, not variables. They still belong in the token package: the glucose button `#C6F135` with ink label `#101A2B` (it stays glucose in light mode, while `--ac` flips to ink), the alert dot `#FF6A3D`, and the workout chips base `#4DA3FF`, threshold `#FFC845`, VO2 `#D96CFF`, recovery `#3DDC97`, anaerobic `#FF8FB1`. Theme follows the user's setting (system / light / dark), not only the `.lt` class.

7. **Fonts.** Deduplicate the 11 woff2 files by hash into `apps/web` (or `packages/design-tokens`) and load them with `next/font/local`. Families and weights in the file:
   - Bricolage Grotesque 500 and 800 (display). Subsets: latin, latin-ext, vietnamese. The 500 and 800 faces share files.
   - DM Sans 400, 500, 700 (UI). Subsets: latin, latin-ext.
   - JetBrains Mono 500 and 700 (figures and kickers). Subsets: latin, latin-ext, vietnamese, greek, cyrillic, cyrillic-ext.
     The comment at the top of the HTML is the SIL Open Font License for all three families (Bricolage Grotesque, DM Sans, JetBrains Mono). Keep that comment, or the OFL text, next to any extracted font files. The same comment warns that Google Fonts subsets can be incomplete. Latin-ext covers Spanish and Portuguese accents; if a glyph is missing when catalogs are filled, replace that family with the full OFL font.
8. **Icons.** Tab and gear icons are inline `<symbol>` sprites, copied into each board (`ih`, `ic`, `ip`, `ipg`, `sb`, `sf`, `sl`, `sg`, `sp`, `sc`, `sd`). Hoist them once into `components/icons`. The design tool rewrote `viewBox` to `sc-camel-view-box` so its parser would keep the attribute. Rename it back to `viewBox`, and use React's camelCase SVG props (`strokeWidth`, `strokeLinecap`).
9. **Copy.** Visible strings are the English source for `packages/i18n`. Do not translate them during extraction. British spellings in this HTML (`fuelling`, `litre`, `Diarrhoea`, and the same kind of variant) are normalized to US English (`fueling`, `liter`, `diarrhea`) during extraction. That is the copy convention in the root README and `packages/i18n/README.md`.
10. **Behavior.** Reads come from the mock API. Writes, OAuth, OCR, notifications, and the fueling engine are not implemented. Do not execute `dc-runtime`.
