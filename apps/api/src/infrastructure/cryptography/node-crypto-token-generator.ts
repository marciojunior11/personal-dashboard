import { createHash, randomBytes } from 'node:crypto';
import type { ITokenGenerator } from '@application/cryptography';

/** 256 bits: far beyond what can be guessed, even at many attempts a second. */
const TOKEN_BYTES = 32;

/**
 * `ITokenGenerator` on Node's crypto: random bytes from the OS's secure
 * generator, encoded as base64url, and stored as a hex SHA-256.
 */
export class NodeCryptoTokenGenerator implements ITokenGenerator {
  generate(): string {
    return randomBytes(TOKEN_BYTES).toString('base64url');
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
