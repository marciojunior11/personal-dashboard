import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from './value-object.js';

const MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** An e-mail address, stored trimmed and in lower case. */
export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string): Email {
    const value = raw.trim().toLowerCase();

    if (value.length > MAX_LENGTH || !EMAIL_PATTERN.test(value)) {
      throw new DomainError('E-mail inválido.');
    }

    return new Email(value);
  }
}
