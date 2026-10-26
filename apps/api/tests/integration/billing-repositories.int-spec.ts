import type { TestingModule } from '@nestjs/testing';
import { BillingErrorCodes } from '@personal-dashboard/shared/billing';
import { ConflictError } from '@personal-dashboard/shared/errors';
import {
  PlanCode,
  PlanPricingType,
  Subscription,
} from '../../src/domain/billing/index.js';
import {
  Organization,
  OrganizationName,
  OrganizationType,
} from '../../src/domain/identity/index.js';
import {
  PrismaPlanRepository,
  PrismaSubscriptionRepository,
} from '../../src/infrastructure/billing/index.js';
import { PrismaOrganizationRepository } from '../../src/infrastructure/identity/index.js';
import { createDatabaseTestingModule } from '../support/database-testing-module.js';

describe('Prisma billing repositories', () => {
  let module: TestingModule;
  let plans: PrismaPlanRepository;
  let subscriptions: PrismaSubscriptionRepository;
  let organizations: PrismaOrganizationRepository;

  beforeEach(async () => {
    module = await createDatabaseTestingModule([
      PrismaPlanRepository,
      PrismaSubscriptionRepository,
      PrismaOrganizationRepository,
    ]);
    plans = module.get(PrismaPlanRepository);
    subscriptions = module.get(PrismaSubscriptionRepository);
    organizations = module.get(PrismaOrganizationRepository);
  });

  afterEach(async () => {
    await module.close();
  });

  /** A stored organization, which a subscription must belong to. */
  const storedOrganization = async () => {
    const organization = Organization.create({
      name: OrganizationName.create('Maria da Silva'),
      type: OrganizationType.INDIVIDUAL,
    });
    await organizations.insert(organization);
    return organization;
  };

  describe('PrismaPlanRepository', () => {
    it.each([
      [PlanCode.LIMITED, 3, PlanPricingType.FREE],
      [PlanCode.ON_DEMAND, null, PlanPricingType.TIERED],
      [PlanCode.UNLIMITED, null, PlanPricingType.FLAT],
    ])(
      'reads the %s plan the migration inserted',
      async (code, maxActiveStudents, pricingType) => {
        const plan = await plans.findByCode(code);

        expect(plan?.code).toBe(code);
        expect(plan?.maxActiveStudents).toBe(maxActiveStudents);
        expect(plan?.pricing.type).toBe(pricingType);
      },
    );

    it('restores tiered pricing with its prices', async () => {
      const plan = await plans.findByCode(PlanCode.ON_DEMAND);

      expect(plan?.pricing.priceFor(5).cents).toBe(2900);
      expect(plan?.pricing.priceFor(20).cents).toBe(4900);
      expect(plan?.pricing.priceFor(500).cents).toBe(7900);
    });
  });

  describe('PrismaSubscriptionRepository', () => {
    it("stores an organization's subscription with its copied terms", async () => {
      const organization = await storedOrganization();
      const plan = await plans.findByCode(PlanCode.UNLIMITED);
      const subscription = Subscription.create(organization.id, plan!);
      await subscriptions.insert(subscription);

      const found = await subscriptions.findByOrganizationId(organization.id);
      expect(found?.equals(subscription)).toBe(true);
      expect(found?.planCode).toBe(PlanCode.UNLIMITED);
      expect(found?.maxActiveStudents).toBeNull();
      expect(found?.pricing.equals(subscription.pricing)).toBe(true);
    });

    it('rejects a second subscription for the same organization', async () => {
      const organization = await storedOrganization();
      const plan = await plans.findByCode(PlanCode.LIMITED);
      await subscriptions.insert(Subscription.create(organization.id, plan!));

      const error = await subscriptions
        .insert(Subscription.create(organization.id, plan!))
        .catch((e) => e);
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.code).toBe(BillingErrorCodes.SUBSCRIPTION_DUPLICATED);
    });
  });
});
