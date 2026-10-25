import type { MessageCode, MessageParams } from "@personal-dashboard/i18n";

/**
 * One problem tied to an input field, as an error carries it: a code and its
 * params, translated only when the error is serialized. Any error category
 * may carry issues: a conflict (e-mail already registered) can belong to a
 * field just like an invalid format.
 */
export interface IFieldIssue {
  /** Path of the input field; nested fields use dots (`address.street`). */
  field: string;
  /** Why the field was rejected; also the message key. */
  code: MessageCode;
  /** Values for the message placeholders (e.g. `{ max: 150 }`). */
  params?: MessageParams;
}

/** An issue as clients receive it: with its message, in their locale. */
export interface IErrorIssue extends IFieldIssue {
  message: string;
}
