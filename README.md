# berauto

A fullstack car rental platform supporting the complete rental lifecycle — from request submission through handover to invoicing. Built with Next.js 16 (App Router) and deployed on Vercel.

## Tech Stack

| Concern         | Solution                                         |
| --------------- | ------------------------------------------------ |
| Framework       | Next.js 16 (App Router, React Server Components) |
| Language        | TypeScript (strict)                              |
| Database        | Neon — Serverless PostgreSQL                     |
| ORM             | Drizzle ORM                                      |
| Auth            | Auth.js v5 — JWT sessions, role-based guards     |
| Validation      | Zod + react-hook-form                            |
| UI              | Tailwind CSS v4 + shadcn/ui                      |
| Package manager | pnpm                                             |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Neon](https://neon.tech) database (free tier is sufficient)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable                | Description                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Neon **pooled** connection string                                                           |
| `DATABASE_URL_UNPOOLED` | Neon **direct** connection string (used by migrations)                                      |
| `AUTH_SECRET`           | Random secret — generate with `openssl rand -base64 32`                                     |
| `AUTH_TRUST_HOST`       | Set to `true` so Auth.js infers the origin from request headers (do **not** set `AUTH_URL`) |

Once the values are set, remove the `SKIP_ENV_VALIDATION=1` line from `.env.local`.

### 3. Run database migrations

```bash
pnpm db:generate   # generate SQL from schema (only needed after schema changes)
pnpm db:migrate    # apply pending migrations to the database
```

Optionally seed the database with demo data:

```bash
pnpm db:seed
```

This creates three demo accounts (password: `password123`):

| Email              | Role  |
| ------------------ | ----- |
| `admin@berauto.hu` | admin |
| `agent@berauto.hu` | agent |
| `user@berauto.hu`  | user  |

### 4. Start the development server

```bash
pnpm dev
```

The app is available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

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
