import { PT_BR } from "./locales/index.js";

/** Key of a translatable message; the same code clients receive in errors. */
export type MessageCode = keyof typeof PT_BR;

/**
 * Every message code by name, for autocomplete and to catch typos at compile
 * time: `MessageCode.EMAIL_INVALID`.
 */
export const MessageCode = Object.freeze(
  Object.fromEntries(Object.keys(PT_BR).map((code) => [code, code])),
) as { readonly [TCode in MessageCode]: TCode };

/** A full set of messages for one locale; every code must be translated. */
export type IMessageCatalog = { readonly [TCode in MessageCode]: string };

/** Locales the system speaks. Add one here and in `CATALOGS`. */
export const SUPPORTED_LOCALES = ["pt-BR"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Used when a request asks for no supported locale. */
export const DEFAULT_LOCALE: Locale = "pt-BR";

export const CATALOGS: { readonly [TLocale in Locale]: IMessageCatalog } = {
  "pt-BR": PT_BR,
};
