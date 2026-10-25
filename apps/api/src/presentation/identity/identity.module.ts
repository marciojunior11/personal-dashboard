import { Module } from '@nestjs/common';
import type {
  IPlanRepository,
  ISubscriptionRepository,
} from '@application/billing';
import type { IPasswordHasher } from '@application/criptography';
import {
  RegisterUseCase,
  type IOrganizationMemberRepository,
  type IOrganizationRepository,
  type IUserRepository,
} from '@application/identity';
import { Argon2PasswordHasher } from '@infrastructure/criptography';
import {
  MockOrganizationMemberRepository,
  MockOrganizationRepository,
  MockUserRepository,
} from '@infrastructure/identity';
import {
  BillingModule,
  PLAN_REPOSITORY,
  SUBSCRIPTION_REPOSITORY,
} from '@presentation/billing';
import { AuthController } from './auth.controller.js';
import {
  ORGANIZATION_MEMBER_REPOSITORY,
  ORGANIZATION_REPOSITORY,
  PASSWORD_HASHER,
  USER_REPOSITORY,
} from './identity.tokens.js';

/** Wires the identity use cases to their infrastructure implementations. */
@Module({
  imports: [BillingModule],
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: MockUserRepository },
    { provide: ORGANIZATION_REPOSITORY, useClass: MockOrganizationRepository },
    {
      provide: ORGANIZATION_MEMBER_REPOSITORY,
      useClass: MockOrganizationMemberRepository,
    },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    {
      provide: RegisterUseCase,
      useFactory: (
        users: IUserRepository,
        organizations: IOrganizationRepository,
        members: IOrganizationMemberRepository,
        plans: IPlanRepository,
        subscriptions: ISubscriptionRepository,
        hasher: IPasswordHasher,
      ) =>
        new RegisterUseCase(
          users,
          organizations,
          members,
          plans,
          subscriptions,
          hasher,
        ),
      inject: [
        USER_REPOSITORY,
        ORGANIZATION_REPOSITORY,
        ORGANIZATION_MEMBER_REPOSITORY,
        PLAN_REPOSITORY,
        SUBSCRIPTION_REPOSITORY,
        PASSWORD_HASHER,
      ],
    },
  ],
})
export class IdentityModule {}
