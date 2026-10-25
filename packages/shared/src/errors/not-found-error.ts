import { CommonErrorCodes } from "../common/common-error-codes.js";
import { BaseError } from "./base-error.js";
import type { ErrorParams, IFieldIssue } from "./error-issue.js";

/** The requested resource does not exist. */
export class NotFoundError extends BaseError {
  constructor(
    code: string = CommonErrorCodes.NOT_FOUND,
    params?: ErrorParams,
    issues?: readonly IFieldIssue[],
  ) {
    super(code, params, issues);
  }
}
