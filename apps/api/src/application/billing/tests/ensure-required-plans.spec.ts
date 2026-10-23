import { BaseError } from '@personal-dashboard/shared/errors';
import { PlanCode } from '@domain/billing';
import {
  ensureRequiredPlans,
  REQUIRED_PLAN_CODES,
  type IPlanRepository,
} from '@application/billing';
import { MisconfigurationError } from '@application/common';
import { MockPlanRepository } from '@infrastructure/billing';

describe('ensureRequiredPlans', () => {
  it('requires the LIMITED plan', () => {
    expect(REQUIRED_PLAN_CODES).toContain(PlanCode.LIMITED);
  });

  it('passes when every required plan is in the catalog', async () => {
    await expect(
      ensureRequiredPlans(new MockPlanRepository()),
    ).resolves.toBeUndefined();
  });

  it('throws MisconfigurationError naming the missing plans', async () => {
    const emptyCatalog: IPlanRepository = { findByCode: async () => null };

    const error = await ensureRequiredPlans(emptyCatalog).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(MisconfigurationError);
    expect(error).not.toBeInstanceOf(BaseError);
    expect((error as Error).name).toBe('MisconfigurationError');
    expect((error as Error).message).toContain(PlanCode.LIMITED);
  });
});
