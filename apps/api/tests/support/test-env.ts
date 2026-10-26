import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'dotenv';

/**
 * The variables of .env.test (see .env.example), for the tests that need
 * the database. Refuses anything but a test database, so they can never
 * wipe development data.
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
  return { ...env, DATABASE_URL: databaseUrl };
}
