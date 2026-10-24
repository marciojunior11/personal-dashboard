import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from '@domain/common';

const MIN_LENGTH = 2;
const MAX_LENGTH = 150;

/** An organization's display name (e.g. "Studio Força Total"). */
export class OrganizationName extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  /** Trims and collapses inner spaces before validating. */
  static create(raw: string): OrganizationName {
    const value = raw.trim().replace(/\s+/g, ' ');

    if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      throw new DomainError(
        `O nome da organização deve ter entre ${MIN_LENGTH} e ${MAX_LENGTH} caracteres.`,
      );
    }

    return new OrganizationName(value);
  }
}
