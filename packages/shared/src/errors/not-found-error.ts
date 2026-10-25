import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IErrorIssue } from "./error-issue.js";

/** The requested resource does not exist. */
export class NotFoundError extends BaseError {
  readonly code: string = ErrorCode.NOT_FOUND;

  constructor(
    message = "Recurso não encontrado.",
    issues?: readonly IErrorIssue[],
  ) {
    super(message, issues);
  }
}
