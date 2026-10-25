import type { MessageCode, MessageParams } from "@personal-dashboard/i18n";
import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IFieldIssue } from "./error-issue.js";

/** The operation conflicts with the current state (e.g. duplicated resource). */
export class ConflictError extends BaseError {
  constructor(
    code: MessageCode = ErrorCode.CONFLICT,
    params?: MessageParams,
    issues?: readonly IFieldIssue[],
  ) {
    super(code, params, issues);
  }
}
