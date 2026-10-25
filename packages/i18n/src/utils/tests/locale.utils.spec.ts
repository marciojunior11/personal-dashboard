import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE } from "../../catalog.js";
import { resolveLocale } from "../locale.utils.js";

describe("resolveLocale", () => {
  it.each([
    ["pt-BR", "pt-BR"],
    ["pt-br", "pt-BR"],
    ["pt", "pt-BR"],
    ["pt-PT", "pt-BR"],
    ["en-US,pt-BR;q=0.8", "pt-BR"],
    ["fr;q=0.9,pt;q=0.5", "pt-BR"],
  ])("picks a supported locale for %j", (header, locale) => {
    expect(resolveLocale(header)).toBe(locale);
  });

  it.each([undefined, null, "", "fr-FR,de;q=0.9", "pt;q=0"])(
    "falls back to the default locale for %j",
    (header) => {
      expect(resolveLocale(header)).toBe(DEFAULT_LOCALE);
    },
  );
});
