/**
 * How many hits a subject may make in a window, and what to do when the
 * counters cannot be reached:
 * - `open`: let the request through, for when blocking everyone is worse,
 *   e.g. logins, where the password check still stands.
 * - `closed`: refuse it, for when the limit is the only barrier, e.g.
 *   sending paid SMS.
 */
export interface IRateLimitRule {
  limit: number;
  windowSeconds: number;
  failMode: 'open' | 'closed';
}

export interface IRateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets; 0 when allowed. */
  retryAfterSeconds: number;
}

/** Counts hits per subject in fixed windows. Implemented in the infrastructure layer. */
export interface IRateLimiter {
  /**
   * Counts one hit of `subject` (an IP, an e-mail...) in `scope` (e.g.
   * `login:ip`) and tells whether it is still within `rule`.
   */
  consume(
    scope: string,
    subject: string,
    rule: IRateLimitRule,
  ): Promise<IRateLimitResult>;
}
