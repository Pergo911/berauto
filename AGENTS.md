# AGENTS.md — BérAutó

Guidelines for agentic coding agents operating in this repository.
The project is a **Next.js 15 (App Router) + TypeScript** fullstack car rental application.
Refer to `tech_stack.md` for architectural decisions and `original_specification.md` for requirements.

---

## Project Setup

```
pnpm install          # install dependencies
pnpm dev              # start dev server (localhost:3000)
pnpm build            # production build (must pass before any PR/deploy)
pnpm start            # serve production build locally
```

---

## Database

```
pnpm db:generate      # generate Drizzle migrations from schema changes
pnpm db:migrate       # apply pending migrations to the database
pnpm db:studio        # open Drizzle Studio (visual DB browser)
pnpm db:seed          # seed database with demo data
```

Schema lives in `src/db/schema.ts`. All migrations are in `src/db/migrations/`.
Never edit migration files manually — regenerate them via `db:generate`.

---

## Linting & Formatting

```
pnpm lint             # ESLint (eslint .)
pnpm lint:fix         # ESLint with --fix
pnpm format           # Prettier --write on all files
pnpm format:check     # Prettier --check (used in CI)
pnpm typecheck        # tsc --noEmit
```

All four must pass on `pnpm build`. Fix lint/type errors before marking a task done.

---

## Testing

> **Not yet configured.** No testing framework (Vitest or otherwise) is installed. The scripts below are the intended target state once Vitest is added.

```
pnpm test             # run all tests (Vitest)
pnpm test:watch       # watch mode
pnpm test src/path/to/file.test.ts   # run a single test file
pnpm test -t "test name pattern"     # run tests matching a pattern
pnpm test:coverage    # coverage report
```

Test files should live next to the code they test: `foo.ts` → `foo.test.ts`.
Integration tests that hit the DB go in `src/__tests__/`.

---

## Project Structure

```
src/
  app/                   # Next.js App Router pages and layouts
    (auth)/              # login, register pages (unauthenticated route group)
    (public)/            # public pages (car listing, car detail)
    dashboard/           # authenticated user area
    agent/               # agent-only area
    admin/               # admin-only area
    api/                 # Route Handlers (explicit REST/webhooks only)
  components/
    ui/                  # shadcn/ui primitives (auto-generated, do not edit manually)
    shared/              # theme provider and shared UI utilities (nav, breadcrumbs planned)
    cars/                # domain components for cars
    rentals/             # domain components for rentals
    invoices/            # domain components for invoices
  db/
    schema.ts            # Drizzle table definitions (single source of truth)
    index.ts             # Neon + Drizzle client singleton
    migrations/          # auto-generated migration SQL files
  lib/
    auth.ts              # Auth.js config and helpers
    validations/         # Zod schemas (one file per domain)
    utils.ts             # generic utility functions (cn(), formatDate(), etc.)
  actions/               # Server Actions (one file per domain: cars.ts, rentals.ts…)
  types/                 # shared TypeScript types and enums
  proxy.ts               # Auth.js route protection middleware (Next.js middleware entry point)
```

---

## Code Style

### TypeScript

- Strict mode is enabled (`tsconfig.json` → `"strict": true`). No `any`.
- Prefer `type` over `interface` for object shapes. Use `interface` only when declaration merging is needed.
- Export types from `src/types/index.ts` when shared across multiple modules.
- Use `satisfies` operator to validate literals against a type without widening.
- Never use non-null assertion (`!`) unless you have a comment explaining why it is safe.

### Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files & folders | `kebab-case` | `rental-card.tsx` |
| React components | `PascalCase` | `RentalCard` |
| Functions / variables | `camelCase` | `getRentalById` |
| Zod schemas | `camelCase` + `Schema` suffix | `createRentalSchema` |
| DB table names | `snake_case` (Drizzle convention) | `rental_events` |
| Drizzle table objects | `camelCase` | `rentalEvents` |
| Enums | `SCREAMING_SNAKE_CASE` values | `RENTAL_STATUS.PENDING` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RENTAL_DAYS` |

### Imports

- Use absolute imports via the `@/` alias (maps to `src/`). Never use `../../../` chains.
- Import order (enforced by ESLint `import/order`):
  1. Node built-ins
  2. External packages
  3. Internal `@/` imports (grouped by: types → db → lib → actions → components)
  4. Relative imports (`./`)
- Import types with `import type { Foo }` to avoid runtime overhead.

```ts
// Good
import type { Rental } from "@/types";
import { db } from "@/db";
import { getRentalById } from "@/actions/rentals";
import { RentalCard } from "@/components/rentals/rental-card";
```

### React & Next.js

- Mark client components explicitly with `"use client"` at the top. Omit the directive for Server Components (they are the default in App Router).
- Mark Server Actions files with `"use server"` at the top.
- Data fetching belongs in Server Components or Server Actions — never `useEffect` + `fetch`.
- Do not use `next/dynamic` unless there is a concrete need (e.g., a heavy chart library).
- Prefer `<Link>` from `next/link` over `<a>` for internal navigation.

### Tailwind & UI

- Use `cn()` from `@/lib/utils` (a `clsx` + `tailwind-merge` wrapper) for conditional class composition.
- Never write inline `style={{}}` — use Tailwind utility classes.
- shadcn/ui components live in `src/components/ui/`. Do not modify them directly; compose them.
- The project uses **Tailwind CSS v4**. Design tokens and the color palette are configured via `@theme` directives in `src/app/globals.css` — no `tailwind.config.ts` exists. Add new tokens there, not inline.

---

## Server Actions

- One file per domain in `src/actions/` (e.g., `rentals.ts`, `cars.ts`, `invoices.ts`).
- Every action must: (1) validate input with Zod, (2) check session/role, (3) perform DB operation.
- Return a discriminated union `{ success: true; data: T } | { success: false; error: string }`.
- Never throw from a Server Action that is called directly from a form — return the error union instead.

```ts
// Pattern
export async function approveRental(id: string): Promise<ActionResult<Rental>> {
  const session = await auth();
  if (session?.user.role !== "agent" && session?.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { success: false, error: "Invalid ID" };
  // ... db operation
}
```

---

## Authentication & Authorization

- Auth config is in `src/lib/auth.ts`. Do not duplicate auth logic elsewhere.
- `proxy.ts` protects route groups based on role (via Auth.js `authorized` callback):
  - `/agent/*` → requires `role === "agent" || role === "admin"`
  - `/admin/*` → requires `role === "admin"`
  - `/dashboard/*` → requires any authenticated session
- Always call `auth()` inside Server Actions to re-verify — middleware alone is not sufficient.
- Passwords are hashed with `bcryptjs` (salt rounds: 12). Never store plaintext passwords.

---

## Error Handling

- Unhandled errors in Server Components surface via `error.tsx` boundary files placed next to the relevant `page.tsx`.
- Use `notFound()` from `next/navigation` when a DB record does not exist (renders the nearest `not-found.tsx`).
- Log unexpected errors server-side before returning the generic error union. Never expose raw DB or internal error messages to the client.

---

## Environment Variables

Sensitive values go in `.env.local` (never committed). Required variables:

```
DATABASE_URL=          # Neon connection string (pooled)
DATABASE_URL_UNPOOLED= # Neon direct connection (for migrations)
AUTH_SECRET=           # Auth.js secret (generate with: openssl rand -base64 32)
AUTH_URL=              # e.g. http://localhost:3000 in dev
```

Access env vars only through a validated config module (`src/lib/env.ts` using `@t3-oss/env-nextjs` or `zod`). Never access `process.env` directly in application code.
