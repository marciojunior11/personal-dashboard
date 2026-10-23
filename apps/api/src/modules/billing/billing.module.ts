import { Inject, Module, type OnModuleInit } from '@nestjs/common';
import {
  ensureRequiredPlans,
  type IPlanRepository,
} from '@application/billing';
import {
  MockPlanRepository,
  MockSubscriptionRepository,
} from '@infrastructure/billing';
import { PLAN_REPOSITORY, SUBSCRIPTION_REPOSITORY } from './billing.tokens.js';

/**
 * Binds the billing contracts to their implementations and exports them, so
 * other modules (e.g. identity, on sign-up) can create subscriptions.
 *
 * On startup it checks that the catalog has every required plan: without
 * them the application is not ready to serve anyone, so it refuses to start.
 */
@Module({
  providers: [
    { provide: PLAN_REPOSITORY, useClass: MockPlanRepository },
    { provide: SUBSCRIPTION_REPOSITORY, useClass: MockSubscriptionRepository },
  ],
  exports: [PLAN_REPOSITORY, SUBSCRIPTION_REPOSITORY],
})
export class BillingModule implements OnModuleInit {
  constructor(
    @Inject(PLAN_REPOSITORY) private readonly plans: IPlanRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await ensureRequiredPlans(this.plans);
  }
}
