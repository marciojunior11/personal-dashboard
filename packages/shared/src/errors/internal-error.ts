import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";

/**
 * An unexpected failure, not caused by the client. It never carries issues:
 * the client can neither fix it nor needs its details.
 */
export class InternalError extends BaseError {
  readonly code: string = ErrorCode.INTERNAL;

  constructor(
    message = "Ocorreu um erro inesperado. Tente novamente mais tarde.",
  ) {
    super(message);
  }
}
