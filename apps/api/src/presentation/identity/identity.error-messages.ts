import type { IdentityErrorCode } from '@personal-dashboard/shared/identity';
import type { I18nPath } from '@generated/i18n';

/** Catalog key of each identity error code; every code needs an existing key. */
export const identityErrorMessages: Readonly<
  Record<IdentityErrorCode, I18nPath>
> = {
  PASSWORD_REQUIRED: 'identity.password.required',
  PASSWORD_CONFIRMATION_REQUIRED: 'identity.password.confirmationRequired',
  PASSWORD_CONFIRMATION_MISMATCH: 'identity.password.confirmationMismatch',
  EMAIL_OR_PHONE_REQUIRED: 'identity.contact.emailOrPhoneRequired',

  USER_EMAIL_OR_PHONE_REQUIRED: 'identity.user.emailOrPhoneRequired',
  USER_PASSWORD_REQUIRED: 'identity.user.passwordRequired',
  USER_ID_TAKEN: 'identity.user.idTaken',

  ORGANIZATION_NAME_INVALID_LENGTH: 'identity.organization.nameLength',
  ORGANIZATION_ALREADY_BUSINESS: 'identity.organization.alreadyBusiness',
  ORGANIZATION_ID_TAKEN: 'identity.organization.idTaken',

  ORGANIZATION_MEMBER_INCOMPLETE: 'identity.organizationMember.incomplete',
  ORGANIZATION_MEMBER_SAME_ROLE: 'identity.organizationMember.sameRole',
  ORGANIZATION_MEMBER_DUPLICATED: 'identity.organizationMember.duplicated',
};
