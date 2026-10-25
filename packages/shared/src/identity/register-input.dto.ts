import { z } from "zod";
import { CommonErrorCodes } from "../common/common-error-codes.js";
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
import { IdentityErrorCodes } from "./identity-error-codes.js";

/** A string whose missing/wrong-type error is `code` instead of zod's default. */
const requiredString = (code: string) => z.string({ error: code });

/**
 * Validates the data required to register a new user. Field formats use the
 * same rules as the domain's value objects, so every field error is caught
 * here, by its field, before the request reaches the domain.
 */
export const registerInputSchema = z
  .object({
    nomeCompleto: requiredString(CommonErrorCodes.FULL_NAME_REQUIRED)
      .trim()
      .min(1, CommonErrorCodes.FULL_NAME_REQUIRED)
      .transform(normalizeFullName)
      .superRefine(rule(checkFullName)),
    /** ISO 8601 date (`YYYY-MM-DD`). */
    dataNascimento: requiredString(CommonErrorCodes.BIRTH_DATE_REQUIRED)
      .trim()
      .min(1, CommonErrorCodes.BIRTH_DATE_REQUIRED)
      .transform(normalizeBirthDate)
      .superRefine(rule(checkBirthDate)),
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
    senha: requiredString(IdentityErrorCodes.PASSWORD_REQUIRED).min(
      1,
      IdentityErrorCodes.PASSWORD_REQUIRED,
    ),
    confirmacaoSenha: requiredString(
      IdentityErrorCodes.PASSWORD_CONFIRMATION_REQUIRED,
    ),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    path: ["confirmacaoSenha"],
    message: IdentityErrorCodes.PASSWORD_CONFIRMATION_MISMATCH,
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

/** Data required to register a new user. Derived from `registerInputSchema`. */
export type IRegisterInput = z.infer<typeof registerInputSchema>;
