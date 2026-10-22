import { BaseError } from "./base-error.js";

/** The operation breaks a domain rule. */
export class DomainError extends BaseError {
  readonly code = "DE-001";

  constructor(message = "A operação viola uma regra de domínio.") {
    super(message);
  }
}
