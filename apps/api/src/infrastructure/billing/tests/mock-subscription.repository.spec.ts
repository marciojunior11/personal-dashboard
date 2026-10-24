import { ConflictError } from '@personal-dashboard/shared/errors';
import { Plan, PlanCode, PlanPricing, Subscription } from '@domain/billing';
import { MockSubscriptionRepository } from '@infrastructure/billing';

const limited = Plan.create(PlanCode.LIMITED, {
  maxActiveStudents: 3,
  pricing: PlanPricing.free(),
});

describe('MockSubscriptionRepository', () => {
  let repository: MockSubscriptionRepository;

  beforeEach(() => {
    repository = new MockSubscriptionRepository();
  });

  it("finds an organization's subscription", async () => {
    const subscription = Subscription.create('org-1', limited);
    await repository.insert(subscription);

    expect(await repository.findByOrganizationId('org-1')).toBe(subscription);
  });

  it('returns null for an organization with no subscription', async () => {
    expect(await repository.findByOrganizationId('unknown')).toBeNull();
  });

  it('rejects a second subscription for the same organization', async () => {
    await repository.insert(Subscription.create('org-1', limited));

    await expect(
      repository.insert(Subscription.create('org-1', limited)),
    ).rejects.toThrow(ConflictError);
  });
});
