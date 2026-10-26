import type { PrismaService } from '../../src/infrastructure/database/index.js';

/**
 * Empties every table the tests write to, keeping the plan catalog the
 * migrations inserted. Call it before each test, so each starts clean.
 */
export async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "subscriptions", "organization_members", "organizations", "users" CASCADE',
  );
}
