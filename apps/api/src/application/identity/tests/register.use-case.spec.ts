import { BaseError, ValidationError } from '@personal-dashboard/shared/errors';
import type { IRegisterInput } from '@personal-dashboard/shared/identity';
import { PlanCode } from '@domain/billing';
import { OrganizationMemberRole, OrganizationType } from '@domain/identity';
import type { IPlanRepository } from '@application/billing';
import { MisconfigurationError } from '@application/common';
import type { IPasswordHasher } from '@application/criptography';
import { RegisterUseCase } from '@application/identity';
import {
  MockPlanRepository,
  MockSubscriptionRepository,
} from '@infrastructure/billing';
import {
  MockOrganizationMemberRepository,
  MockOrganizationRepository,
  MockUserRepository,
} from '@infrastructure/identity';

const fakeHasher: IPasswordHasher = {
  hash: async (password) => `hashed:${password}`,
  compare: async (password, hash) => hash === `hashed:${password}`,
};

const emptyCatalog: IPlanRepository = { findByCode: async () => null };

const input = (overrides: Partial<IRegisterInput> = {}): IRegisterInput => ({
  nomeCompleto: 'Maria da Silva',
  dataNascimento: '1990-05-20',
  email: 'Maria@Mail.com',
  senha: 'S3nh@Forte',
  confirmacaoSenha: 'S3nh@Forte',
  ...overrides,
});

describe('RegisterUseCase', () => {
  let users: MockUserRepository;
  let organizations: MockOrganizationRepository;
  let members: MockOrganizationMemberRepository;
  let subscriptions: MockSubscriptionRepository;
  let useCase: RegisterUseCase;

  const createUseCase = (plans: IPlanRepository) =>
    new RegisterUseCase(
      users,
      organizations,
      members,
      plans,
      subscriptions,
      fakeHasher,
    );

  /** Spies on every write, to assert nothing was persisted. */
  const spyOnInserts = () => [
    vi.spyOn(users, 'insert'),
    vi.spyOn(organizations, 'insert'),
    vi.spyOn(members, 'insert'),
    vi.spyOn(subscriptions, 'insert'),
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    users = new MockUserRepository();
    organizations = new MockOrganizationRepository();
    members = new MockOrganizationMemberRepository();
    subscriptions = new MockSubscriptionRepository();
    useCase = createUseCase(new MockPlanRepository());
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
    const saved = await users.findById(output.id);

    expect(saved?.passwordHash).toBe('hashed:S3nh@Forte');
  });

  it('makes the user OWNER of a new INDIVIDUAL organization named after them', async () => {
    const output = await useCase.handle(input());

    const [owner, ...others] = await members.findByUserId(output.id);
    expect(others).toHaveLength(0);
    expect(owner.role).toBe(OrganizationMemberRole.OWNER);

    const organization = await organizations.findById(owner.organizationId);
    expect(organization?.type).toBe(OrganizationType.INDIVIDUAL);
    expect(organization?.name.value).toBe('Maria da Silva');
  });

  it('subscribes the new organization to the LIMITED plan', async () => {
    const output = await useCase.handle(input());
    const [owner] = await members.findByUserId(output.id);

    const subscription = await subscriptions.findByOrganizationId(
      owner.organizationId,
    );
    expect(subscription?.planCode).toBe(PlanCode.LIMITED);
    expect(subscription?.maxActiveStudents).toBe(3);
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
  ] as const)(
    'files a broken domain rule under its field (%s), before hashing or writing',
    async (field, overrides) => {
      const hash = vi.spyOn(fakeHasher, 'hash');
      const inserts = spyOnInserts();

      const error = await useCase.handle(input(overrides)).catch((e) => e);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.issues).toEqual([
        expect.objectContaining({ field, message: expect.any(String) }),
      ]);
      expect(hash).not.toHaveBeenCalled();
      inserts.forEach((insert) => expect(insert).not.toHaveBeenCalled());
    },
  );

  it('reports every broken field at once', async () => {
    const error = await useCase
      .handle(input({ nomeCompleto: 'Maria', celular: '10987654321' }))
      .catch((e) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.issues).toEqual([
      expect.objectContaining({
        field: 'nomeCompleto',
        message: 'O nome completo deve conter nome e sobrenome.',
      }),
      expect.objectContaining({
        field: 'celular',
        message: 'Número de celular inválido.',
      }),
    ]);
  });

  it('throws MisconfigurationError when the LIMITED plan is missing, before writing', async () => {
    useCase = createUseCase(emptyCatalog);
    const inserts = spyOnInserts();

    const error = await useCase.handle(input()).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(MisconfigurationError);
    // Not a BaseError, so the exception filter logs it and hides the details.
    expect(error).not.toBeInstanceOf(BaseError);
    expect((error as Error).message).toContain('Plano LIMITED não encontrado');
    inserts.forEach((insert) => expect(insert).not.toHaveBeenCalled());
  });
});
