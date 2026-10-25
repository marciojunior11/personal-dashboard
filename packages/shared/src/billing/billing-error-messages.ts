import type { BillingErrorCode } from "./billing-error-codes.js";

/**
 * Catalog key of each billing error code; see `CommonErrorMessages`.
 * Every code must have a key; the API checks that each key exists.
 */
export const BillingErrorMessages = {
  PLAN_MAX_ACTIVE_STUDENTS_INVALID: "billing.plan.maxActiveStudentsInvalid",
  PLAN_PRICING_LAST_TIER_BOUNDED: "billing.plan.pricingLastTierBounded",
  PLAN_PRICING_TIERS_NOT_ASCENDING: "billing.plan.pricingTiersNotAscending",

  SUBSCRIPTION_ORGANIZATION_REQUIRED:
    "billing.subscription.organizationRequired",
  SUBSCRIPTION_DUPLICATED: "billing.subscription.duplicated",
} as const satisfies Record<BillingErrorCode, string>;
