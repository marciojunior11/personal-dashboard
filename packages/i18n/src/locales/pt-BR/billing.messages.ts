/** Messages of the billing module: plans and subscriptions. */
export const BILLING_MESSAGES = {
  PLAN_MAX_ACTIVE_STUDENTS_INVALID:
    "O limite de alunos ativos do plano deve ser um inteiro positivo.",
  PLAN_PRICING_LAST_TIER_BOUNDED:
    "As faixas de preço devem terminar em uma faixa sem limite.",
  PLAN_PRICING_TIERS_NOT_ASCENDING:
    "As faixas de preço devem ter limites inteiros e crescentes.",

  SUBSCRIPTION_ORGANIZATION_REQUIRED:
    "A assinatura deve pertencer a uma organização.",
  SUBSCRIPTION_DUPLICATED: "A organização já possui uma assinatura.",
} as const;
