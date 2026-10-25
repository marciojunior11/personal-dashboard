/** Messages of the identity module: users, organizations and their members. */
export const IDENTITY_MESSAGES = {
  PASSWORD_REQUIRED: "A senha é obrigatória.",
  PASSWORD_CONFIRMATION_REQUIRED: "A confirmação de senha é obrigatória.",
  PASSWORD_CONFIRMATION_MISMATCH: "A confirmação de senha não confere.",
  EMAIL_OR_PHONE_REQUIRED: "Informe ao menos um e-mail ou celular.",

  USER_EMAIL_OR_PHONE_REQUIRED:
    "O usuário deve ter ao menos um e-mail ou celular.",
  USER_PASSWORD_REQUIRED: "O usuário deve ter uma senha.",
  USER_ID_TAKEN: "Já existe um usuário com o id {id}.",

  ORGANIZATION_NAME_LENGTH:
    "O nome da organização deve ter entre {min} e {max} caracteres.",
  ORGANIZATION_ALREADY_BUSINESS: "A organização já é do tipo empresa.",
  ORGANIZATION_ID_TAKEN: "Já existe uma organização com o id {id}.",

  ORGANIZATION_MEMBER_INCOMPLETE:
    "O vínculo deve pertencer a um usuário e a uma organização.",
  ORGANIZATION_MEMBER_SAME_ROLE: "O vínculo já possui esse papel.",
  ORGANIZATION_MEMBER_DUPLICATED: "O usuário já é membro desta organização.",
} as const;
