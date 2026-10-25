import type { ErrorParams } from "../errors/error-issue.js";

/**
 * Why a value breaks a format rule: an error code and its params, never a
 * text, so each side picks the message in its own locale.
 */
export interface IRuleViolation {
  code: string;
  params?: ErrorParams;
}
