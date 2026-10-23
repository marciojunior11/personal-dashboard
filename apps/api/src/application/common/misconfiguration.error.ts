/**
 * The system is not set up the way it must be to run (e.g. a required plan is
 * missing from the catalog). The client neither caused it nor can fix it.
 *
 * Deliberately not a `BaseError`: it is not part of the API contract. The
 * exception filter logs it with its details and answers a generic
 * `InternalError`, so the client only learns that it should try again later.
 */
export class MisconfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
