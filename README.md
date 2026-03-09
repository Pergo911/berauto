# berauto

[berauto.vercel.app](https://berauto.vercel.app/)

A car rental platform built as a school assignment. Supports the complete rental lifecycle — from request submission through vehicle handover to invoicing — with role-based access for users, agents, and admins.

## Getting Started

```bash
cp .env.example .env.local   # fill in DATABASE_URL, DATABASE_URL_UNPOOLED, AUTH_SECRET, AUTH_TRUST_HOST=true
pnpm install
pnpm db:migrate
pnpm dev                     # http://localhost:3000
```

**Other available scripts**

```bash
pnpm dev              # start dev server (Turbopack)
pnpm build            # production build
pnpm start            # serve production build locally
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with auto-fix
pnpm format           # Prettier
pnpm format:check     # Prettier check (used in CI)
pnpm typecheck        # tsc --noEmit

pnpm db:generate      # generate Drizzle migrations from schema changes
pnpm db:migrate       # apply pending migrations
pnpm db:studio        # open Drizzle Studio (visual DB browser)
pnpm db:seed          # seed database with demo data
```
