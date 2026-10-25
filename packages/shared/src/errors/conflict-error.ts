import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IErrorIssue } from "./error-issue.js";

/** The operation conflicts with the current state (e.g. duplicated resource). */
export class ConflictError extends BaseError {
  readonly code: string = ErrorCode.CONFLICT;

  constructor(
    message = "O recurso já existe ou conflita com o estado atual.",
    issues?: readonly IErrorIssue[],
  ) {
    super(message, issues);
  }
}
