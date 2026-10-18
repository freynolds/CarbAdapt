# @carbadapt/i18n

All user-visible copy, including the notification strings. English is the source. Spanish and Portuguese are first-class, not a follow-up.

## What goes here

Catalogs keyed by message id, for `en`, `es`, and `pt`. The web app and the API (notification rows store a `copyKey`) both read this package. English strings are copied from the design HTML, not rewritten in the component.

`src/messages.ts` holds every screen string for `en`, `es`, and `pt`. `translate(locale, id, vars)` looks a key up. `TRANSLATION_STATUS` marks `es` and `pt` as `draft` and `en` as `source`. `localeFromUser` maps `EN_US`, `ES`, and `PT` onto `en`, `es`, and `pt`.

## What must NOT go here

- Layout, colors, or React components.
- Fueling numbers or other rules.
- A second, inline copy table inside `apps/web`.

## Milestone

Screen strings and the push copy from the handoff are in the catalog. A missing key fails typecheck because `MessageId` is the key union. Spanish and Portuguese are drafts of the English source.

## Copy convention

English copy uses US spelling: `fueling`, `liter`, `diarrhea`, and the US form of every other word. Catalogs, screens, and notification strings follow that. The design HTML still contains British forms (`fuelling`, `litre`, `Diarrhoea`). Those are normalized to US English when the strings are extracted into this package. Do not keep both spellings.

Locale codes here are BCP-47 `en`, `es`, `pt`. The proposed Prisma enum uses `EN_US`, `ES`, `PT`. The mapping between those names is decided when the schema is added.
