import { CommonErrorCodes } from "../common/common-error-codes.js";
import { BaseError } from "./base-error.js";
import type { ErrorParams, IFieldIssue } from "./error-issue.js";

/** The operation breaks a domain rule. */
export class DomainError extends BaseError {
  constructor(
    code: string = CommonErrorCodes.DOMAIN_RULE_BROKEN,
    params?: ErrorParams,
    issues?: readonly IFieldIssue[],
  ) {
    super(code, params, issues);
  }
}
