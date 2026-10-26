import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { MisconfigurationError } from '@application/common';
import { PrismaClient } from '@generated/prisma';

/**
 * The one Prisma client of the API, on the Postgres driver adapter: a single
 * connection pool shared by every repository. It connects when the API
 * starts and disconnects when it stops.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new MisconfigurationError(
        'DATABASE_URL não definida: a API não pode se conectar ao banco de dados.',
      );
    }
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
