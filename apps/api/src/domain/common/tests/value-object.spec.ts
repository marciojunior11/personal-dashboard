import { Email, Money, ValueObject } from '@domain/common';

interface IRangeValue {
  label: string;
  limits: number[];
  price: Money | null;
}

/** A composite value object, only to exercise structural equality. */
class Range extends ValueObject<IRangeValue> {
  constructor(value: IRangeValue) {
    super(value);
  }
}

/** Same shape as Range, but a different type. */
class OtherRange extends ValueObject<IRangeValue> {
  constructor(value: IRangeValue) {
    super(value);
  }
}

const range = (overrides: Partial<IRangeValue> = {}): IRangeValue => ({
  label: 'a',
  limits: [1, 2],
  price: Money.fromCents(100),
  ...overrides,
});

describe('ValueObject', () => {
  it('compares by value and serializes as the raw value', () => {
    expect(Email.create('a@b.com').equals(Email.create('A@B.com'))).toBe(true);
    expect(Email.create('a@b.com').equals(Email.create('c@b.com'))).toBe(false);
    expect(JSON.stringify({ email: Email.create('a@b.com') })).toBe(
      '{"email":"a@b.com"}',
    );
  });

  it('compares composite values by content, not by reference', () => {
    expect(new Range(range()).equals(new Range(range()))).toBe(true);
  });

  it.each([
    { name: 'a field', overrides: { label: 'b' } },
    { name: 'an array item', overrides: { limits: [1, 3] } },
    { name: 'an array length', overrides: { limits: [1, 2, 3] } },
    { name: 'a nested value object', overrides: { price: Money.zero() } },
    { name: 'a nested null', overrides: { price: null } },
  ])('tells composite values apart by $name', ({ overrides }) => {
    expect(new Range(range()).equals(new Range(range(overrides)))).toBe(false);
  });

  it('tells apart value objects of different types with the same value', () => {
    expect(new Range(range()).equals(new OtherRange(range()))).toBe(false);
    expect(new OtherRange(range()).equals(new Range(range()))).toBe(false);
  });
});
