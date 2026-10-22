import { BaseError } from "./base-error.js";

/** The operation conflicts with the current state (e.g. duplicated resource). */
export class ConflictError extends BaseError {
  readonly code = "CE-001";

  constructor(message = "O recurso já existe ou conflita com o estado atual.") {
    super(message);
  }
}
