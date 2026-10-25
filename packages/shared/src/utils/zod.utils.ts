/** The part of zod's refinement context a rule needs; avoids importing zod. */
interface IRefinementContext {
  addIssue(issue: { code: "custom"; message: string }): void;
}

/**
 * Turns a format rule into a zod refinement, so a schema checks a field with
 * the same function as the domain's value object, and the issue lands on
 * that field: `z.string().transform(normalizeX).superRefine(rule(checkX))`.
 */
export function rule(check: (value: string) => string | null) {
  return (value: string, ctx: IRefinementContext): void => {
    const problem = check(value);
    if (problem !== null) ctx.addIssue({ code: "custom", message: problem });
  };
}
