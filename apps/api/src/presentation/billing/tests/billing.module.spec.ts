import { Test } from '@nestjs/testing';
import type { IPlanRepository } from '@application/billing';
import { MisconfigurationError } from '@application/common';
import {
  MockPlanRepository,
  MockSubscriptionRepository,
} from '@infrastructure/billing';
import {
  BillingModule,
  PLAN_REPOSITORY,
  SUBSCRIPTION_REPOSITORY,
} from '@presentation/billing';

/** The module with in-memory repositories, so its startup check runs without a database. */
const compileWith = (plans: IPlanRepository) =>
  Test.createTestingModule({ imports: [BillingModule] })
    .overrideProvider(PLAN_REPOSITORY)
    .useValue(plans)
    .overrideProvider(SUBSCRIPTION_REPOSITORY)
    .useValue(new MockSubscriptionRepository())
    .compile();

describe('BillingModule', () => {
  it('starts when the catalog has the required plans', async () => {
    const module = await compileWith(new MockPlanRepository());

    await expect(module.init()).resolves.toBe(module);
    await module.close();
  });

  it('refuses to start when a required plan is missing', async () => {
    const module = await compileWith({ findByCode: async () => null });

    await expect(module.init()).rejects.toThrow(MisconfigurationError);
  });
});
