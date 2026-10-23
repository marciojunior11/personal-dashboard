/**
 * Injection tokens for the application contracts: interfaces do not exist at
 * runtime, so Nest needs a concrete key to bind each one to an implementation.
 */
export const PLAN_REPOSITORY = Symbol('IPlanRepository');
export const SUBSCRIPTION_REPOSITORY = Symbol('ISubscriptionRepository');
