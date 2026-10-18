/**
 * Message catalogs. `en` is US English and the source language. `es` and `pt`
 * ship beside it. No strings are stored here yet.
 *
 * Screen copy is taken from design/carbadapt-screens.html when screens are
 * extracted. Push notification copy arrives with scheduling in M4.
 */
export const LOCALES = ["en", "es", "pt"] as const;

export type Locale = (typeof LOCALES)[number];

export const SOURCE_LOCALE = "en" satisfies Locale;
