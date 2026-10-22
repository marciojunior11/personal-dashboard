/**
 * Injection tokens for the application contracts: interfaces do not exist at
 * runtime, so Nest needs a concrete key to bind each one to an implementation.
 */
export const USER_REPOSITORY = Symbol('IUserRepository');
export const PASSWORD_HASHER = Symbol('IPasswordHasher');
