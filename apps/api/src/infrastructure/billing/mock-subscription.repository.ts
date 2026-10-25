import { BillingErrorCodes } from '@personal-dashboard/shared/billing';
import { ConflictError } from '@personal-dashboard/shared/errors';
import type { ISubscriptionRepository } from '@application/billing';
import type { Subscription } from '@domain/billing';

/**
 * In-memory `ISubscriptionRepository`, for development and tests. Records
 * live in a list and are lost when the process stops.
 */
export class MockSubscriptionRepository implements ISubscriptionRepository {
  private readonly subscriptions: Subscription[] = [];

  /** An organization has exactly one subscription. */
  async insert(subscription: Subscription): Promise<void> {
    if (
      this.subscriptions.some(
        (existing) =>
          existing.equals(subscription) ||
          existing.organizationId === subscription.organizationId,
      )
    ) {
      throw new ConflictError(BillingErrorCodes.SUBSCRIPTION_DUPLICATED);
    }

    this.subscriptions.push(subscription);
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<Subscription | null> {
    return (
      this.subscriptions.find(
        (subscription) => subscription.organizationId === organizationId,
      ) ?? null
    );
  }
}
