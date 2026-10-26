import type { IPlanRepository } from '@application/billing';
import { Money } from '@domain/common';
import { Plan, PlanCode, PlanPricing } from '@domain/billing';

const brl = (cents: number) => Money.fromCents(cents);

/**
 * In-memory plan catalog, for development and tests. The limits and prices
 * are placeholders until the commercial values are decided.
 */
export class MockPlanRepository implements IPlanRepository {
  private readonly plans: Plan[] = [
    Plan.create(PlanCode.LIMITED, {
      maxActiveStudents: 3,
      pricing: PlanPricing.free(),
    }),
    Plan.create(PlanCode.ON_DEMAND, {
      maxActiveStudents: null,
      pricing: PlanPricing.tiered([
        { upTo: 10, price: brl(2900) },
        { upTo: 25, price: brl(4900) },
        { upTo: null, price: brl(7900) },
      ]),
    }),
    Plan.create(PlanCode.UNLIMITED, {
      maxActiveStudents: null,
      pricing: PlanPricing.flat(brl(9900)),
    }),
  ];

  async findByCode(code: PlanCode): Promise<Plan | null> {
    return this.plans.find((plan) => plan.code === code) ?? null;
  }
}
