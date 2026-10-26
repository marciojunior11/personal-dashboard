import { Money } from '@domain/common';
import { PlanPricing, PlanPricingType } from '@domain/billing';

/** How a `PlanPricing` is stored in a JSON column; amounts in integer cents. */
export type PlanPricingJson =
  | { type: typeof PlanPricingType.FREE }
  | { type: typeof PlanPricingType.FLAT; priceCents: number }
  | {
      type: typeof PlanPricingType.TIERED;
      tiers: { upTo: number | null; priceCents: number }[];
    };

/**
 * Converts between the `pricing` JSON column (plans and subscriptions) and
 * the `PlanPricing` value object, which re-validates what it reads.
 */
export const PlanPricingMapper = {
  toDomain(json: unknown): PlanPricing {
    const pricing = json as PlanPricingJson;
    switch (pricing.type) {
      case PlanPricingType.FREE:
        return PlanPricing.free();
      case PlanPricingType.FLAT:
        return PlanPricing.flat(Money.fromCents(pricing.priceCents));
      case PlanPricingType.TIERED:
        return PlanPricing.tiered(
          pricing.tiers.map(({ upTo, priceCents }) => ({
            upTo,
            price: Money.fromCents(priceCents),
          })),
        );
    }
  },

  toPersistence(pricing: PlanPricing): PlanPricingJson {
    const value = pricing.value;
    switch (value.type) {
      case PlanPricingType.FREE:
        return { type: value.type };
      case PlanPricingType.FLAT:
        return { type: value.type, priceCents: value.price.cents };
      case PlanPricingType.TIERED:
        return {
          type: value.type,
          tiers: value.tiers.map(({ upTo, price }) => ({
            upTo,
            priceCents: price.cents,
          })),
        };
    }
  },
};
