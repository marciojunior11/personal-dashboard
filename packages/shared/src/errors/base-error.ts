import {
  DEFAULT_LOCALE,
  translate,
  type Locale,
  type MessageCode,
  type MessageParams,
} from "@personal-dashboard/i18n";
import type { IErrorIssue, IFieldIssue } from "./error-issue.js";

/** Wire format of an error, as received by API clients. */
export interface ErrorJson {
  /** The category, e.g. `ConflictError`. */
  name: string;
  /** Why it failed; also the message key. */
  code: string;
  /** The message in the client's locale. */
  message: string;
  /** Problems tied to input fields; present only when there are any. */
  issues?: IErrorIssue[];
}

/**
 * Base class for every application error. The class is the category (and so
 * the HTTP status); `code` is the reason, and `issues` say which input fields
 * it concerns, if any.
 *
 * An error holds no text: its code is a key of `@personal-dashboard/i18n`,
 * translated when serialized, in the locale the client asked for. `message`
 * holds the default-locale text, for logs and tests.
 */
export abstract class BaseError extends Error {
  protected constructor(
    /** Stable identifier of the error, used by clients to handle it. */
    public readonly code: MessageCode,
    /** Values for the message placeholders. */
    public readonly params?: MessageParams,
    public readonly issues: readonly IFieldIssue[] = [],
  ) {
    super(translate(code, params));
    this.name = new.target.name;
  }

  /** The error as clients receive it, with its messages in `locale`. */
  serialize(locale: Locale): ErrorJson {
    return {
      name: this.name,
      code: this.code,
      message: translate(this.code, this.params, locale),
      ...(this.issues.length > 0 && {
        issues: this.issues.map((issue) => ({
          ...issue,
          message: translate(issue.code, issue.params, locale),
        })),
      }),
    };
  }

  /**
   * Called by `JSON.stringify`, in the default locale. The stack is never
   * exposed. To answer in the client's locale, call `serialize` instead.
   */
  toJSON(): ErrorJson {
    return this.serialize(DEFAULT_LOCALE);
  }
}
