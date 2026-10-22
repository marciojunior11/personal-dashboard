import { z } from "zod";

/** A string whose missing/wrong-type error uses `message` instead of zod's default. */
const requiredString = (message: string) => z.string({ error: message });

const ONE_IDENTIFIER_MESSAGE = "Informe ao menos um e-mail ou celular.";

/** Validates the data required to register a new user. */
export const registerInputSchema = z
  .object({
    nomeCompleto: requiredString("O nome completo é obrigatório.")
      .trim()
      .min(1, "O nome completo é obrigatório."),
    /** ISO 8601 date (`YYYY-MM-DD`). */
    dataNascimento: z.iso.date("Use o formato AAAA-MM-DD."),
    email: z.email("E-mail inválido.").optional(),
    celular: z
      .string({ error: "Celular inválido." })
      .regex(/^[\d\s()+-]{10,}$/, "Celular inválido.")
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
