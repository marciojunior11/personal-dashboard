import { checkEmail, normalizeEmail } from '@personal-dashboard/shared/rules';
import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from './value-object.js';

/**
 * An e-mail address, stored trimmed and in lower case. Its rule is shared with
 * the input schemas, which catch a bad value first, by its field.
 */
export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string): Email {
    const value = normalizeEmail(raw);
    const violation = checkEmail(value);
    if (violation !== null) {
      throw new DomainError(violation.code, violation.params);
    }

    return new Email(value);
  }
}
