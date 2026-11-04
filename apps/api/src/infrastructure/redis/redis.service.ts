import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { createClient } from 'redis';
import { MisconfigurationError } from '@application/common';

/** How long the API waits for Redis when starting before going on without it. */
const STARTUP_WAIT_MS = 2000;
/** A command slower than this fails, so a struggling Redis cannot stall requests. */
const COMMAND_TIMEOUT_MS = 500;
/** Longest pause between reconnection attempts. */
const MAX_RECONNECT_DELAY_MS = 5000;

const connectRedis = (url: string) =>
  createClient({
    url,
    // Commands fail at once while disconnected instead of queueing until
    // Redis is back: callers fall back to Postgres or fail open meanwhile.
    disableOfflineQueue: true,
    commandOptions: { timeout: COMMAND_TIMEOUT_MS },
    socket: {
      reconnectStrategy: (retries) =>
        Math.min(retries * 200, MAX_RECONNECT_DELAY_MS),
    },
  });

export type RedisClient = ReturnType<typeof connectRedis>;

/**
 * The one Redis client of the API, shared by every cache and counter.
 *
 * Unlike Postgres, Redis is not required to run: it only holds copies and
 * counters. If it is down when the API starts, or goes down later, the API
 * keeps serving in a degraded mode, every command failing fast, and the
 * client keeps reconnecting in the background.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: RedisClient;
  /** Logs one warning per outage instead of one per reconnection attempt. */
  private unavailable = false;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new MisconfigurationError(
        'REDIS_URL não definida: a API não pode se conectar ao Redis.',
      );
    }

    this.client = connectRedis(url);
    this.client.on('error', (error: Error) => {
      if (this.unavailable) return;
      this.unavailable = true;
      this.logger.warn(
        `Redis indisponível; seguindo sem ele até reconectar: ${error.message}`,
      );
    });
    this.client.on('ready', () => {
      if (!this.unavailable) return;
      this.unavailable = false;
      this.logger.log('Redis reconectado.');
    });
  }

  async onModuleInit(): Promise<void> {
    // Rejects only when the client is closed; failures are handled above.
    const connection = this.client.connect().catch(() => undefined);
    await Promise.race([
      connection,
      new Promise((resolve) => setTimeout(resolve, STARTUP_WAIT_MS).unref()),
    ]);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isReady) {
      await this.client.close();
    } else {
      // Not connected: stop the reconnection attempts.
      this.client.destroy();
    }
  }
}
