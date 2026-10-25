import { BILLING_MESSAGES } from "./billing.messages.js";
import { COMMON_MESSAGES } from "./common.messages.js";
import { IDENTITY_MESSAGES } from "./identity.messages.js";

/**
 * The pt-BR catalog, source of truth of every message code: other locales
 * are typed from it, so a locale missing a code does not compile.
 */
export const PT_BR = {
  ...COMMON_MESSAGES,
  ...IDENTITY_MESSAGES,
  ...BILLING_MESSAGES,
} as const;
