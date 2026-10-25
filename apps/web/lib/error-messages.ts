import common from "@personal-dashboard/i18n/locales/pt-BR/common.json";
import identity from "@personal-dashboard/i18n/locales/pt-BR/identity.json";
import {
  CommonErrorCodes,
  type CommonErrorCode,
} from "@personal-dashboard/shared/common";
import {
  IdentityErrorCodes,
  type IdentityErrorCode,
} from "@personal-dashboard/shared/identity";

/**
 * Interim: the pt-BR text of each error code the shared schemas can raise in
 * the browser. Errors from the API arrive already translated; this covers
 * only the validation done before submitting. It is replaced when the
 * client's i18n resources are defined.
 */
export const ERROR_MESSAGES: Readonly<
  Partial<Record<CommonErrorCode | IdentityErrorCode, string>>
> = {
  [CommonErrorCodes.INVALID_INPUT]: common.errors.invalidInput,
  [CommonErrorCodes.FULL_NAME_REQUIRED]: common.fullName.required,
  [CommonErrorCodes.FULL_NAME_MISSING_SURNAME]: common.fullName.missingSurname,
  [CommonErrorCodes.FULL_NAME_TOO_LONG]: common.fullName.tooLong,
  [CommonErrorCodes.FULL_NAME_INVALID_CHARACTERS]:
    common.fullName.invalidCharacters,
  [CommonErrorCodes.EMAIL_INVALID]: common.email.invalid,
  [CommonErrorCodes.PHONE_NUMBER_INVALID]: common.phoneNumber.invalid,
  [CommonErrorCodes.BIRTH_DATE_REQUIRED]: common.birthDate.required,
  [CommonErrorCodes.BIRTH_DATE_INVALID_FORMAT]: common.birthDate.invalidFormat,
  [CommonErrorCodes.BIRTH_DATE_INVALID]: common.birthDate.invalid,
  [CommonErrorCodes.BIRTH_DATE_IN_FUTURE]: common.birthDate.inFuture,
  [IdentityErrorCodes.PASSWORD_REQUIRED]: identity.password.required,
  [IdentityErrorCodes.PASSWORD_CONFIRMATION_REQUIRED]:
    identity.password.confirmationRequired,
  [IdentityErrorCodes.PASSWORD_CONFIRMATION_MISMATCH]:
    identity.password.confirmationMismatch,
  [IdentityErrorCodes.EMAIL_OR_PHONE_REQUIRED]:
    identity.contact.emailOrPhoneRequired,
};
