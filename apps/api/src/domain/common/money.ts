import { MessageCode } from '@personal-dashboard/i18n';
import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from './value-object.js';

/**
 * An amount in BRL, stored in cents to avoid floating-point rounding
 * (R$ 29,90 is `Money.fromCents(2990)`).
 */
export class Money extends ValueObject<number> {
  private constructor(cents: number) {
    super(cents);
  }

  static fromCents(cents: number): Money {
    if (!Number.isSafeInteger(cents) || cents < 0) {
      throw new DomainError(MessageCode.MONEY_INVALID_CENTS);
    }

    return new Money(cents);
  }

  static zero(): Money {
    return new Money(0);
  }

  get cents(): number {
    return this.value;
  }
}
