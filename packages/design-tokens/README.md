# @carbadapt/design-tokens

The brand values the web app, and later Swift, consume. One definition, then CSS variables (and a Tailwind preset if we add Tailwind).

## What goes here

Color, type, and radius tokens taken from `design/carbadapt-screens.html`. The in-app frames already name seven variables on the phone (`.p`) and override them for light mode (`.lt`): `--bg`, `--cd`, `--tx`, `--mu`, `--ac`, `--ib`, `--ln`. Button glucose, the alert orange, and the workout-type chips are raw hex in the HTML and belong here too. The full table is in `apps/web/README.md`.

`src/tokens.css` is the CSS the web app imports. `src/index.ts` exports the same brand, surface, chip, symptom, radius, and column values for non-CSS callers. Glucose buttons stay `#C6F135` with an ink label in both themes. `--ac` flips to ink in light mode.

## What must NOT go here

- Screen markup or React components (`apps/web`).
- Sentences (`packages/i18n`).
- The design-tool runtime or the 6 MB HTML bundle.

## Milestone

Tokens are in use by `apps/web`. Tailwind is not installed. CSS variables are the output.
