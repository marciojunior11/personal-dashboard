import { DomainError } from '@personal-dashboard/shared/errors';
import { Money } from '@domain/common';
import { Plan, PlanCode, PlanPricing, Subscription } from '@domain/billing';

const limited = () =>
  Plan.create(PlanCode.LIMITED, {
    maxActiveStudents: 3,
    pricing: PlanPricing.free(),
  });

const unlimited = () =>
  Plan.create(PlanCode.UNLIMITED, {
    maxActiveStudents: null,
    pricing: PlanPricing.flat(Money.fromCents(9900)),
  });

describe('Subscription', () => {
  it('subscribes an organization copying the plan terms', () => {
    const subscription = Subscription.create('org-1', limited());

    expect(subscription.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(subscription.organizationId).toBe('org-1');
    expect(subscription.planCode).toBe(PlanCode.LIMITED);
    expect(subscription.maxActiveStudents).toBe(3);
    expect(subscription.pricing.equals(PlanPricing.free())).toBe(true);
  });

  it('requires an organization', () => {
    expect(() => Subscription.create('', limited())).toThrow(DomainError);
  });

  it.each([
    [0, true],
    [2, true],
    [3, false],
    [10, false],
  ])(
    'with a cap of 3 and %i active students, allows another: %s',
    (activeStudents, allowed) => {
      const subscription = Subscription.create('org-1', limited());
      expect(subscription.allowsAnotherStudent(activeStudents)).toBe(allowed);
    },
  );

  it('always allows another student without a cap', () => {
    const subscription = Subscription.create('org-1', unlimited());
    expect(subscription.allowsAnotherStudent(10_000)).toBe(true);
  });

  it('prices by its own copy of the terms, not the current plan', () => {
    const subscription = Subscription.create('org-1', unlimited());
    const repriced = Plan.create(PlanCode.UNLIMITED, {
      maxActiveStudents: null,
      pricing: PlanPricing.flat(Money.fromCents(12900)),
    });

    expect(repriced.pricing.priceFor(1).cents).toBe(12900);
    expect(subscription.priceFor(1).cents).toBe(9900);
  });

  it('restores a subscription keeping its id and compares by id', () => {
    const props = {
      organizationId: 'org-1',
      planCode: PlanCode.LIMITED,
      maxActiveStudents: 3,
      pricing: PlanPricing.free(),
    };
    const restored = Subscription.restore('sub-1', props);

    expect(restored.id).toBe('sub-1');
    expect(restored.equals(Subscription.restore('sub-1', props))).toBe(true);
    expect(restored.equals(Subscription.create('org-1', limited()))).toBe(
      false,
    );
  });
});
