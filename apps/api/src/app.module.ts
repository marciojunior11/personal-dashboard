import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ApiExceptionFilter } from '@common';
import { IdentityModule } from '@presentation/identity';

@Module({
  imports: [IdentityModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}
