/**
 * Messages shared by every module: the generic code of each error category
 * and the format rules of fields any module may have (name, e-mail, phone,
 * birth date, money).
 */
export const COMMON_MESSAGES = {
  INVALID_INPUT: "Os dados informados são inválidos.",
  DOMAIN_RULE_BROKEN: "A operação viola uma regra de domínio.",
  NOT_FOUND: "Recurso não encontrado.",
  CONFLICT: "O recurso já existe ou conflita com o estado atual.",
  UNAUTHORIZED: "É necessário estar autenticado.",
  FORBIDDEN: "Você não tem permissão para realizar esta ação.",
  INTERNAL: "Ocorreu um erro inesperado. Tente novamente mais tarde.",

  FULL_NAME_REQUIRED: "O nome completo é obrigatório.",
  FULL_NAME_MISSING_SURNAME: "O nome completo deve conter nome e sobrenome.",
  FULL_NAME_TOO_LONG: "O nome completo deve ter no máximo {max} caracteres.",
  FULL_NAME_INVALID_CHARACTERS: "O nome completo contém caracteres inválidos.",

  EMAIL_INVALID: "E-mail inválido.",

  PHONE_NUMBER_INVALID: "Número de celular inválido.",

  BIRTH_DATE_REQUIRED: "A data de nascimento é obrigatória.",
  BIRTH_DATE_INVALID_FORMAT:
    "Data de nascimento inválida. Use o formato AAAA-MM-DD.",
  BIRTH_DATE_INVALID: "Data de nascimento inválida.",
  BIRTH_DATE_IN_FUTURE: "A data de nascimento não pode estar no futuro.",

  MONEY_INVALID_CENTS: "O valor deve ser um número inteiro de centavos.",
} as const;
