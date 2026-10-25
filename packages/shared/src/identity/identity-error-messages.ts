import type { IdentityErrorCode } from "./identity-error-codes.js";

/**
 * Catalog key of each identity error code; see `CommonErrorMessages`.
 * Every code must have a key; the API checks that each key exists.
 */
export const IdentityErrorMessages = {
  PASSWORD_REQUIRED: "identity.password.required",
  PASSWORD_CONFIRMATION_REQUIRED: "identity.password.confirmationRequired",
  PASSWORD_CONFIRMATION_MISMATCH: "identity.password.confirmationMismatch",
  EMAIL_OR_PHONE_REQUIRED: "identity.contact.emailOrPhoneRequired",

  USER_EMAIL_OR_PHONE_REQUIRED: "identity.user.emailOrPhoneRequired",
  USER_PASSWORD_REQUIRED: "identity.user.passwordRequired",
  USER_ID_TAKEN: "identity.user.idTaken",

  ORGANIZATION_NAME_INVALID_LENGTH: "identity.organization.nameLength",
  ORGANIZATION_ALREADY_BUSINESS: "identity.organization.alreadyBusiness",
  ORGANIZATION_ID_TAKEN: "identity.organization.idTaken",

  ORGANIZATION_MEMBER_INCOMPLETE: "identity.organizationMember.incomplete",
  ORGANIZATION_MEMBER_SAME_ROLE: "identity.organizationMember.sameRole",
  ORGANIZATION_MEMBER_DUPLICATED: "identity.organizationMember.duplicated",
} as const satisfies Record<IdentityErrorCode, string>;
