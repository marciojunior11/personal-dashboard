import { PlanCode } from '@domain/billing';
import { MisconfigurationError } from '@application/common';
import type { IPlanRepository } from './plan-repository.interface.js';

/** Plans the system cannot run without: LIMITED is every new organization's plan. */
export const REQUIRED_PLAN_CODES: readonly PlanCode[] = [PlanCode.LIMITED];

/**
 * Checks that the catalog has every required plan, so a misconfigured
 * deployment fails on startup instead of on a customer's first sign-up.
 *
 * @throws {MisconfigurationError} listing the missing plans.
 */
export async function ensureRequiredPlans(
  plans: IPlanRepository,
): Promise<void> {
  const missing: PlanCode[] = [];
  for (const code of REQUIRED_PLAN_CODES) {
    if ((await plans.findByCode(code)) === null) {
      missing.push(code);
    }
  }

  if (missing.length > 0) {
    throw new MisconfigurationError(
      `Planos obrigatórios ausentes do catálogo: ${missing.join(', ')}. A aplicação não pode iniciar sem eles.`,
    );
  }
}
