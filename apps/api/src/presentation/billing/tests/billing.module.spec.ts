import { Test } from '@nestjs/testing';
import type { IPlanRepository } from '@application/billing';
import { MisconfigurationError } from '@application/common';
import { BillingModule, PLAN_REPOSITORY } from '@presentation/billing';

describe('BillingModule', () => {
  it('starts when the catalog has the required plans', async () => {
    const module = await Test.createTestingModule({
      imports: [BillingModule],
    }).compile();

    await expect(module.init()).resolves.toBe(module);
    await module.close();
  });

  it('refuses to start when a required plan is missing', async () => {
    const emptyCatalog: IPlanRepository = { findByCode: async () => null };
    const module = await Test.createTestingModule({
      imports: [BillingModule],
    })
      .overrideProvider(PLAN_REPOSITORY)
      .useValue(emptyCatalog)
      .compile();

    await expect(module.init()).rejects.toThrow(MisconfigurationError);
  });
});
