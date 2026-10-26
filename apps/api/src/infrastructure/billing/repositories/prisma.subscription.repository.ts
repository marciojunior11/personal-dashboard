import { Inject, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { BillingErrorCodes } from '@personal-dashboard/shared/billing';
import { ConflictError } from '@personal-dashboard/shared/errors';
import type { ISubscriptionRepository } from '@application/billing';
import type { Subscription } from '@domain/billing';
import {
  uniqueViolationFields,
  type PrismaTransactionHost,
} from '@infrastructure/database';
import { SubscriptionMapper } from '@infrastructure/billing/mappers';

/** `ISubscriptionRepository` on the `subscriptions` table; joins the current unit of work. */
@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @Inject(TransactionHost) private readonly txHost: PrismaTransactionHost,
  ) {}

  /** @throws {ConflictError} when the organization already has a subscription. */
  async insert(subscription: Subscription): Promise<void> {
    try {
      await this.txHost.tx.subscription.create({
        data: SubscriptionMapper.toPersistence(subscription),
      });
    } catch (error) {
      if (uniqueViolationFields(error) === null) throw error;
      throw new ConflictError(BillingErrorCodes.SUBSCRIPTION_DUPLICATED);
    }
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<Subscription | null> {
    const row = await this.txHost.tx.subscription.findUnique({
      where: { organizationId },
    });
    return row === null ? null : SubscriptionMapper.toDomain(row);
  }
}
