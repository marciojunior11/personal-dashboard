/** Wire format of an error, as received by API clients. */
export interface ErrorJson {
  name: string;
  code: string;
  message: string;
  /** Extra error details, present only on errors that carry them. */
  data?: unknown;
}

/**
 * Base class for every application error.
 *
 * Each subclass declares its own `code`, following the `<INITIALS>-<NNN>`
 * convention (e.g. `NFE-001` for `NotFoundError`), and a default message.
 */
export abstract class BaseError extends Error {
  /** Stable identifier of the error, used by clients to handle it. */
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }

  /** Called by `JSON.stringify`; subclasses add their own details. */
  toJSON(): ErrorJson {
    return { name: this.name, code: this.code, message: this.message };
  }
}
