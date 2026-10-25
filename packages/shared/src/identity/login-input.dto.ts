import { MessageCode } from "@personal-dashboard/i18n";
import { z } from "zod";
import {
  checkEmail,
  checkPhoneNumber,
  normalizeEmail,
  normalizePhoneNumber,
} from "../common/rules/index.js";
import { rule } from "../utils/index.js";

/**
 * Validates the credentials used to log in, by e-mail or phone. Identifiers
 * are normalized with the same rules used on sign-up, so they match the
 * stored values however the user typed them.
 */
export const loginInputSchema = z
  .object({
    email: z
      .string({ error: MessageCode.EMAIL_INVALID })
      .transform(normalizeEmail)
      .superRefine(rule(checkEmail))
      .optional(),
    celular: z
      .string({ error: MessageCode.PHONE_NUMBER_INVALID })
      .transform(normalizePhoneNumber)
      .superRefine(rule(checkPhoneNumber))
      .optional(),
    senha: z
      .string({ error: MessageCode.PASSWORD_REQUIRED })
      .min(1, MessageCode.PASSWORD_REQUIRED),
  })
  .superRefine((data, ctx) => {
    if (data.email || data.celular) return;
    for (const field of ["email", "celular"]) {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: MessageCode.EMAIL_OR_PHONE_REQUIRED,
      });
    }
  });

/** Credentials used to log in. Derived from `loginInputSchema`. */
export type ILoginInput = z.infer<typeof loginInputSchema>;
