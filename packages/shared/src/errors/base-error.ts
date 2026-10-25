import type { IErrorIssue } from "./error-issue.js";

/** Wire format of an error, as received by API clients. */
export interface ErrorJson {
  /** The category, e.g. `ConflictError`. */
  name: string;
  /** Why it failed; see `ErrorCode` for the generic ones. */
  code: string;
  message: string;
  /** Problems tied to input fields; present only when there are any. */
  issues?: IErrorIssue[];
}

/**
 * Base class for every application error. The class is the category (and so
 * the HTTP status); `code` is the reason, and `issues` say which input fields
 * it concerns, if any.
 *
 * Each category declares its generic `code` (from `ErrorCode`) and a default
 * message. A case the client must tell apart gets its own subclass, which
 * overrides `code` and carries its message, so a `throw` never spells them out.
 */
export abstract class BaseError extends Error {
  /** Stable identifier of the error, used by clients to handle it. */
  abstract readonly code: string;

  protected constructor(
    message: string,
    public readonly issues: readonly IErrorIssue[] = [],
  ) {
    super(message);
    this.name = new.target.name;
  }

  /** Called by `JSON.stringify`. The stack is never exposed. */
  toJSON(): ErrorJson {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      ...(this.issues.length > 0 && { issues: [...this.issues] }),
    };
  }
}
