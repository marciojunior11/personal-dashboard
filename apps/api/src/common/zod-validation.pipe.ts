import { Injectable, type PipeTransform } from '@nestjs/common';
import { isMessageCode, type MessageParams } from '@personal-dashboard/i18n';
import {
  ErrorCode,
  ValidationError,
  type IFieldIssue,
} from '@personal-dashboard/shared/errors';
import type { z } from 'zod';

/**
 * Validates a request value against a zod schema. Invalid values throw a
 * `ValidationError` with one issue per field (`a.b` for nested ones): zod
 * checks every field, so the client gets all of them at once. When a field
 * breaks several rules, the first one is reported, as the form shows it.
 *
 * The shared schemas use message codes as zod messages, so each issue keeps
 * its code and params, translated later in the client's locale. A message
 * that is not a code (zod's own text) becomes the generic `INVALID_INPUT`.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: z.ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    const issues = new Map<string, IFieldIssue>();
    for (const issue of result.error.issues) {
      const field = issue.path.join('.');
      if (issues.has(field)) continue;

      const params =
        'params' in issue ? (issue.params as MessageParams) : undefined;
      issues.set(field, {
        field,
        code: isMessageCode(issue.message)
          ? issue.message
          : ErrorCode.INVALID_INPUT,
        ...(params && { params }),
      });
    }
    throw new ValidationError([...issues.values()]);
  }
}
