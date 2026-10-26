import type { TestingModule } from '@nestjs/testing';
import { ConflictError } from '@personal-dashboard/shared/errors';
import { IdentityErrorCodes } from '@personal-dashboard/shared/identity';
import {
  BirthDate,
  Email,
  FullName,
  PhoneNumber,
} from '../../src/domain/common/index.js';
import {
  Organization,
  OrganizationMember,
  OrganizationMemberRole,
  OrganizationName,
  OrganizationType,
  User,
} from '../../src/domain/identity/index.js';
import {
  PrismaOrganizationMemberRepository,
  PrismaOrganizationRepository,
  PrismaUserRepository,
} from '../../src/infrastructure/identity/index.js';
import { createDatabaseTestingModule } from '../support/database-testing-module.js';

const newUser = (overrides: { email?: string; phone?: string } = {}) =>
  User.create({
    fullName: FullName.create('Maria da Silva'),
    birthDate: BirthDate.create('1990-05-20'),
    email: Email.create(overrides.email ?? 'maria@mail.com'),
    phone: overrides.phone ? PhoneNumber.create(overrides.phone) : null,
    passwordHash: '$argon2id$hash',
  });

const newOrganization = () =>
  Organization.create({
    name: OrganizationName.create('Maria da Silva'),
    type: OrganizationType.INDIVIDUAL,
  });

describe('Prisma identity repositories', () => {
  let module: TestingModule;
  let users: PrismaUserRepository;
  let organizations: PrismaOrganizationRepository;
  let members: PrismaOrganizationMemberRepository;

  beforeEach(async () => {
    module = await createDatabaseTestingModule([
      PrismaUserRepository,
      PrismaOrganizationRepository,
      PrismaOrganizationMemberRepository,
    ]);
    users = module.get(PrismaUserRepository);
    organizations = module.get(PrismaOrganizationRepository);
    members = module.get(PrismaOrganizationMemberRepository);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('PrismaUserRepository', () => {
    it('stores a user and reads it back as the same entity', async () => {
      const user = newUser({ phone: '11987654321' });
      await users.insert(user);

      const found = await users.findById(user.id);
      expect(found?.equals(user)).toBe(true);
      expect(found?.fullName.value).toBe('Maria da Silva');
      expect(found?.birthDate.value).toBe('1990-05-20');
      expect(found?.email?.value).toBe('maria@mail.com');
      expect(found?.phone?.value).toBe('11987654321');
      expect(found?.passwordHash).toBe('$argon2id$hash');
    });

    it('returns null for an unknown id', async () => {
      expect(
        await users.findById('00000000-0000-0000-0000-000000000000'),
      ).toBeNull();
    });

    it.each([
      [
        'e-mail',
        { email: 'maria@mail.com' },
        { email: 'maria@mail.com' },
        IdentityErrorCodes.USER_EMAIL_TAKEN,
      ],
      [
        'phone',
        { email: 'a@mail.com', phone: '11987654321' },
        { email: 'b@mail.com', phone: '11987654321' },
        IdentityErrorCodes.USER_PHONE_TAKEN,
      ],
    ])('rejects a taken %s with its code', async (_, first, second, code) => {
      await users.insert(newUser(first));

      const error = await users.insert(newUser(second)).catch((e) => e);
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.code).toBe(code);
    });
  });

  describe('PrismaOrganizationRepository', () => {
    it('stores an organization and reads it back', async () => {
      const organization = newOrganization();
      await organizations.insert(organization);

      const found = await organizations.findById(organization.id);
      expect(found?.equals(organization)).toBe(true);
      expect(found?.name.value).toBe('Maria da Silva');
      expect(found?.type).toBe(OrganizationType.INDIVIDUAL);
    });
  });

  describe('PrismaOrganizationMemberRepository', () => {
    it("finds a user's memberships", async () => {
      const user = newUser();
      const organization = newOrganization();
      await users.insert(user);
      await organizations.insert(organization);
      const owner = OrganizationMember.create({
        userId: user.id,
        organizationId: organization.id,
        role: OrganizationMemberRole.OWNER,
      });
      await members.insert(owner);

      const found = await members.findByUserId(user.id);
      expect(found).toHaveLength(1);
      expect(found[0].equals(owner)).toBe(true);
      expect(found[0].role).toBe(OrganizationMemberRole.OWNER);
    });

    it('rejects the same user joining the same organization twice', async () => {
      const user = newUser();
      const organization = newOrganization();
      await users.insert(user);
      await organizations.insert(organization);
      const member = () =>
        OrganizationMember.create({
          userId: user.id,
          organizationId: organization.id,
          role: OrganizationMemberRole.OWNER,
        });
      await members.insert(member());

      const error = await members.insert(member()).catch((e) => e);
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.code).toBe(
        IdentityErrorCodes.ORGANIZATION_MEMBER_DUPLICATED,
      );
    });
  });
});
