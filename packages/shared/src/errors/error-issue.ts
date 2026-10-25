/**
 * One problem tied to an input field, so the client can show it next to that
 * field. Any error category may carry issues: a conflict (e-mail already
 * registered) can belong to a field just like an invalid format.
 */
export interface IErrorIssue {
  /** Path of the input field; nested fields use dots (`address.street`). */
  field: string;
  /** Why the field was rejected; lets the client react to a specific case. */
  code: string;
  message: string;
}
