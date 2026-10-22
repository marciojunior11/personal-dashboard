import { DomainError } from '@personal-dashboard/shared/errors';
import type { IRegisterInput } from '@personal-dashboard/shared/identity';
import { MockUserRepository } from '@infrastructure/identity';
import type { IPasswordHasher } from '@application/criptography';
import { RegisterUseCase } from './register.use-case.js';

const fakeHasher: IPasswordHasher = {
  hash: async (password) => `hashed:${password}`,
  compare: async (password, hash) => hash === `hashed:${password}`,
};

const input = (overrides: Partial<IRegisterInput> = {}): IRegisterInput => ({
  nomeCompleto: 'Maria da Silva',
  dataNascimento: '1990-05-20',
  email: 'Maria@Mail.com',
  senha: 'S3nh@Forte',
  confirmacaoSenha: 'S3nh@Forte',
  ...overrides,
});

describe('RegisterUseCase', () => {
  let repository: MockUserRepository;
  let useCase: RegisterUseCase;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    repository = new MockUserRepository();
    useCase = new RegisterUseCase(repository, fakeHasher);
  });

  it('registers the user and returns its public data', async () => {
    const output = await useCase.handle(input());

    expect(output).toEqual({
      id: expect.any(String),
      nomeCompleto: 'Maria da Silva',
      dataNascimento: '1990-05-20',
      email: 'maria@mail.com',
      celular: undefined,
    });
    expect(output).not.toHaveProperty('senha');
  });

  it('persists the user with the hashed password', async () => {
    const output = await useCase.handle(input());
    const saved = await repository.findById(output.id);

    expect(saved?.passwordHash).toBe('hashed:S3nh@Forte');
  });

  it('accepts only a phone', async () => {
    const output = await useCase.handle(
      input({ email: undefined, celular: '(11) 98765-4321' }),
    );
    expect(output.celular).toBe('11987654321');
  });

  it.each([
    ['nomeCompleto', { nomeCompleto: 'Maria' }],
    ['dataNascimento', { dataNascimento: '2023-02-30' }],
    ['celular', { celular: '10987654321' }],
  ])(
    'throws DomainError when a domain rule is broken (%s), before hashing',
    async (_, overrides) => {
      const hash = vi.spyOn(fakeHasher, 'hash');
      const insert = vi.spyOn(repository, 'insert');

      await expect(useCase.handle(input(overrides))).rejects.toThrow(
        DomainError,
      );
      expect(hash).not.toHaveBeenCalled();
      expect(insert).not.toHaveBeenCalled();
    },
  );
});
