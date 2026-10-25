import { BillingErrorCodes } from '@personal-dashboard/shared/billing';
import { DomainError } from '@personal-dashboard/shared/errors';
import { Entity, type Money } from '@domain/common';
import type { PlanPricing } from './plan-pricing.js';
import type { Plan, PlanCode } from './plan.js';

export interface ISubscriptionProps {
  organizationId: string;
  planCode: PlanCode;
  /** Copied from the plan when subscribing; `null` means no cap. */
  maxActiveStudents: number | null;
  /** Copied from the plan when subscribing. */
  pricing: PlanPricing;
}

/**
 * An organization's contract with a plan. Every organization always has one
 * (LIMITED from sign-up), so no code path deals with "no plan".
 *
 * It keeps its own copy of the plan's limit and pricing: when the catalog
 * changes, existing customers keep the terms they subscribed to.
 */
export class Subscription extends Entity<string> {
  private constructor(
    id: string,
    private readonly props: ISubscriptionProps,
  ) {
    super(id);

    if (props.organizationId.length === 0) {
      throw new DomainError(
        BillingErrorCodes.SUBSCRIPTION_ORGANIZATION_REQUIRED,
      );
    }
  }

  /** Subscribes an organization to a plan, copying its current terms. */
  static create(organizationId: string, plan: Plan): Subscription {
    return new Subscription(crypto.randomUUID(), {
      organizationId,
      planCode: plan.code,
      maxActiveStudents: plan.maxActiveStudents,
      pricing: plan.pricing,
    });
  }

  /** Rebuilds an existing subscription, e.g. when loading it from the database. */
  static restore(id: string, props: ISubscriptionProps): Subscription {
    return new Subscription(id, props);
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get planCode(): PlanCode {
    return this.props.planCode;
  }

  get maxActiveStudents(): number | null {
    return this.props.maxActiveStudents;
  }

  get pricing(): PlanPricing {
    return this.props.pricing;
  }

  /** Whether the organization may activate one more student. */
  allowsAnotherStudent(activeStudents: number): boolean {
    const max = this.props.maxActiveStudents;
    return max === null || activeStudents < max;
  }

  /** The price of one billing period for the given number of active students. */
  priceFor(activeStudents: number): Money {
    return this.props.pricing.priceFor(activeStudents);
  }
}
