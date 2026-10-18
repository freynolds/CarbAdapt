import type { en } from "./en.js";

export type MessageKey = keyof typeof en;
export type Catalog = { [Key in MessageKey]: string };
