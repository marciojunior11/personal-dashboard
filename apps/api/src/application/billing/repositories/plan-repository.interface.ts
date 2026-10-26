import type { Plan, PlanCode } from '@domain/billing';

/** Read-only access to the plan catalog, implemented in the infrastructure layer. */
export interface IPlanRepository {
  /** Returns the plan with the given code, or `null` if it is not in the catalog. */
  findByCode(code: PlanCode): Promise<Plan | null>;
}
