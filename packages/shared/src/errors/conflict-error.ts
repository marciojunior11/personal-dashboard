import { CommonErrorCodes } from "../common/common-error-codes.js";
import { BaseError } from "./base-error.js";
import type { ErrorParams, IFieldIssue } from "./error-issue.js";

/** The operation conflicts with the current state (e.g. duplicated resource). */
export class ConflictError extends BaseError {
  constructor(
    code: string = CommonErrorCodes.CONFLICT,
    params?: ErrorParams,
    issues?: readonly IFieldIssue[],
  ) {
    super(code, params, issues);
  }
}
