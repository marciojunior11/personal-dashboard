import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service.js';

/** The Redis connection, shared by every module that caches or counts. */
@Global()
@Module({ providers: [RedisService], exports: [RedisService] })
export class RedisModule {}
