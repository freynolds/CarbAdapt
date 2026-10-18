import type { Catalog, MessageKey } from "./catalog";
import { en } from "./en";
import { es } from "./es";
import { pt } from "./pt";

export const catalogs = {
  EN_US: en,
  ES: es,
  PT: pt,
} satisfies Record<string, Catalog>;

export type Locale = keyof typeof catalogs;

export function translate(locale: string, key: MessageKey): string {
  const catalog = catalogs[locale as Locale] ?? catalogs.EN_US;
  return catalog[key];
}

export type { MessageKey };
