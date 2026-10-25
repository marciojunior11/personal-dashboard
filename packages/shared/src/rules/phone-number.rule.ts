import { CommonErrorCodes } from "../common/common-error-codes.js";
import type { IRuleViolation } from "./rule-violation.interface.js";

/** Area code (DDD, 11–99 without zeros) + `9` + 8 digits. */
const BR_MOBILE_PATTERN = /^[1-9]{2}9\d{8}$/;

/** Keeps only the digits, dropping an optional `+55` country code. */
export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 13 && digits.startsWith("55")
    ? digits.slice(2)
    : digits;
}

/**
 * Why `value` is not a Brazilian mobile number (11 digits, `11987654321`), or
 * `null` if it is. Expects a value from `normalizePhoneNumber`.
 */
export function checkPhoneNumber(value: string): IRuleViolation | null {
  return BR_MOBILE_PATTERN.test(value)
    ? null
    : { code: CommonErrorCodes.PHONE_NUMBER_INVALID };
}
