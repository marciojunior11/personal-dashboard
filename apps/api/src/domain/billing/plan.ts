import { MessageCode } from '@personal-dashboard/i18n';
import { DomainError } from '@personal-dashboard/shared/errors';
import { Entity } from '@domain/common';
import type { PlanPricing } from './plan-pricing.js';

/**
 * LIMITED: free, with a cap on active students.
 * ON_DEMAND: the price grows with the number of active students.
 * UNLIMITED: fixed price, no cap.
 */
export const PlanCode = {
  LIMITED: 'LIMITED',
  ON_DEMAND: 'ON_DEMAND',
  UNLIMITED: 'UNLIMITED',
} as const;

export type PlanCode = (typeof PlanCode)[keyof typeof PlanCode];

export interface IPlanProps {
  /** `null` means no cap. */
  maxActiveStudents: number | null;
  pricing: PlanPricing;
}

/**
 * An offer in the catalog, identified by its code. Its limit and price are
 * data, not code, so they can change without a deploy; subscriptions keep a
 * copy of them, so changing a plan never affects who already subscribed.
 */
export class Plan extends Entity<PlanCode> {
  private constructor(
    code: PlanCode,
    private readonly props: IPlanProps,
  ) {
    super(code);

    const max = props.maxActiveStudents;
    if (max !== null && (!Number.isSafeInteger(max) || max < 1)) {
      throw new DomainError(MessageCode.PLAN_MAX_ACTIVE_STUDENTS_INVALID);
    }
  }

  /** Plans are identified by their code, so there is no id to generate. */
  static create(code: PlanCode, props: IPlanProps): Plan {
    return new Plan(code, props);
  }

  get code(): PlanCode {
    return this.id;
  }

  get maxActiveStudents(): number | null {
    return this.props.maxActiveStudents;
  }

  get pricing(): PlanPricing {
    return this.props.pricing;
  }
}
