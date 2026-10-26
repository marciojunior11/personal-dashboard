import { Test, type TestingModule } from '@nestjs/testing';
import type { Provider } from '@nestjs/common';
import {
  DatabaseModule,
  PrismaService,
} from '../../src/infrastructure/database/index.js';
import { resetDatabase } from './database.js';

/**
 * A Nest module with the real `DatabaseModule` (Prisma, nestjs-cls and the
 * unit of work) on the test database, plus the given providers. The tables
 * are emptied first, so each test starts clean.
 */
export async function createDatabaseTestingModule(
  providers: Provider[],
): Promise<TestingModule> {
  const module = await Test.createTestingModule({
    imports: [DatabaseModule],
    providers,
  }).compile();
  await module.init();
  await resetDatabase(module.get(PrismaService));
  return module;
}
