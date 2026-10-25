import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";
import type { IErrorIssue } from "./error-issue.js";

/** The authenticated user lacks permission for the action. */
export class ForbiddenError extends BaseError {
  readonly code: string = ErrorCode.FORBIDDEN;

  constructor(
    message = "Você não tem permissão para realizar esta ação.",
    issues?: readonly IErrorIssue[],
  ) {
    super(message, issues);
  }
}
