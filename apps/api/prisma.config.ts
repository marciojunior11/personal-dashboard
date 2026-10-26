import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 no longer loads .env by itself. ENV_FILE picks another file, so
// the test database is migrated with `ENV_FILE=.env.test prisma migrate deploy`.
config({ path: process.env.ENV_FILE ?? '.env', quiet: true });

export default defineConfig({
  schema: 'prisma/schema',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
