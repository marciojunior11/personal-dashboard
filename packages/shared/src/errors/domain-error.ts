import type { MessageCode, MessageParams } from "@personal-dashboard/i18n";
import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IFieldIssue } from "./error-issue.js";

/** The operation breaks a domain rule. */
export class DomainError extends BaseError {
  constructor(
    code: MessageCode = ErrorCode.DOMAIN_RULE_BROKEN,
    params?: MessageParams,
    issues?: readonly IFieldIssue[],
  ) {
    super(code, params, issues);
  }
}
