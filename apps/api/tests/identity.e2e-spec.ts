import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

const validInput = {
  nomeCompleto: 'Maria da Silva',
  dataNascimento: '1990-05-20',
  email: 'Maria@Mail.com',
  senha: 'S3nh@Forte',
  confirmacaoSenha: 'S3nh@Forte',
};

describe('POST /auth/register (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
