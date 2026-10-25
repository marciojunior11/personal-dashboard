import { ValidationError } from '@personal-dashboard/shared/errors';
import { z } from 'zod';
import { ZodValidationPipe } from '@common';

const schema = z.object({
  name: z.string().min(1, 'Obrigatório.').max(3, 'Muito longo.'),
  address: z.object({ street: z.string().min(3, 'Muito curto.') }),
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

  it('reports every invalid field at once, by field path', () => {
    expect(invalidIssues({ name: '', address: { street: 'R' } })).toEqual([
      { field: 'name', code: 'INVALID_INPUT', message: 'Obrigatório.' },
      {
        field: 'address.street',
        code: 'INVALID_INPUT',
        message: 'Muito curto.',
      },
    ]);
  });

  it('reports only the first broken rule of a field', () => {
    const issues = invalidIssues({
      name: 123,
      address: { street: 'Rua A' },
    });

    expect(issues).toHaveLength(1);
    expect(issues[0].field).toBe('name');
  });
});
