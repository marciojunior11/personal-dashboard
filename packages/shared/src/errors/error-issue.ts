/** Values an error carries for its message (e.g. `{ max: 150 }`); data, not text. */
export type ErrorParams = Record<string, string | number>;

/**
 * One problem tied to an input field, as an error carries it: a code and its
 * params, no text. Any error category may carry issues: a conflict (e-mail
 * already registered) can belong to a field just like an invalid format.
 */
export interface IFieldIssue {
  /** Path of the input field; nested fields use dots (`address.street`). */
  field: string;
  /** What kind of problem the field has, from a module's error codes. */
  code: string;
  params?: ErrorParams;
}

/** An issue as clients receive it: with its message, in their locale. */
export interface IErrorIssue extends IFieldIssue {
  message: string;
}
