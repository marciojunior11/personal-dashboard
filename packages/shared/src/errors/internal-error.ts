import { BaseError } from "./base-error.js";

/** An unexpected failure, not caused by the client. */
export class InternalError extends BaseError {
  readonly code = "IE-001";

  constructor(message = "Ocorreu um erro interno inesperado.") {
    super(message);
  }
}
