import type { MessageCode, MessageParams } from "@personal-dashboard/i18n";
import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IFieldIssue } from "./error-issue.js";

/** The requested resource does not exist. */
export class NotFoundError extends BaseError {
  constructor(
    code: MessageCode = ErrorCode.NOT_FOUND,
    params?: MessageParams,
    issues?: readonly IFieldIssue[],
  ) {
    super(code, params, issues);
  }
}
