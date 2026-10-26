import type { Subscription as SubscriptionRow } from '@generated/prisma';
import { Subscription, type PlanCode } from '@domain/billing';
import { PlanPricingMapper } from './plan-pricing.mapper.js';

/** Converts between the `subscriptions` table and the `Subscription` entity. */
export const SubscriptionMapper = {
  toDomain(row: SubscriptionRow): Subscription {
    return Subscription.restore(row.id, {
      organizationId: row.organizationId,
      // The database enum has the same values as the domain's.
      planCode: row.planCode as PlanCode,
      maxActiveStudents: row.maxActiveStudents,
      pricing: PlanPricingMapper.toDomain(row.pricing),
    });
  },

  toPersistence(subscription: Subscription) {
    return {
      id: subscription.id,
      organizationId: subscription.organizationId,
      planCode: subscription.planCode,
      maxActiveStudents: subscription.maxActiveStudents,
      pricing: PlanPricingMapper.toPersistence(subscription.pricing),
    };
  },
};
