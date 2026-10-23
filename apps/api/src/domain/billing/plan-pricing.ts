import { DomainError } from '@personal-dashboard/shared/errors';
import { ValueObject } from '@domain/common';
import { Money } from './money.js';

/** A price band: applies while active students are at most `upTo`; `null` has no ceiling. */
export interface IPriceTier {
  upTo: number | null;
  price: Money;
}

export type PlanPricingValue =
  | { type: 'FREE' }
  | { type: 'FLAT'; price: Money }
  | { type: 'TIERED'; tiers: readonly IPriceTier[] };

/**
 * How a plan charges per billing period:
 * FREE costs nothing, FLAT is a fixed price, and TIERED depends on how many
 * active students the organization has.
 */
export class PlanPricing extends ValueObject<PlanPricingValue> {
  private constructor(value: PlanPricingValue) {
    super(value);
  }

  static free(): PlanPricing {
    return new PlanPricing({ type: 'FREE' });
  }

  static flat(price: Money): PlanPricing {
    return new PlanPricing({ type: 'FLAT', price });
  }

  /**
   * Tiers must be in ascending `upTo` order and end with an unbounded tier
   * (`upTo: null`), so every student count has a price.
   */
  static tiered(tiers: readonly IPriceTier[]): PlanPricing {
    const last = tiers.at(-1);

    if (last === undefined || last.upTo !== null) {
      throw new DomainError(
        'As faixas de preço devem terminar em uma faixa sem limite.',
      );
    }

    let previous = 0;
    for (const { upTo } of tiers.slice(0, -1)) {
      if (upTo === null || !Number.isSafeInteger(upTo) || upTo <= previous) {
        throw new DomainError(
          'As faixas de preço devem ter limites inteiros e crescentes.',
        );
      }
      previous = upTo;
    }

    return new PlanPricing({ type: 'TIERED', tiers: [...tiers] });
  }

  get type(): PlanPricingValue['type'] {
    return this.value.type;
  }

  /** The price of one billing period for the given number of active students. */
  priceFor(activeStudents: number): Money {
    switch (this.value.type) {
      case 'FREE':
        return Money.zero();
      case 'FLAT':
        return this.value.price;
      case 'TIERED':
        // `tiered()` guarantees the last tier is unbounded, so one always matches.
        return this.value.tiers.find(
          ({ upTo }) => upTo === null || activeStudents <= upTo,
        )!.price;
    }
  }

  /** Compares by content: the base class compares by reference, which fails for objects. */
  override equals(
    other: ValueObject<PlanPricingValue> | null | undefined,
  ): boolean {
    return (
      other instanceof PlanPricing &&
      JSON.stringify(other.value) === JSON.stringify(this.value)
    );
  }
}
