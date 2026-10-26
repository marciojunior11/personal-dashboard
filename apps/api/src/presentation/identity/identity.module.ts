import { Module } from '@nestjs/common';
import type {
  IPlanRepository,
  ISubscriptionRepository,
} from '@application/billing';
import type { IUnitOfWork } from '@application/common';
import type { IPasswordHasher } from '@application/criptography';
import {
  RegisterUseCase,
  type IOrganizationMemberRepository,
  type IOrganizationRepository,
  type IUserRepository,
} from '@application/identity';
import { Argon2PasswordHasher } from '@infrastructure/criptography';
import { UNIT_OF_WORK } from '@infrastructure/database';
import {
  PrismaOrganizationMemberRepository,
  PrismaOrganizationRepository,
  PrismaUserRepository,
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
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: PrismaOrganizationRepository,
    },
    {
      provide: ORGANIZATION_MEMBER_REPOSITORY,
      useClass: PrismaOrganizationMemberRepository,
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
        unitOfWork: IUnitOfWork,
      ) =>
        new RegisterUseCase(
          users,
          organizations,
          members,
          plans,
          subscriptions,
          hasher,
          unitOfWork,
        ),
      inject: [
        USER_REPOSITORY,
        ORGANIZATION_REPOSITORY,
        ORGANIZATION_MEMBER_REPOSITORY,
        PLAN_REPOSITORY,
        SUBSCRIPTION_REPOSITORY,
        PASSWORD_HASHER,
        UNIT_OF_WORK,
      ],
    },
  ],
})
export class IdentityModule {}
