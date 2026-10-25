import type { MessageParams } from "@personal-dashboard/i18n";
import type { IRuleViolation } from "../common/rules/index.js";

/** The part of zod's refinement context a rule needs; avoids importing zod. */
interface IRefinementContext {
  addIssue(issue: {
    code: "custom";
    message: string;
    params?: MessageParams;
  }): void;
}

/**
 * Turns a format rule into a zod refinement, so a schema checks a field with
 * the same function as the domain's value object, and the issue lands on
 * that field: `z.string().transform(normalizeX).superRefine(rule(checkX))`.
 *
 * Like every message in the shared schemas, the issue's `message` is a
 * message code, not a text; its params travel in `params`. Whoever shows the
 * issue translates it, in its own locale.
 */
export function rule(check: (value: string) => IRuleViolation | null) {
  return (value: string, ctx: IRefinementContext): void => {
    const violation = check(value);
    if (violation === null) return;

    ctx.addIssue({
      code: "custom",
      message: violation.code,
      ...(violation.params && { params: violation.params }),
    });
  };
}
