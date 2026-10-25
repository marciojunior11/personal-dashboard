import type { MessageCode, MessageParams } from "@personal-dashboard/i18n";

/**
 * Why a value breaks a format rule: a message code and its params, never a
 * text, so each side translates it in its own locale.
 */
export interface IRuleViolation {
  code: MessageCode;
  params?: MessageParams;
}
