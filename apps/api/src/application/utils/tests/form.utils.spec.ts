import {
  DomainError,
  ValidationError,
} from '@personal-dashboard/shared/errors';
import { Email, FullName } from '@domain/common';
import { validateFields } from '@application/utils';

describe('validateFields', () => {
  it('returns what each factory built, under its field', () => {
    const fields = validateFields({
      nomeCompleto: () => FullName.create('Maria da Silva'),
      email: () => null,
      idade: () => 36,
    });

    expect(fields.nomeCompleto).toBeInstanceOf(FullName);
    expect(fields.nomeCompleto.value).toBe('Maria da Silva');
    expect(fields.email).toBeNull();
    expect(fields.idade).toBe(36);
  });

  it('files every broken domain rule under its own field, running every factory', () => {
    const last = vi.fn(() => 'ok');

    const error = (() => {
      try {
        validateFields({
          nomeCompleto: () => FullName.create('Maria'),
          email: () => Email.create('invalido'),
          outro: last,
        });
      } catch (e) {
        return e;
      }
    })();

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).data).toEqual({
      nomeCompleto: ['O nome completo deve conter nome e sobrenome.'],
      email: ['E-mail inválido.'],
    });
    expect(last).toHaveBeenCalledOnce();
  });

  it('lets errors other than DomainError through unchanged', () => {
    const bug = new TypeError('bug');

    expect(() =>
      validateFields({
        nomeCompleto: () => {
          throw bug;
        },
      }),
    ).toThrow(bug);
  });

  it('keeps a DomainError thrown on purpose as the field message', () => {
    expect(() =>
      validateFields({
        senha: () => {
          throw new DomainError('Senha fraca.');
        },
      }),
    ).toThrow(expect.objectContaining({ data: { senha: ['Senha fraca.'] } }));
  });
});
