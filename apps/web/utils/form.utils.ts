import { toNestErrors } from "@hookform/resolvers";
import {
  DEFAULT_LOCALE,
  translate,
  type Locale,
  type MessageParams,
} from "@personal-dashboard/i18n";
import type { FieldError, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

/**
 * A React Hook Form resolver for the shared zod schemas, whose messages are
 * message codes: it validates like `zodResolver` and translates each issue,
 * with its params, into `locale`. One error per field, the first broken rule,
 * as the API reports them.
 */
export function translatedZodResolver<
  TSchema extends z.ZodType<FieldValues, FieldValues>,
>(
  schema: TSchema,
  locale: Locale = DEFAULT_LOCALE,
): Resolver<z.input<TSchema>, unknown, z.output<TSchema>> {
  return async (values, _context, options) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data, errors: {} };

    const errors: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join(".");
      if (field in errors) continue;

      const params =
        "params" in issue ? (issue.params as MessageParams) : undefined;
      errors[field] = {
        type: issue.code,
        message: translate(issue.message, params, locale),
      };
    }

    return { values: {}, errors: toNestErrors(errors, options) };
  };
}
