import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/infrastructure/database/index.js';
import { resetDatabase } from './support/database.js';

const validInput = {
  nomeCompleto: 'Maria da Silva',
  dataNascimento: '1990-05-20',
  email: 'Maria@Mail.com',
  senha: 'S3nh@Forte',
  confirmacaoSenha: 'S3nh@Forte',
};

describe('POST /auth/register (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    await resetDatabase(prisma);
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a user and returns a successful ApiResult', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validInput)
      .expect(201);

    expect(response.body).toEqual({
      isSuccess: true,
      isFailure: false,
      value: {
        id: expect.any(String),
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1990-05-20',
        email: 'maria@mail.com',
      },
      error: null,
    });
  });

  it('stores the user, an INDIVIDUAL organization, its OWNER and a LIMITED subscription', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validInput)
      .expect(201);
    const userId: string = response.body.value.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: { organization: { include: { subscription: true } } },
        },
      },
    });
    expect(user?.email).toBe('maria@mail.com');
    expect(user?.passwordHash).not.toBe(validInput.senha);
    expect(user?.memberships).toHaveLength(1);

    const [membership] = user!.memberships;
    expect(membership.role).toBe('OWNER');
    expect(membership.organization).toMatchObject({
      name: 'Maria da Silva',
      type: 'INDIVIDUAL',
    });
    expect(membership.organization.subscription).toMatchObject({
      planCode: 'LIMITED',
      maxActiveStudents: 3,
    });
  });

  it('answers 409 for an e-mail already registered, storing nothing', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(validInput)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...validInput, nomeCompleto: 'Outra Pessoa' })
      .expect(409);

    expect(response.body.error).toMatchObject({
      name: 'ConflictError',
      code: 'USER_EMAIL_TAKEN',
      message: 'Já existe uma conta com este e-mail.',
    });
    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.organization.count()).toBe(1);
  });

  it('answers 422 with field errors for an invalid input', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...validInput, email: 'invalido', confirmacaoSenha: 'outra' })
      .expect(422);

    expect(response.body.isFailure).toBe(true);
    expect(response.body.error).toMatchObject({
      name: 'ValidationError',
      code: 'INVALID_INPUT',
    });
    expect(response.body.error.issues).toEqual(
      expect.arrayContaining([
        { field: 'email', code: 'EMAIL_INVALID', message: 'E-mail inválido.' },
        {
          field: 'confirmacaoSenha',
          code: 'PASSWORD_CONFIRMATION_MISMATCH',
          message: 'A confirmação de senha não confere.',
        },
      ]),
    );
  });

  it('answers 422 with every broken format rule under its field, at once', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...validInput, nomeCompleto: 'Maria', celular: '10987654321' })
      .expect(422);

    expect(response.body.error).toMatchObject({
      name: 'ValidationError',
      code: 'INVALID_INPUT',
    });
    expect(response.body.error.issues).toEqual(
      expect.arrayContaining([
        {
          field: 'nomeCompleto',
          code: 'FULL_NAME_MISSING_SURNAME',
          message: 'O nome completo deve conter nome e sobrenome.',
        },
        {
          field: 'celular',
          code: 'PHONE_NUMBER_INVALID',
          message: 'Número de celular inválido.',
        },
      ]),
    );
  });

  it('answers in the default locale when the requested one is not supported', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Accept-Language', 'fr-FR,de;q=0.9')
      .send({ ...validInput, nomeCompleto: 'Maria' })
      .expect(422);

    expect(response.body.error.message).toBe(
      'Os dados informados são inválidos.',
    );
    expect(response.body.error.issues[0]).toMatchObject({
      field: 'nomeCompleto',
      code: 'FULL_NAME_MISSING_SURNAME',
      message: 'O nome completo deve conter nome e sobrenome.',
    });
  });

  it('keeps Nest errors for unknown routes', async () => {
    await request(app.getHttpServer()).get('/auth/unknown').expect(404);
  });
});
