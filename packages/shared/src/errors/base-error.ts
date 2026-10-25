import type { ErrorParams, IErrorIssue, IFieldIssue } from "./error-issue.js";

/** Wire format of an error, as received by API clients. */
export interface ErrorJson {
  /** The category, e.g. `ConflictError`. */
  name: string;
  /** What kind of error happened, from a module's error codes. */
  code: string;
  /** The message, in the client's locale. */
  message: string;
  /** Problems tied to input fields; present only when there are any. */
  issues?: IErrorIssue[];
}

/**
 * Base class for every application error. The class is the category (and so
 * the HTTP status); `code` reports what kind of error happened, and `issues`
 * which input fields it concerns, if any.
 *
 * Errors hold no text and know nothing about translation: the API's
 * presentation layer picks the message for each code, in the client's
 * locale. `message` is the code itself, which keeps logs stable.
 */
export abstract class BaseError extends Error {
  protected constructor(
    /** What kind of error happened; clients branch on it. */
    public readonly code: string,
    /** Values the message needs (e.g. `{ max: 150 }`). */
    public readonly params?: ErrorParams,
    public readonly issues: readonly IFieldIssue[] = [],
  ) {
    super(code);
    this.name = new.target.name;
  }
}
