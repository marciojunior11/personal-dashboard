import { CommonErrorCodes } from "../common/common-error-codes.js";
import { BaseError } from "./base-error.js";
import type { IFieldIssue } from "./error-issue.js";

/** The input does not follow the contract; each issue names its field. */
export class ValidationError extends BaseError {
  constructor(
    issues: readonly IFieldIssue[],
    code: string = CommonErrorCodes.INVALID_INPUT,
  ) {
    super(code, undefined, issues);
  }
}
