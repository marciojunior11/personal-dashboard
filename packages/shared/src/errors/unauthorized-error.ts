import { BaseError } from "./base-error.js";

/** The request requires authentication. */
export class UnauthorizedError extends BaseError {
  readonly code = "UE-001";

  constructor(message = "É necessário estar autenticado.") {
    super(message);
  }
}
