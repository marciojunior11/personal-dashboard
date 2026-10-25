import type { MessageCode, MessageParams } from "@personal-dashboard/i18n";
import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IFieldIssue } from "./error-issue.js";

/** The request requires authentication. */
export class UnauthorizedError extends BaseError {
  constructor(
    code: MessageCode = ErrorCode.UNAUTHORIZED,
    params?: MessageParams,
    issues?: readonly IFieldIssue[],
  ) {
    super(code, params, issues);
  }
}
