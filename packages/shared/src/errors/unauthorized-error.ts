import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IErrorIssue } from "./error-issue.js";

/** The request requires authentication. */
export class UnauthorizedError extends BaseError {
  readonly code: string = ErrorCode.UNAUTHORIZED;

  constructor(
    message = "É necessário estar autenticado.",
    issues?: readonly IErrorIssue[],
  ) {
    super(message, issues);
  }
}
