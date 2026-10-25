import type { ErrorJson } from "../errors/base-error.js";
import type { IErrorIssue } from "../errors/error-issue.js";

/**
 * Questions clients ask about an error received as JSON. `instanceof` does
 * not work there: `JSON.parse` yields plain objects, not error classes.
 */

/** Whether the error concerns input fields, to show each issue by its field. */
export function hasIssues(
  error: ErrorJson | null | undefined,
): error is ErrorJson & { issues: IErrorIssue[] } {
  return (error?.issues?.length ?? 0) > 0;
}

/** Whether the error has the given code, to react to that specific case. */
export function hasCode(
  error: ErrorJson | null | undefined,
  code: string,
): boolean {
  return error?.code === code;
}
