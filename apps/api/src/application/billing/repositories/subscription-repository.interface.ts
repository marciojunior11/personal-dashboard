import type { Subscription } from '@domain/billing';

/** Persistence contract for subscriptions, implemented in the infrastructure layer. */
export interface ISubscriptionRepository {
  /** Persists a new subscription. */
  insert(subscription: Subscription): Promise<void>;

  /** Returns the organization's subscription, or `null` if it has none. */
  findByOrganizationId(organizationId: string): Promise<Subscription | null>;
}
