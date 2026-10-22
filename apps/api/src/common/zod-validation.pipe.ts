import { Injectable, type PipeTransform } from '@nestjs/common';
import {
  ValidationError,
  type FieldErrors,
} from '@personal-dashboard/shared/errors';
import type { z } from 'zod';

/**
 * Validates a request value against a zod schema. Invalid values throw a
 * `ValidationError` with the messages grouped by field (`a.b` for nested ones).
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: z.ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join('.');
      (errors[field] ??= []).push(issue.message);
    }
    throw new ValidationError(errors);
  }
}
