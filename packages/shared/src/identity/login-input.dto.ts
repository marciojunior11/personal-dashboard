import { z } from "zod";

const ONE_IDENTIFIER_MESSAGE = "Informe o e-mail ou o celular.";

/** Validates the credentials used to log in, by e-mail or phone. */
export const loginInputSchema = z
  .object({
    email: z.email("E-mail inválido.").optional(),
    celular: z
      .string({ error: "Celular inválido." })
      .min(1, "Celular inválido.")
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
