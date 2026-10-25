import { CommonErrorCodes } from "../common/common-error-codes.js";
import { BaseError } from "./base-error.js";
import type { ErrorParams, IFieldIssue } from "./error-issue.js";

/** The authenticated user lacks permission for the action. */
export class ForbiddenError extends BaseError {
  constructor(
    code: string = CommonErrorCodes.FORBIDDEN,
    params?: ErrorParams,
    issues?: readonly IFieldIssue[],
  ) {
    super(code, params, issues);
  }
}
