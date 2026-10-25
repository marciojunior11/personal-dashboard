import { MessageCode } from '@personal-dashboard/i18n';
import { ValidationError } from '@personal-dashboard/shared/errors';
import { z } from 'zod';
import { ZodValidationPipe } from '@common';

const schema = z.object({
  name: z
    .string({ error: MessageCode.FULL_NAME_REQUIRED })
    .min(1, MessageCode.FULL_NAME_REQUIRED)
    .superRefine((value, ctx) => {
      if (value.length > 3) {
        ctx.addIssue({
          code: 'custom',
          message: MessageCode.FULL_NAME_TOO_LONG,
          params: { max: 3 },
        });
      }
    }),
  address: z.object({ street: z.string().min(3, MessageCode.INVALID_INPUT) }),
  age: z.number().optional(),
});

const invalidIssues = (value: unknown) => {
  try {
    new ZodValidationPipe(schema).transform(value);
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues;
  }
  throw new Error('Expected a ValidationError.');
};

describe('ZodValidationPipe', () => {
  it('returns the parsed value when valid', () => {
    const value = { name: 'Ana', address: { street: 'Rua A' } };
    expect(new ZodValidationPipe(schema).transform(value)).toEqual(value);
  });

  it('reports every invalid field at once, by field path, with its code', () => {
    expect(invalidIssues({ name: '', address: { street: 'R' } })).toEqual([
      { field: 'name', code: 'FULL_NAME_REQUIRED' },
      { field: 'address.street', code: 'INVALID_INPUT' },
    ]);
  });

  it('keeps the params of a rule issue', () => {
    expect(
      invalidIssues({ name: 'Maria', address: { street: 'Rua A' } }),
    ).toEqual([
      { field: 'name', code: 'FULL_NAME_TOO_LONG', params: { max: 3 } },
    ]);
  });

  it("files zod's own messages under the generic code", () => {
    expect(
      invalidIssues({ name: 'Ana', address: { street: 'Rua A' }, age: 'x' }),
    ).toEqual([{ field: 'age', code: 'INVALID_INPUT' }]);
  });

  it('reports only the first broken rule of a field', () => {
    const issues = invalidIssues({ name: 123, address: { street: 'Rua A' } });

    expect(issues).toHaveLength(1);
    expect(issues[0].field).toBe('name');
  });
});
