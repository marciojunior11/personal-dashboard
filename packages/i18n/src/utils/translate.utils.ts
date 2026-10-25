import { IntlMessageFormat } from "intl-messageformat";
import {
  CATALOGS,
  DEFAULT_LOCALE,
  MessageCode,
  type Locale,
} from "../catalog.js";

/** Values for the `{placeholders}` of a message, in ICU MessageFormat. */
export type MessageParams = Record<string, string | number | Date>;

/** Formatters are built once per locale and code. */
const formatters = new Map<string, IntlMessageFormat>();

/**
 * Whether `value` is a known message code. Uses an own-property check, so
 * names like `toString` or `__proto__` are never taken for codes.
 */
export function isMessageCode(value: string): value is MessageCode {
  return Object.hasOwn(MessageCode, value);
}

/**
 * The message for `code` in `locale`, with `params` filled in. An unknown
 * code yields the generic internal error message: a missing translation must
 * never show a raw code, or a server text, to the user.
 */
export function translate(
  code: string,
  params?: MessageParams,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const known = isMessageCode(code) ? code : MessageCode.INTERNAL;
  const cacheKey = `${locale}:${known}`;

  let formatter = formatters.get(cacheKey);
  if (formatter === undefined) {
    formatter = new IntlMessageFormat(CATALOGS[locale][known], locale);
    formatters.set(cacheKey, formatter);
  }

  return String(formatter.format(params));
}
