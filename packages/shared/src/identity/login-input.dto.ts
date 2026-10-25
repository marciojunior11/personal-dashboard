import { z } from "zod";
import { CommonErrorCodes } from "../common/common-error-codes.js";
import {
  checkEmail,
  checkPhoneNumber,
  normalizeEmail,
  normalizePhoneNumber,
} from "../rules/index.js";
import { rule } from "../utils/index.js";
import { IdentityErrorCodes } from "./identity-error-codes.js";

/**
 * Validates the credentials used to log in, by e-mail or phone. Identifiers
 * are normalized with the same rules used on sign-up, so they match the
 * stored values however the user typed them.
 */
export const loginInputSchema = z
  .object({
    email: z
      .string({ error: CommonErrorCodes.EMAIL_INVALID })
      .transform(normalizeEmail)
      .superRefine(rule(checkEmail))
      .optional(),
    celular: z
      .string({ error: CommonErrorCodes.PHONE_NUMBER_INVALID })
      .transform(normalizePhoneNumber)
      .superRefine(rule(checkPhoneNumber))
      .optional(),
    senha: z
      .string({ error: IdentityErrorCodes.PASSWORD_REQUIRED })
      .min(1, IdentityErrorCodes.PASSWORD_REQUIRED),
  })
  .superRefine((data, ctx) => {
    if (data.email || data.celular) return;
    for (const field of ["email", "celular"]) {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: IdentityErrorCodes.EMAIL_OR_PHONE_REQUIRED,
      });
    }
  });

/** Credentials used to log in. Derived from `loginInputSchema`. */
export type ILoginInput = z.infer<typeof loginInputSchema>;
