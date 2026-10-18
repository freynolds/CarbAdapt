# @carbadapt/web

Next.js App Router UI. It renders screens and calls `apps/api`. It does not own product rules or the database.

This step shows a placeholder at `/` so the process can be started. It is not a CarbAdapt screen.

## Layout

| Path          | Role                                                                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`        | Routes. Only `/` exists. The route table in the build plan (`/home`, `/calendar`, `/workouts/[id]`, …) is added with the screens, not before. |
| `components/` | React components. `scaffold-home.tsx` is the placeholder. Extracted phones go in `components/screens/`.                                       |
| `lib/`        | The API client and other non-visual helpers. `lib/api.ts` exports the API base URL and does not fetch.                                        |
| `public/`     | Static files that are not imported, including self-hosted fonts once they are extracted.                                                      |

`next.config.ts` stays UI-only. Do not add route handlers that stand in for `apps/api`.

Next writes `next-env.d.ts` on `next dev` and on `next typegen`. That file is gitignored. In Next 16 the two commands point it at different generated type paths, so committing it would leave a permanent diff. `pnpm typecheck` runs `next typegen` before `tsc`.

## What must NOT go here

- Fueling math, ladder rules, or sweat-rate formulas (`packages/engine`).
- Prisma calls (`packages/db` is reached through the API).
- Provider tokens, OAuth, or webhook handling.
- The design-tool runtime packed inside `design/carbadapt-screens.html` (see below).
- Hard-coded colors once `packages/design-tokens` has the real values. The placeholder CSS uses a few hex values on purpose, under `--scaffold-*` names, so it is obvious they are not the token package.

## Milestone

| When       | What lands                                                                    |
| ---------- | ----------------------------------------------------------------------------- |
| This step  | Placeholder page, folder boundaries                                           |
| Rest of M0 | Design tokens and the EN/ES/PT pipeline, wired in but not yet every screen    |
| M2         | Every route from the plan, in EN/ES/PT and light/dark, filled by the mock API |

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

Onboarding (boards 1–2) never uses the CSS variables. Its palette is the same family (ink `#101A2B`, paper `#F4F1EA`, glucose `#C6F135`) but a few surfaces differ (`#182640`, `#C9D2E0`). Keep that stylesheet separate until those frames are moved onto the variables. Do not concatenate the two stylesheets: both define `.p` and `.m`, with different rules.

### Extraction steps (later PRs, not this one)

1. **Unpack offline.** A Node script parses the root manifest, gunzips each page, and writes one HTML file per board under something like `design/boards/` (generated, not hand-edited). Re-run it when the HTML export is replaced. The script is a dev tool, not a runtime dependency.
2. **Split phones.** Each `<div class="p">` (or `class="p lt"`) is one screen state. Map it to a route from the build plan using the gallery title and the kicker text inside the frame (for example `QUESTION 1 OF 7`, `TODAY · FUELING`). The gallery order is not the URL map.
3. **Turn a phone into a server component** under `components/screens/`, rendered by the matching `app/` route. Drop the gallery chrome: the dark board background `#0A1220`, the fixed 390×844 box, and the 44px radius. Those exist so the frames can sit side by side in the review file.
4. **Desktop.** The build plan's open proposal is a centered column about 390px wide, because every frame is an iPhone layout and no desktop layout was designed. The app screen should fill the mobile viewport (`100dvh`) rather than a rounded artboard. Confirm that proposal before coding layout.
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
9. **Copy.** Visible strings are the English source for `packages/i18n`. Do not translate them during extraction, and do not silently edit spelling. The file mixes forms (`fueling` and `fuelling`, `Diarrhoea`, `litre`). The build plan asks for US English. Francisco should pick the source spelling before the catalogs are written.
10. **Behavior.** Buttons, sheets, and steppers in the HTML are drawings. Wire them to routes and the mock API in M2. Do not execute `dc-runtime` to get interactivity.

The placeholder page already uses the welcome-frame mark, with `viewBox` restored, so the rename in step 8 is visible on one SVG. That is the only markup taken from the design in this step.
