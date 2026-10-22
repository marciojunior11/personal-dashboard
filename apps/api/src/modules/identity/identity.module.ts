import { Module } from '@nestjs/common';
import type { IPasswordHasher } from '@application/criptography';
import { RegisterUseCase, type IUserRepository } from '@application/identity';
import { Argon2PasswordHasher } from '@infrastructure/criptography';
import { MockUserRepository } from '@infrastructure/identity';
import { AuthController } from './auth.controller.js';
import { PASSWORD_HASHER, USER_REPOSITORY } from './identity.tokens.js';

/** Wires the identity use cases to their infrastructure implementations. */
@Module({
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: MockUserRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    {
      provide: RegisterUseCase,
      useFactory: (users: IUserRepository, hasher: IPasswordHasher) =>
        new RegisterUseCase(users, hasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
  ],
})
export class IdentityModule {}
