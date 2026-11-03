/**
 * Opaque high-entropy tokens (sessions, password resets, invitations): handed
 * to the client and stored only as a hash. Implemented in the infrastructure
 * layer.
 */
export interface ITokenGenerator {
  /** Returns a new random token, safe to put in a cookie or a URL. */
  generate(): string;

  /**
   * Returns the hash stored in place of `token`. Fast on purpose: unlike a
   * password, a random token is too long to guess, so slow hashing buys
   * nothing and would be paid on every request.
   */
  hash(token: string): string;
}
