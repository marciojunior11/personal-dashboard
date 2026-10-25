import type { BillingErrorCode } from '@personal-dashboard/shared/billing';
import type { I18nPath } from '@generated/i18n';

/** Catalog key of each billing error code; every code needs an existing key. */
export const billingErrorMessages: Readonly<
  Record<BillingErrorCode, I18nPath>
> = {
  PLAN_MAX_ACTIVE_STUDENTS_INVALID: 'billing.plan.maxActiveStudentsInvalid',
  PLAN_PRICING_LAST_TIER_BOUNDED: 'billing.plan.pricingLastTierBounded',
  PLAN_PRICING_TIERS_NOT_ASCENDING: 'billing.plan.pricingTiersNotAscending',

  SUBSCRIPTION_ORGANIZATION_REQUIRED:
    'billing.subscription.organizationRequired',
  SUBSCRIPTION_DUPLICATED: 'billing.subscription.duplicated',
};
