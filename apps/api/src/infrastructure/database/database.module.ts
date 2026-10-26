import { Global, Module } from '@nestjs/common';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsModule } from 'nestjs-cls';
import { UNIT_OF_WORK } from './database.tokens.js';
import { PrismaService } from './prisma.service.js';
import { PrismaUnitOfWork } from './prisma.unit-of-work.js';

/** Provides the Prisma client to the transaction plugin. */
@Module({ providers: [PrismaService], exports: [PrismaService] })
class PrismaModule {}

/**
 * The database connection and its transactions, shared by every module.
 * Registers nestjs-cls with the transactional plugin on Prisma: the
 * `TransactionHost` repositories inject, and the `IUnitOfWork` use cases run
 * their writes in.
 */
@Global()
@Module({
  imports: [
    PrismaModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma<PrismaService>({
            prismaInjectionToken: PrismaService,
            sqlFlavor: 'postgresql',
          }),
        }),
      ],
    }),
  ],
  providers: [{ provide: UNIT_OF_WORK, useClass: PrismaUnitOfWork }],
  exports: [PrismaModule, UNIT_OF_WORK],
})
export class DatabaseModule {}
