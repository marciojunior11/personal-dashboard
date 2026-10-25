import { CommonErrorCodes } from "../common/common-error-codes.js";
import type { IRuleViolation } from "./rule-violation.interface.js";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_AGE = 130;

/** Trims. */
export function normalizeBirthDate(raw: string): string {
  return raw.trim();
}

/** Age in full years on `date` of someone born on `isoDate` (`YYYY-MM-DD`). */
export function ageOn(isoDate: string, date: Date): number {
  const [year = 0, month = 0, day = 0] = isoDate.split("-").map(Number);
  const currentMonth = date.getMonth() + 1;
  const hadBirthday =
    currentMonth > month || (currentMonth === month && date.getDate() >= day);

  return date.getFullYear() - year - (hadBirthday ? 0 : 1);
}

/**
 * Why `value` is not a plausible ISO 8601 birth date (`YYYY-MM-DD`), or
 * `null` if it is. Expects a value from `normalizeBirthDate`; `today` is
 * injectable so the check can be tested deterministically.
 */
export function checkBirthDate(
  value: string,
  today: Date = new Date(),
): IRuleViolation | null {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return { code: CommonErrorCodes.BIRTH_DATE_INVALID_FORMAT };
  }

  const [year = 0, month = 0, day = 0] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Rejects dates that roll over, such as 2023-02-30.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { code: CommonErrorCodes.BIRTH_DATE_INVALID };
  }

  const age = ageOn(value, today);
  if (age < 0) return { code: CommonErrorCodes.BIRTH_DATE_IN_FUTURE };
  if (age > MAX_AGE) return { code: CommonErrorCodes.BIRTH_DATE_INVALID };
  return null;
}
