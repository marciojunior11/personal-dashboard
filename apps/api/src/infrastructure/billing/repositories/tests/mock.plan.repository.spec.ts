import { PlanCode, PlanPricingType } from '@domain/billing';
import { MockPlanRepository } from '@infrastructure/billing';

describe('MockPlanRepository', () => {
  const repository = new MockPlanRepository();

  it.each([
    [PlanCode.LIMITED, 3, PlanPricingType.FREE],
    [PlanCode.ON_DEMAND, null, PlanPricingType.TIERED],
    [PlanCode.UNLIMITED, null, PlanPricingType.FLAT],
  ])(
    'has the %s plan with a cap of %j and %s pricing',
    async (code, maxActiveStudents, pricingType) => {
      const plan = await repository.findByCode(code);

      expect(plan?.code).toBe(code);
      expect(plan?.maxActiveStudents).toBe(maxActiveStudents);
      expect(plan?.pricing.type).toBe(pricingType);
    },
  );
});
