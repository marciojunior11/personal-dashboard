import { MessageCode } from "@personal-dashboard/i18n";
import type { IRuleViolation } from "./rule-violation.interface.js";

export const FULL_NAME_MAX_LENGTH = 150;
/** Letters (accented included), optionally joined by `'` or `-` (e.g. D'Ávila, Ana-Clara). */
const WORD_PATTERN = /^\p{L}+(?:['-]\p{L}+)*$/u;

/** Trims and collapses inner spaces. */
export function normalizeFullName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Why `value` is not a person's full name (a first name and a surname), or
 * `null` if it is. Expects a value from `normalizeFullName`.
 */
export function checkFullName(value: string): IRuleViolation | null {
  const words = value.split(" ");

  if (words.length < 2) {
    return { code: MessageCode.FULL_NAME_MISSING_SURNAME };
  }
  if (value.length > FULL_NAME_MAX_LENGTH) {
    return {
      code: MessageCode.FULL_NAME_TOO_LONG,
      params: { max: FULL_NAME_MAX_LENGTH },
    };
  }
  if (!words.every((word) => WORD_PATTERN.test(word))) {
    return { code: MessageCode.FULL_NAME_INVALID_CHARACTERS };
  }
  return null;
}
