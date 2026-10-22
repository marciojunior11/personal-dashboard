# Personal Dashboard

Monorepo do sistema admin, gerenciado com [Turborepo](https://turborepo.dev) e [pnpm](https://pnpm.io).

## Estrutura

### Apps

- `apps/web`: frontend em [Next.js](https://nextjs.org/) — http://localhost:3000
- `apps/api`: API em [NestJS](https://nestjs.com/) — http://localhost:3001, construída com Clean Architecture, SOLID e DDD

### Packages

- `@personal-dashboard/shared`: contrato entre api e web, sem dependências
  - `@personal-dashboard/shared/errors`: erros (incluindo `DomainError`), usados pela api e no tratamento de erros do web
  - `@personal-dashboard/shared/common`: `ApiResult`, o contrato de retorno da api para o client
  - `@personal-dashboard/shared/<modulo>`: DTOs de entrada e saída de cada módulo (ex.: `identity`)
- `@personal-dashboard/ui`: biblioteca de componentes React compartilhada
- `@personal-dashboard/eslint-config`: configurações de ESLint compartilhadas
- `@personal-dashboard/typescript-config`: `tsconfig.json`s base compartilhados

## Requisitos

- Node.js >= 24
- pnpm 11

## Comandos

```bash
pnpm install        # instala as dependências
pnpm dev            # roda web e api em modo desenvolvimento
pnpm build          # build de todos os apps e packages
pnpm lint           # lint
pnpm check-types    # checagem de tipos
pnpm test           # testes
```

Para rodar um app específico, use filtros: `pnpm dev --filter=api`.

## Variáveis de ambiente (api)

- `PORT` — porta da API (padrão `3001`)
- `WEB_URL` — origem permitida no CORS (padrão `http://localhost:3000`)
