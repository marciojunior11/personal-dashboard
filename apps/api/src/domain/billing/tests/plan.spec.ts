import { DomainError } from '@personal-dashboard/shared/errors';
import { Money } from '@domain/common';
import { Plan, PlanCode, PlanPricing, PlanPricingType } from '@domain/billing';

describe('Plan', () => {
  it('is identified by its code', () => {
    const plan = Plan.create(PlanCode.LIMITED, {
      maxActiveStudents: 3,
      pricing: PlanPricing.free(),
    });

    expect(plan.id).toBe(PlanCode.LIMITED);
    expect(plan.code).toBe(PlanCode.LIMITED);
    expect(plan.maxActiveStudents).toBe(3);
    expect(plan.pricing.type).toBe(PlanPricingType.FREE);
  });

  it('accepts no cap on active students', () => {
    const plan = Plan.create(PlanCode.UNLIMITED, {
      maxActiveStudents: null,
      pricing: PlanPricing.flat(Money.fromCents(9900)),
    });
    expect(plan.maxActiveStudents).toBeNull();
  });

  it.each([0, -1, 2.5])('rejects a cap of %j', (maxActiveStudents) => {
    expect(() =>
      Plan.create(PlanCode.LIMITED, {
        maxActiveStudents,
        pricing: PlanPricing.free(),
      }),
    ).toThrow(DomainError);
  });
});
