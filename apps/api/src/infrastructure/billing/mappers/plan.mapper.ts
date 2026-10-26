import type { Plan as PlanRow } from '@generated/prisma';
import { Plan, type PlanCode } from '@domain/billing';
import { PlanPricingMapper } from './plan-pricing.mapper.js';

/** Converts the `plans` table (the catalog, read only) to `Plan` entities. */
export const PlanMapper = {
  toDomain(row: PlanRow): Plan {
    // The database enum has the same values as the domain's.
    return Plan.create(row.code as PlanCode, {
      maxActiveStudents: row.maxActiveStudents,
      pricing: PlanPricingMapper.toDomain(row.pricing),
    });
  },
};
