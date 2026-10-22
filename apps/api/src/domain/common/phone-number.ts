import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from './value-object.js';

/** Area code (DDD, 11–99 without zeros) + `9` + 8 digits. */
const BR_MOBILE_PATTERN = /^[1-9]{2}9\d{8}$/;

/**
 * A Brazilian mobile number, stored as 11 digits (`11987654321`).
 * Accepts any formatting and an optional `+55` country code.
 */
export class PhoneNumber extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string): PhoneNumber {
    let digits = raw.replace(/\D/g, '');
    if (digits.length === 13 && digits.startsWith('55')) {
      digits = digits.slice(2);
    }

    if (!BR_MOBILE_PATTERN.test(digits)) {
      throw new DomainError('Número de celular inválido.');
    }

    return new PhoneNumber(digits);
  }
}
