import { IdentityErrorCodes } from '@personal-dashboard/shared/identity';
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
        IdentityErrorCodes.ORGANIZATION_NAME_INVALID_LENGTH,
        {
          min: MIN_LENGTH,
          max: MAX_LENGTH,
        },
      );
    }

    return new OrganizationName(value);
  }
}
