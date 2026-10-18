/**
 * Message catalogs. `en` is US English and the source language. `es` and `pt`
 * ship beside it as drafts.
 *
 * Screen copy is taken from design/carbadapt-screens.html. British spellings in
 * that file are normalized here (`fueling`, `diarrhea`). Push copy is the
 * handoff wording.
 */
import { messages, type MessageId, type Trio } from "./messages.js";

export const LOCALES = ["en", "es", "pt"] as const;

export type Locale = (typeof LOCALES)[number];

export const SOURCE_LOCALE = "en" satisfies Locale;

/** Spanish and Portuguese are draft translations of the English source. */
export const TRANSLATION_STATUS = {
  en: "source",
  es: "draft",
  pt: "draft",
} as const;

export type { MessageId };

export const MESSAGE_IDS = Object.keys(messages) as MessageId[];

const USER_LOCALE = {
  EN_US: "en",
  ES: "es",
  PT: "pt",
} as const;

export function localeFromUser(value: "EN_US" | "ES" | "PT" | null | undefined): Locale {
  if (!value) return SOURCE_LOCALE;
  return USER_LOCALE[value];
}

export function translate(
  locale: Locale,
  id: MessageId,
  vars?: Record<string, string | number>,
): string {
  const row: Trio = messages[id];
  let text = row[locale];
  if (!vars) return text;
  for (const [key, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${key}}`, String(value));
  }
  return text;
}

export function catalog(locale: Locale): Record<MessageId, string> {
  const out = {} as Record<MessageId, string>;
  for (const id of MESSAGE_IDS) out[id] = messages[id][locale];
  return out;
}
