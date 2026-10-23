import { ValidationError } from '@personal-dashboard/shared/errors';
import { z } from 'zod';
import { ZodValidationPipe } from '@common';

const schema = z.object({
  name: z.string().min(1, 'Obrigatório.'),
  address: z.object({ street: z.string().min(3, 'Muito curto.') }),
});

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(schema);

  it('returns the parsed value when valid', () => {
    const value = { name: 'Maria', address: { street: 'Rua A' } };
    expect(pipe.transform(value)).toEqual(value);
  });

  it('throws ValidationError grouping messages by field path', () => {
    let error: unknown;
    try {
      pipe.transform({ name: '', address: { street: 'R' } });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).data).toEqual({
      name: ['Obrigatório.'],
      'address.street': ['Muito curto.'],
    });
  });
});
