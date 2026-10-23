import { DomainError } from '@personal-dashboard/shared/errors';
import { Money } from '@domain/billing';

describe('Money', () => {
  it('stores the amount in cents', () => {
    expect(Money.fromCents(2990).cents).toBe(2990);
    expect(Money.zero().cents).toBe(0);
  });

  it.each([-1, 29.9, Number.NaN, Number.MAX_SAFE_INTEGER + 1])(
    'rejects %j',
    (cents) => {
      expect(() => Money.fromCents(cents)).toThrow(DomainError);
    },
  );

  it('compares by value', () => {
    expect(Money.fromCents(100).equals(Money.fromCents(100))).toBe(true);
    expect(Money.fromCents(100).equals(Money.fromCents(200))).toBe(false);
  });
});
