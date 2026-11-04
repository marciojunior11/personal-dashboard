import type { IRateLimitRule } from '@application/common';

const FIFTEEN_MINUTES = 15 * 60;

/**
 * Login attempts allowed per window. Both fail open: if the counters are
 * unreachable, logins go on, slowed by argon2 and still checked by password,
 * instead of nobody being able to log in.
 */
export const LoginRateLimits = {
  /** Per e-mail or phone: stops guessing one account's password. */
  BY_IDENTIFIER: {
    limit: 5,
    windowSeconds: FIFTEEN_MINUTES,
    failMode: 'open',
  },
  /** Per IP: stops one client trying many accounts. */
  BY_IP: {
    limit: 50,
    windowSeconds: FIFTEEN_MINUTES,
    failMode: 'open',
  },
} as const satisfies Record<string, IRateLimitRule>;
