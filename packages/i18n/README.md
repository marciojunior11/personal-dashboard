# @personal-dashboard/i18n

Translation resources only: `locales/<locale>/<module>.json`. The package
holds no code and knows nothing about errors or error codes. Consumers load
the catalogs with their own i18n library (`nestjs-i18n` in the API).

- pt-BR is the only locale for now; a new one is a new folder with the same
  files and keys.
- Keys describe the text (`identity.user.idTaken`), not an error code. Each
  app maps its error codes to these keys.
- Placeholders use `{name}`.
