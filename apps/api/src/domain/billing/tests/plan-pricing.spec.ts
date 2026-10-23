import { DomainError } from '@personal-dashboard/shared/errors';
import { Money } from '@domain/common';
import { PlanPricing } from '@domain/billing';

const brl = (cents: number) => Money.fromCents(cents);

const tiered = () =>
  PlanPricing.tiered([
    { upTo: 10, price: brl(2900) },
    { upTo: 25, price: brl(4900) },
    { upTo: null, price: brl(7900) },
  ]);

describe('PlanPricing', () => {
  it('charges nothing when free', () => {
    expect(PlanPricing.free().priceFor(100).cents).toBe(0);
  });

  it('charges a fixed price when flat', () => {
    const pricing = PlanPricing.flat(brl(9900));

    expect(pricing.priceFor(1).cents).toBe(9900);
    expect(pricing.priceFor(500).cents).toBe(9900);
  });

  it.each([
    [0, 2900],
    [10, 2900],
    [11, 4900],
    [25, 4900],
    [26, 7900],
    [1000, 7900],
  ])('charges the tier that fits %i active students', (students, cents) => {
    expect(tiered().priceFor(students).cents).toBe(cents);
  });

  it.each([
    { name: 'no tiers', tiers: [] },
    {
      name: 'a bounded last tier',
      tiers: [{ upTo: 10, price: brl(2900) }],
    },
    {
      name: 'tiers out of order',
      tiers: [
        { upTo: 25, price: brl(4900) },
        { upTo: 10, price: brl(2900) },
        { upTo: null, price: brl(7900) },
      ],
    },
    {
      name: 'an unbounded tier before the last',
      tiers: [
        { upTo: null, price: brl(2900) },
        { upTo: null, price: brl(7900) },
      ],
    },
  ])('rejects tiers with $name', ({ tiers }) => {
    expect(() => PlanPricing.tiered(tiers)).toThrow(DomainError);
  });

  it('compares by content', () => {
    expect(tiered().equals(tiered())).toBe(true);
    expect(
      PlanPricing.flat(brl(9900)).equals(PlanPricing.flat(brl(9900))),
    ).toBe(true);
    expect(PlanPricing.flat(brl(9900)).equals(PlanPricing.free())).toBe(false);
  });
});
