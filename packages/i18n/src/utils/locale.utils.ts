import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "../catalog.js";

/**
 * Picks the supported locale that best matches an `Accept-Language` header
 * (`pt-BR,pt;q=0.9,en;q=0.8`): exact tags first, then the same language
 * (`pt` matches `pt-BR`), by preference weight. Falls back to the default.
 */
export function resolveLocale(acceptLanguage?: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const requested = acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag = "", ...attributes] = entry.trim().split(";");
      const quality = attributes
        .map((attribute) => attribute.trim())
        .find((attribute) => attribute.startsWith("q="));
      return {
        tag: tag.toLowerCase(),
        weight: quality ? Number(quality.slice(2)) : 1,
      };
    })
    .filter(({ tag, weight }) => tag !== "" && weight > 0)
    .sort((a, b) => b.weight - a.weight);

  for (const { tag } of requested) {
    const exact = SUPPORTED_LOCALES.find(
      (locale) => locale.toLowerCase() === tag,
    );
    if (exact) return exact;

    const language = tag.split("-")[0];
    const sameLanguage = SUPPORTED_LOCALES.find(
      (locale) => locale.toLowerCase().split("-")[0] === language,
    );
    if (sameLanguage) return sameLanguage;
  }

  return DEFAULT_LOCALE;
}
