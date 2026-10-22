import { BaseError, type ErrorJson } from "./base-error.js";

/**
 * Validation messages grouped by field name, so the client can show each
 * message next to its field. Nested fields use dot paths (`address.street`).
 */
export type FieldErrors<TField extends string = string> = Partial<
  Record<TField, string[]>
>;

/** The input data is invalid. */
export class ValidationError<
  TField extends string = string,
> extends BaseError {
  readonly code = "VE-001";

  constructor(
    public readonly data: FieldErrors<TField>,
    message = "Os dados informados são inválidos.",
  ) {
    super(message);
  }

  override toJSON(): ErrorJson & { data: FieldErrors<TField> } {
    return { ...super.toJSON(), data: this.data };
  }
}
