import { DEFAULT_LOCALE, type Locale } from "@personal-dashboard/i18n";
import type { BaseError, ErrorJson } from "../errors/base-error.js";

/** Wire format of an `ApiResult`, as received by API clients. */
export interface ApiResultJson<T = void> {
  isSuccess: boolean;
  isFailure: boolean;
  value: T | null;
  error: ErrorJson | null;
}

/**
 * Standard return structure for any API method.
 *
 * `ApiResult` (no type argument) carries no value; `ApiResult<T>` carries a
 * `T` on success. Instances are built through the static factories
 * (`success` / `failure`), never with `new`.
 */
export class ApiResult<T = void> {
  private constructor(
    public readonly value: T | null,
    public readonly error: BaseError | null,
  ) {}

  /** `true` if and only if there is no error. */
  get isSuccess(): boolean {
    return this.error === null;
  }

  /** `true` if and only if there is an error. */
  get isFailure(): boolean {
    return this.error !== null;
  }

  /** Builds a successful result without value. */
  static success(): ApiResult;
  /** Builds a successful result carrying `value`. */
  static success<T>(value: T): ApiResult<T>;
  static success<T>(value?: T): ApiResult<T | void> {
    return new ApiResult(value ?? null, null);
  }

  /**
   * Builds a failed result carrying `error`, with no value. Its type fits any
   * `ApiResult<T>`.
   */
  static failure(error: BaseError): ApiResult<never> {
    return new ApiResult<never>(null, error);
  }

  /**
   * The result as clients receive it: includes `isSuccess` / `isFailure` and
   * lets the error serialize itself, with its messages in `locale`. The stack
   * is never exposed.
   */
  serialize(locale: Locale): ApiResultJson<T> {
    return {
      isSuccess: this.isSuccess,
      isFailure: this.isFailure,
      value: this.value,
      error: this.error?.serialize(locale) ?? null,
    };
  }

  /** Called by `JSON.stringify`, in the default locale. */
  toJSON(): ApiResultJson<T> {
    return this.serialize(DEFAULT_LOCALE);
  }
}
