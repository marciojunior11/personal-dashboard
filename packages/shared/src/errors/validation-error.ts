import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IErrorIssue } from "./error-issue.js";

/** The input does not follow the contract; each issue names its field. */
export class ValidationError extends BaseError {
  readonly code: string = ErrorCode.INVALID_INPUT;

  constructor(
    issues: readonly IErrorIssue[],
    message = "Os dados informados são inválidos.",
  ) {
    super(message, issues);
  }
}
