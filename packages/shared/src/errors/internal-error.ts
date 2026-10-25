import { BaseError } from "./base-error.js";
import { ErrorCode } from "./error-codes.js";

/**
 * An unexpected failure, not caused by the client. It never carries issues
 * or a specific code: the client can neither fix it nor needs its details.
 */
export class InternalError extends BaseError {
  constructor() {
    super(ErrorCode.INTERNAL);
  }
}
