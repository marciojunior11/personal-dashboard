import { MessageCode } from "@personal-dashboard/i18n";
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
} from "../rules/index.js";
import { rule } from "../utils/index.js";

/** A string whose missing/wrong-type error is `code` instead of zod's default. */
const requiredString = (code: MessageCode) => z.string({ error: code });

/**
 * Validates the data required to register a new user. Field formats use the
 * same rules as the domain's value objects, so every field error is caught
 * here, by its field, before the request reaches the domain.
 */
export const registerInputSchema = z
  .object({
    nomeCompleto: requiredString(MessageCode.FULL_NAME_REQUIRED)
      .trim()
      .min(1, MessageCode.FULL_NAME_REQUIRED)
      .transform(normalizeFullName)
      .superRefine(rule(checkFullName)),
    /** ISO 8601 date (`YYYY-MM-DD`). */
    dataNascimento: requiredString(MessageCode.BIRTH_DATE_REQUIRED)
      .trim()
      .min(1, MessageCode.BIRTH_DATE_REQUIRED)
      .transform(normalizeBirthDate)
      .superRefine(rule(checkBirthDate)),
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
    senha: requiredString(MessageCode.PASSWORD_REQUIRED).min(
      1,
      MessageCode.PASSWORD_REQUIRED,
    ),
    confirmacaoSenha: requiredString(
      MessageCode.PASSWORD_CONFIRMATION_REQUIRED,
    ),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    path: ["confirmacaoSenha"],
    message: MessageCode.PASSWORD_CONFIRMATION_MISMATCH,
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

/** Data required to register a new user. Derived from `registerInputSchema`. */
export type IRegisterInput = z.infer<typeof registerInputSchema>;
