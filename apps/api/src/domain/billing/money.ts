import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from '@domain/common';

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
      throw new DomainError('O valor deve ser um número inteiro de centavos.');
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
