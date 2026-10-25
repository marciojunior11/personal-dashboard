import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { AcceptLanguageResolver, type I18nOptions } from 'nestjs-i18n';

const require = createRequire(import.meta.url);

/** The catalogs ship in `@personal-dashboard/i18n`: one folder per locale. */
const LOCALES_PATH = join(
  dirname(require.resolve('@personal-dashboard/i18n/package.json')),
  'locales/',
);

/** Answers requests asking for no supported locale. */
export const FALLBACK_LOCALE = 'pt-BR';

/**
 * nestjs-i18n setup: loads the catalogs and resolves each request's locale
 * from `Accept-Language`. Outside production it regenerates the key types on
 * start, so the error message maps only accept keys that exist.
 */
export const i18nOptions: I18nOptions = {
  fallbackLanguage: FALLBACK_LOCALE,
  loaderOptions: { path: LOCALES_PATH, watch: false },
  resolvers: [AcceptLanguageResolver],
  typesOutputPath:
    process.env.NODE_ENV === 'production'
      ? undefined
      : join(process.cwd(), 'src/generated/i18n.generated.ts'),
};
