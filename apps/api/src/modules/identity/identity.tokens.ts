/**
 * Injection tokens for the application contracts: interfaces do not exist at
 * runtime, so Nest needs a concrete key to bind each one to an implementation.
 */
export const USER_REPOSITORY = Symbol('IUserRepository');
export const ORGANIZATION_REPOSITORY = Symbol('IOrganizationRepository');
export const ORGANIZATION_MEMBER_REPOSITORY = Symbol(
  'IOrganizationMemberRepository',
);
export const PASSWORD_HASHER = Symbol('IPasswordHasher');
