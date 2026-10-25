import type { MessageCode, MessageParams } from "@personal-dashboard/i18n";
import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IFieldIssue } from "./error-issue.js";

/** The authenticated user lacks permission for the action. */
export class ForbiddenError extends BaseError {
  constructor(
    code: MessageCode = ErrorCode.FORBIDDEN,
    params?: MessageParams,
    issues?: readonly IFieldIssue[],
  ) {
    super(code, params, issues);
  }
}
