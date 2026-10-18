# @carbadapt/i18n

All user-visible copy, including the notification strings. English is the source. Spanish and Portuguese are first-class, not a follow-up.

## What goes here

Catalogs keyed by message id, for `en`, `es`, and `pt`. The web app and the API (notification rows store a `copyKey`) both read this package. English strings are copied from the design HTML, not rewritten in the component.

`src/index.ts` only exports the locale codes so the boundary is visible. There is no catalog file yet.

## What must NOT go here

- Layout, colors, or React components.
- Fueling numbers or other rules.
- A second, inline copy table inside `apps/web`.

## Milestone

The pipeline (how a key is looked up, how a missing translation fails) is part of the rest of M0. Screen strings are filled while the M2 screens are extracted. Push copy is part of M4.

## Copy convention

English copy uses US spelling: `fueling`, `liter`, `diarrhea`, and the US form of every other word. Catalogs, screens, and notification strings follow that. The design HTML still contains British forms (`fuelling`, `litre`, `Diarrhoea`). Those are normalized to US English when the strings are extracted into this package. Do not keep both spellings.

Locale codes here are BCP-47 `en`, `es`, `pt`. The proposed Prisma enum uses `EN_US`, `ES`, `PT`. The mapping between those names is decided when the schema is added.
