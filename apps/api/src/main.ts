import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Local development reads .env (see .env.example); deployed environments set
// the variables themselves.
if (existsSync('.env')) process.loadEnvFile('.env');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.WEB_URL ?? 'http://localhost:3000' });
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
