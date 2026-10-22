/**
 * Hashes and verifies passwords. Implemented in the infrastructure layer
 * (e.g. with bcrypt or argon2).
 */
export interface IPasswordHasher {
  /** Returns the hash of a plain-text password. */
  hash(password: string): Promise<string>;

  /** Checks whether a plain-text password matches a previously built hash. */
  compare(password: string, hash: string): Promise<boolean>;
}
