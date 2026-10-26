import { execSync } from 'node:child_process';
import { loadTestEnv } from './test-env.js';

/** Applies every migration to the test database before the run. */
export default function setup(): void {
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, ...loadTestEnv(), ENV_FILE: '.env.test' },
  });
}
