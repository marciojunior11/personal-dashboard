import { z } from "zod";
import {
  checkEmail,
  checkPhoneNumber,
  normalizeEmail,
  normalizePhoneNumber,
} from "../common/rules/index.js";
import { rule } from "../utils/index.js";

const ONE_IDENTIFIER_MESSAGE = "Informe o e-mail ou o celular.";

/**
 * Validates the credentials used to log in, by e-mail or phone. Identifiers
 * are normalized with the same rules used on sign-up, so they match the
 * stored values however the user typed them.
 */
export const loginInputSchema = z
  .object({
    email: z
      .string({ error: "E-mail inválido." })
      .transform(normalizeEmail)
      .superRefine(rule(checkEmail))
      .optional(),
    celular: z
      .string({ error: "Celular inválido." })
      .transform(normalizePhoneNumber)
      .superRefine(rule(checkPhoneNumber))
      .optional(),
    senha: z
      .string({ error: "A senha é obrigatória." })
      .min(1, "A senha é obrigatória."),
  })
  .superRefine((data, ctx) => {
    if (data.email || data.celular) return;
    for (const field of ["email", "celular"]) {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: ONE_IDENTIFIER_MESSAGE,
      });
    }
  });

/** Credentials used to log in. Derived from `loginInputSchema`. */
export type ILoginInput = z.infer<typeof loginInputSchema>;
