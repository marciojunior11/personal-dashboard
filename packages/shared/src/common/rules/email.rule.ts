import { MessageCode } from "@personal-dashboard/i18n";
import type { IRuleViolation } from "./rule-violation.interface.js";

const MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trims and lowercases. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Why `value` is not an e-mail address, or `null` if it is. Expects a value
 * from `normalizeEmail`.
 */
export function checkEmail(value: string): IRuleViolation | null {
  return value.length <= MAX_LENGTH && EMAIL_PATTERN.test(value)
    ? null
    : { code: MessageCode.EMAIL_INVALID };
}
