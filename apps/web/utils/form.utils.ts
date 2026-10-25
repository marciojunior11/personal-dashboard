import { toNestErrors } from "@hookform/resolvers";
import { CommonErrorCodes } from "@personal-dashboard/shared/common";
import type { ErrorParams } from "@personal-dashboard/shared/errors";
import type { FieldError, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/error-messages";

/** The text of an error code, with its `{placeholders}` filled in. */
function messageOf(code: string, params?: ErrorParams): string {
  const template =
    ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] ??
    ERROR_MESSAGES[CommonErrorCodes.INVALID_INPUT] ??
    code;
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    String(params?.[name] ?? placeholder),
  );
}

/**
 * A React Hook Form resolver for the shared zod schemas, whose messages are
 * error codes: it validates like `zodResolver` and shows each issue's text,
 * with its params. One error per field, the first broken rule, as the API
 * reports them.
 */
export function codedZodResolver<
  TSchema extends z.ZodType<FieldValues, FieldValues>,
>(schema: TSchema): Resolver<z.input<TSchema>, unknown, z.output<TSchema>> {
  return async (values, _context, options) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data, errors: {} };

    const errors: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join(".");
      if (field in errors) continue;

      const params =
        "params" in issue ? (issue.params as ErrorParams) : undefined;
      errors[field] = {
        type: issue.code,
        message: messageOf(issue.message, params),
      };
    }

    return { values: {}, errors: toNestErrors(errors, options) };
  };
}
