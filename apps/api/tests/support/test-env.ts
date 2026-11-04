import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'dotenv';

/**
 * The variables of .env.test (see .env.example), for the tests that need
 * the database or Redis. Refuses anything but a test database and a Redis
 * logical database other than 0 (development's), so they can never wipe
 * development data.
 */
export function loadTestEnv(): Record<string, string> {
  const env = existsSync('.env.test')
    ? parse(readFileSync('.env.test', 'utf8'))
    : {};
  const databaseUrl = env.DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl?.includes('_test')) {
    throw new Error(
      `Refusing to run database tests against "${databaseUrl}": set a test database in .env.test.`,
    );
  }
  const redisUrl = env.REDIS_URL ?? process.env.REDIS_URL;
  const redisDatabase = redisUrl ? new URL(redisUrl).pathname.slice(1) : '';
  if (redisUrl && (redisDatabase === '' || redisDatabase === '0')) {
    throw new Error(
      `Refusing to run Redis tests against "${redisUrl}": set another logical database (e.g. /1) in .env.test.`,
    );
  }
  return {
    ...env,
    DATABASE_URL: databaseUrl,
    ...(redisUrl ? { REDIS_URL: redisUrl } : {}),
  };
}
