import billing from "@personal-dashboard/i18n/locales/pt-BR/billing.json";
import common from "@personal-dashboard/i18n/locales/pt-BR/common.json";
import identity from "@personal-dashboard/i18n/locales/pt-BR/identity.json";
import type { ErrorParams } from "@personal-dashboard/shared/errors";

/** The pt-BR catalogs, by namespace, as keys name them (`common.fullName.required`). */
const CATALOGS: Record<string, unknown> = { billing, common, identity };

/**
 * Interim: the pt-BR text of a catalog key, with its `{placeholders}` filled
 * in, or `null` if the key does not exist. Replaced by `next-intl`'s `t()`
 * when the client's i18n resources are defined; callers keep passing keys.
 */
export function translate(key: string, params?: ErrorParams): string | null {
  const text = key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node !== null && typeof node === "object" && Object.hasOwn(node, part)
          ? (node as Record<string, unknown>)[part]
          : undefined,
      CATALOGS,
    );
  if (typeof text !== "string") return null;

  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    String(params?.[name] ?? placeholder),
  );
}
