import { BaseError } from "./base-error.js";

/** The requested resource does not exist. */
export class NotFoundError extends BaseError {
  readonly code = "NFE-001";

  constructor(message = "Recurso não encontrado.") {
    super(message);
  }
}
