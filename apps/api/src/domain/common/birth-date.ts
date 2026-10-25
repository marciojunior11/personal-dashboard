import {
  ageOn,
  checkBirthDate,
  normalizeBirthDate,
} from '@personal-dashboard/shared/rules';
import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from './value-object.js';

/**
 * A birth date, stored as an ISO 8601 date (`YYYY-MM-DD`) with no time or
 * time zone, so it never shifts a day when serialized. Its rule is shared
 * with the input schemas, which catch a bad value first, by its field.
 */
export class BirthDate extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  /** `today` is injectable so validation can be tested deterministically. */
  static create(raw: string, today: Date = new Date()): BirthDate {
    const value = normalizeBirthDate(raw);
    const violation = checkBirthDate(value, today);
    if (violation !== null) {
      throw new DomainError(violation.code, violation.params);
    }

    return new BirthDate(value);
  }

  /** Age in full years on the given date. */
  ageAt(date: Date = new Date()): number {
    return ageOn(this.value, date);
  }
}
