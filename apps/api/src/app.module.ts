import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { I18nModule, I18nService } from 'nestjs-i18n';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ApiExceptionFilter, commonErrorMessages, i18nOptions } from '@common';
import { billingErrorMessages } from '@presentation/billing';
import { IdentityModule, identityErrorMessages } from '@presentation/identity';
import type { I18nTranslations } from '@generated/i18n';

/**
 * Every module's error message map, merged for the exception filter: errors
 * cross modules (signing up can fail on a billing code), so one filter
 * translates them all.
 */
const ERROR_MESSAGES = {
  ...commonErrorMessages,
  ...identityErrorMessages,
  ...billingErrorMessages,
};

@Module({
  imports: [I18nModule.forRoot(i18nOptions), IdentityModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useFactory: (i18n: I18nService<I18nTranslations>) =>
        new ApiExceptionFilter(i18n, ERROR_MESSAGES),
      inject: [I18nService],
    },
  ],
})
export class AppModule {}
