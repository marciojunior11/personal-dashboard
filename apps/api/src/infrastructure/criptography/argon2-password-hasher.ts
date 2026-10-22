import argon2 from 'argon2';
import type { IPasswordHasher } from '@application/criptography';

interface Argon2Params {
  /** Memory cost, in KiB. */
  memoryCost: number;
  /** Number of iterations. */
  timeCost: number;
  /** Degree of parallelism. */
  parallelism: number;
}

/** OWASP minimum recommendation for argon2id (19 MiB, 2 iterations, 1 lane). */
const DEFAULT_PARAMS: Argon2Params = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

/**
 * `IPasswordHasher` backed by argon2id.
 *
 * Hashes use the standard PHC format (`$argon2id$v=19$m=...,t=...,p=...$...`),
 * which embeds the parameters: they can be raised later without invalidating
 * existing hashes, and other platforms can verify them.
 */
export class Argon2PasswordHasher implements IPasswordHasher {
  constructor(private readonly params: Argon2Params = DEFAULT_PARAMS) {}

  hash(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id, ...this.params });
  }

  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      // Malformed or unsupported hash.
      return false;
    }
  }
}
