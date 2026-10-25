import { toNestErrors } from "@hookform/resolvers";
import { BillingErrorMessages } from "@personal-dashboard/shared/billing";
import {
  CommonErrorCodes,
  CommonErrorMessages,
} from "@personal-dashboard/shared/common";
import type { ErrorParams } from "@personal-dashboard/shared/errors";
import { IdentityErrorMessages } from "@personal-dashboard/shared/identity";
import type { FieldError, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";
import { translate } from "@/utils/i18n.utils";

/** Catalog key of every error code, from the maps each module shares. */
const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  ...CommonErrorMessages,
  ...IdentityErrorMessages,
  ...BillingErrorMessages,
};

/** The text of an error code; an unknown code shows the generic one. */
function messageOf(code: string, params?: ErrorParams): string {
  const key =
    ERROR_MESSAGES[code] ?? CommonErrorMessages[CommonErrorCodes.INVALID_INPUT];
  return translate(key, params) ?? code;
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
