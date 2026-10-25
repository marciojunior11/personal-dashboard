import { z } from "zod";
import {
  checkBirthDate,
  checkEmail,
  checkFullName,
  checkPhoneNumber,
  normalizeBirthDate,
  normalizeEmail,
  normalizeFullName,
  normalizePhoneNumber,
  rule,
} from "../common/rules/index.js";

/** A string whose missing/wrong-type error uses `message` instead of zod's default. */
const requiredString = (message: string) => z.string({ error: message });

const ONE_IDENTIFIER_MESSAGE = "Informe ao menos um e-mail ou celular.";

/**
 * Validates the data required to register a new user. Field formats use the
 * same rules as the domain's value objects, so every field error is caught
 * here, by its field, before the request reaches the domain.
 */
export const registerInputSchema = z
  .object({
    nomeCompleto: requiredString("O nome completo é obrigatório.")
      .trim()
      .min(1, "O nome completo é obrigatório.")
      .transform(normalizeFullName)
      .superRefine(rule(checkFullName)),
    /** ISO 8601 date (`YYYY-MM-DD`). */
    dataNascimento: requiredString("A data de nascimento é obrigatória.")
      .trim()
      .min(1, "A data de nascimento é obrigatória.")
      .transform(normalizeBirthDate)
      .superRefine(rule(checkBirthDate)),
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
    senha: requiredString("A senha é obrigatória.").min(
      1,
      "A senha é obrigatória.",
    ),
    confirmacaoSenha: requiredString("A confirmação de senha é obrigatória."),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    path: ["confirmacaoSenha"],
    message: "A confirmação de senha não confere.",
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

/** Data required to register a new user. Derived from `registerInputSchema`. */
export type IRegisterInput = z.infer<typeof registerInputSchema>;
