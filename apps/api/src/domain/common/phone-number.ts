import {
  checkPhoneNumber,
  normalizePhoneNumber,
} from '@personal-dashboard/shared/rules';
import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from './value-object.js';

/**
 * A Brazilian mobile number, stored as 11 digits (`11987654321`). Accepts any
 * formatting and an optional `+55` country code. Its rule is shared with the
 * input schemas, which catch a bad value first, by its field.
 */
export class PhoneNumber extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string): PhoneNumber {
    const value = normalizePhoneNumber(raw);
    const violation = checkPhoneNumber(value);
    if (violation !== null) {
      throw new DomainError(violation.code, violation.params);
    }

    return new PhoneNumber(value);
  }
}
