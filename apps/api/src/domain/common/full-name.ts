import {
  checkFullName,
  normalizeFullName,
} from '@personal-dashboard/shared/common';
import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from './value-object.js';

/**
 * A person's full name: at least a first name and a surname. Its rule is
 * shared with the input schemas, which catch a bad value first, by its field.
 */
export class FullName extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  /** Trims and collapses inner spaces before validating. */
  static create(raw: string): FullName {
    const value = normalizeFullName(raw);
    const problem = checkFullName(value);
    if (problem !== null) throw new DomainError(problem);

    return new FullName(value);
  }
}
