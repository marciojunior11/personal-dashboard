import { defineConfig } from 'vitest/config';
import { loadTestEnv } from './tests/support/test-env.js';

/**
 * Tests that need the database: e2e (*.e2e-spec.ts) and the repositories'
 * integration tests (*.int-spec.ts). They run against the test database from
 * .env.test (see .env.example), migrated before the run, one file at a time
 * since they share it.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts', '**/*.int-spec.ts'],
    env: loadTestEnv(),
    globalSetup: ['./tests/support/database.global-setup.ts'],
    fileParallelism: false,
  },
});
