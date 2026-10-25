import {
  checkPhoneNumber,
  normalizePhoneNumber,
} from '@personal-dashboard/shared/common';
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
    const problem = checkPhoneNumber(value);
    if (problem !== null) throw new DomainError(problem);

    return new PhoneNumber(value);
  }
}
