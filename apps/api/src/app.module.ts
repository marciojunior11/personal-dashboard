import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { BillingErrorMessages } from '@personal-dashboard/shared/billing';
import { CommonErrorMessages } from '@personal-dashboard/shared/common';
import { IdentityErrorMessages } from '@personal-dashboard/shared/identity';
import { I18nModule, I18nService } from 'nestjs-i18n';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ApiExceptionFilter, i18nOptions } from '@common';
import { IdentityModule } from '@presentation/identity';
import type { I18nPath, I18nTranslations } from '@generated/i18n';

/**
 * Every module's map of error codes to catalog keys, merged for the
 * exception filter: errors cross modules (signing up can fail on a billing
 * code), so one filter translates them all. The maps live in shared, used by
 * the web app too; `satisfies` checks here that every key exists in the
 * catalogs, against the types nestjs-i18n generates.
 */
const ERROR_MESSAGES = {
  ...CommonErrorMessages,
  ...IdentityErrorMessages,
  ...BillingErrorMessages,
} satisfies Record<string, I18nPath>;

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
