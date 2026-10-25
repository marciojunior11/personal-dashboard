import { Injectable, type PipeTransform } from '@nestjs/common';
import {
  ErrorCode,
  ValidationError,
  type IErrorIssue,
} from '@personal-dashboard/shared/errors';
import type { z } from 'zod';

/**
 * Validates a request value against a zod schema. Invalid values throw a
 * `ValidationError` with one issue per field (`a.b` for nested ones): zod
 * checks every field, so the client gets all of them at once. When a field
 * breaks several rules, the first one is reported, as the form shows it.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: z.ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    const issues = new Map<string, IErrorIssue>();
    for (const { path, message } of result.error.issues) {
      const field = path.join('.');
      if (!issues.has(field)) {
        issues.set(field, { field, code: ErrorCode.INVALID_INPUT, message });
      }
    }
    throw new ValidationError([...issues.values()]);
  }
}
