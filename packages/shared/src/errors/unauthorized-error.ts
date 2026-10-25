import { CommonErrorCodes } from "../common/common-error-codes.js";
import { BaseError } from "./base-error.js";
import type { ErrorParams, IFieldIssue } from "./error-issue.js";

/** The request requires authentication. */
export class UnauthorizedError extends BaseError {
  constructor(
    code: string = CommonErrorCodes.UNAUTHORIZED,
    params?: ErrorParams,
    issues?: readonly IFieldIssue[],
  ) {
    super(code, params, issues);
  }
}
