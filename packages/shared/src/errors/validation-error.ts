import type { MessageCode } from "@personal-dashboard/i18n";
import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IFieldIssue } from "./error-issue.js";

/** The input does not follow the contract; each issue names its field. */
export class ValidationError extends BaseError {
  constructor(
    issues: readonly IFieldIssue[],
    code: MessageCode = ErrorCode.INVALID_INPUT,
  ) {
    super(code, undefined, issues);
  }
}
