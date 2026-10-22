import { BaseError } from "./base-error.js";

/** The authenticated user lacks permission for the action. */
export class ForbiddenError extends BaseError {
  readonly code = "FE-001";

  constructor(message = "Você não tem permissão para realizar esta ação.") {
    super(message);
  }
}
