import { checkEmail, normalizeEmail } from '@personal-dashboard/shared/common';
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
    const problem = checkEmail(value);
    if (problem !== null) throw new DomainError(problem);

    return new Email(value);
  }
}
