# @carbadapt/design-tokens

The brand values the web app, and later Swift, consume. One definition, then CSS variables (and a Tailwind preset if we add Tailwind).

## What goes here

Color, type, and radius tokens taken from `design/carbadapt-screens.html`. The in-app frames already name seven variables on the phone (`.p`) and override them for light mode (`.lt`): `--bg`, `--cd`, `--tx`, `--mu`, `--ac`, `--ib`, `--ln`. Button glucose, the alert orange, and the workout-type chips are raw hex in the HTML and belong here too. The full table is in `apps/web/README.md`.

`src/index.ts` points at the source file and does not duplicate those values. Copying them now would freeze a token set before the extraction PR.

## What must NOT go here

- Screen markup or React components (`apps/web`).
- Sentences (`packages/i18n`).
- The design-tool runtime or the 6 MB HTML bundle.

## Milestone

The rest of M0, before M2 builds screens. The web placeholder uses its own `--scaffold-*` variables so this package stays empty until that extraction.

Tailwind is not installed. The build plan allows a Tailwind preset as the CSS output; CSS variables are enough until a screen PR needs utilities.
