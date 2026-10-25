import { MessageCode } from '@personal-dashboard/i18n';
import { DomainError } from '@personal-dashboard/shared/errors';
import { Money, ValueObject } from '@domain/common';

/** A price band: applies while active students are at most `upTo`; `null` has no ceiling. */
export interface IPriceTier {
  upTo: number | null;
  price: Money;
}

/**
 * FREE: costs nothing.
 * FLAT: a fixed price.
 * TIERED: depends on how many active students the organization has.
 */
export const PlanPricingType = {
  FREE: 'FREE',
  FLAT: 'FLAT',
  TIERED: 'TIERED',
} as const;

export type PlanPricingType =
  (typeof PlanPricingType)[keyof typeof PlanPricingType];

/** Each pricing type carries only the data it needs. */
export type PlanPricingValue =
  | { type: typeof PlanPricingType.FREE }
  | { type: typeof PlanPricingType.FLAT; price: Money }
  | { type: typeof PlanPricingType.TIERED; tiers: readonly IPriceTier[] };

/** How a plan charges per billing period. */
export class PlanPricing extends ValueObject<PlanPricingValue> {
  private constructor(value: PlanPricingValue) {
    super(value);
  }

  static free(): PlanPricing {
    return new PlanPricing({ type: PlanPricingType.FREE });
  }

  static flat(price: Money): PlanPricing {
    return new PlanPricing({ type: PlanPricingType.FLAT, price });
  }

  /**
   * Tiers must be in ascending `upTo` order and end with an unbounded tier
   * (`upTo: null`), so every student count has a price.
   */
  static tiered(tiers: readonly IPriceTier[]): PlanPricing {
    const last = tiers.at(-1);

    if (last === undefined || last.upTo !== null) {
      throw new DomainError(MessageCode.PLAN_PRICING_LAST_TIER_BOUNDED);
    }

    let previous = 0;
    for (const { upTo } of tiers.slice(0, -1)) {
      if (upTo === null || !Number.isSafeInteger(upTo) || upTo <= previous) {
        throw new DomainError(MessageCode.PLAN_PRICING_TIERS_NOT_ASCENDING);
      }
      previous = upTo;
    }

    return new PlanPricing({ type: PlanPricingType.TIERED, tiers: [...tiers] });
  }

  get type(): PlanPricingType {
    return this.value.type;
  }

  /** The price of one billing period for the given number of active students. */
  priceFor(activeStudents: number): Money {
    switch (this.value.type) {
      case PlanPricingType.FREE:
        return Money.zero();
      case PlanPricingType.FLAT:
        return this.value.price;
      case PlanPricingType.TIERED:
        // `tiered()` guarantees the last tier is unbounded, so one always matches.
        return this.value.tiers.find(
          ({ upTo }) => upTo === null || activeStudents <= upTo,
        )!.price;
    }
  }
}
