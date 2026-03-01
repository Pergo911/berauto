# BérAutó — Architecture & Tech Stack Proposal

## Overview

A fullstack car rental platform with role-based access (user / agent / admin), supporting the complete rental lifecycle from request submission to invoicing. Deployed on Vercel's Hobby (free) plan using a serverless-compatible architecture throughout.

---

## Deployment Constraints (Vercel Hobby)

- No persistent long-running servers — everything must be serverless or edge functions.
- Database must be external and serverless-compatible (Vercel Postgres / Neon / Supabase).
- Static assets served via Vercel's CDN automatically.
- All API logic lives inside the Next.js project as Server Actions or Route Handlers.

---

## Tech Stack

### Framework — Next.js 16 (App Router)

Single repository covering both frontend and backend. The App Router enables:

- **React Server Components** for data-fetching without client-side waterfalls.
- **Server Actions** for form submissions and mutations (no separate REST layer needed for most operations).
- **Route Handlers** (`app/api/...`) for any explicit REST/webhook endpoints (e.g., PDF invoice download).
- Built-in middleware for auth guards on every route.

### Language — TypeScript

End-to-end type safety. Shared types between the database layer and UI components.

### Database — Neon (Serverless PostgreSQL)

- Free tier: 3 GiB storage, 1 project, 10 branches — more than sufficient for an assignment.
- HTTP-based driver works inside Vercel serverless functions without connection pool exhaustion.
- Integrates natively with Vercel via the Neon integration in the Vercel marketplace.

### ORM — Drizzle ORM

- Lightweight, TypeScript-first, generates fully typed query results.
- Schema defined in code; migrations via `drizzle-kit`.
- Pairs well with Neon's HTTP driver (`drizzle-orm/neon-http`).
- Chosen over Prisma because Prisma's query engine binary has historically had cold-start overhead on Vercel serverless.

### Authentication — Auth.js v5 (formerly NextAuth)

- Credential-based login (email + password) with bcrypt hashing.
- Session strategy: **JWT** stored in an HTTP-only cookie (no DB session table needed; keeps things stateless for serverless).
- Role (`user` | `agent` | `admin`) embedded in the JWT payload.
- Middleware at `proxy.ts` enforces route-level access before any page renders.

### Validation — Zod

Used in two places:

1. Server Action / Route Handler input validation.
2. Form validation on the client via `react-hook-form` + `@hookform/resolvers/zod`.

### UI — Tailwind CSS + shadcn/ui

- shadcn/ui provides accessible, unstyled-by-default components (tables, dialogs, forms, badges) that are copy-pasted into the project rather than imported from a package — no versioning issues.
- Tailwind handles all styling; no separate CSS files.

### PDF Invoicing — `@react-pdf/renderer` or `pdf-lib`

Generated server-side inside a Route Handler and streamed as a binary response. No external service needed.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                      │
│                                                     │
│  ┌─────────────┐   ┌──────────────────────────────┐ │
│  │   Browser   │   │        Server Layer          │ │
│  │  (RSC + CC) │◄──│  Server Actions / Route      │ │
│  │             │   │  Handlers (serverless fns)   │ │
│  └─────────────┘   └───────────┬──────────────────┘ │
│                                │                    │
│              Auth.js Middleware│(JWT cookie check)  │
└────────────────────────────────┼────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Neon PostgreSQL        │
                    │  (via Drizzle ORM +     │
                    │   neon-http driver)     │
                    └─────────────────────────┘
```

---

## Database Schema (Conceptual)

```
users
  id, email, password_hash, name, address, phone, role, created_at

cars
  id, make, model, year, license_plate, mileage_km,
  daily_rate, is_available, status, created_at

rentals
  id, car_id → cars, user_id → users (nullable for guest),
  guest_name, guest_email, guest_phone,   ← for non-registered users
  start_date, end_date, status,           ← PENDING | APPROVED | REJECTED | ACTIVE | CLOSED
  agent_id → users (nullable),
  created_at, updated_at

rental_events
  id, rental_id → rentals, event_type,   ← REQUEST | APPROVE | REJECT | HANDOVER | RETURN
  actor_id → users, notes, timestamp

invoices
  id, rental_id → rentals, amount, issued_at, issued_by → users, pdf_url
```

---

## Application Routes & Role Guards

| Path                           | Accessible by                       |
| ------------------------------ | ----------------------------------- |
| `/`                            | Everyone (car listing)              |
| `/cars/[id]`                   | Everyone (car detail + rental form) |
| `/auth/login` `/auth/register` | Unauthenticated                     |
| `/dashboard`                   | Authenticated users                 |
| `/dashboard/rentals`           | Users (own history)                 |
| `/agent`                       | Agent, Admin                        |
| `/agent/requests`              | Agent, Admin (approve/reject queue) |
| `/agent/active`                | Agent, Admin (active rentals)       |
| `/agent/invoices`              | Agent, Admin                        |
| `/admin`                       | Admin only                          |
| `/admin/cars`                  | Admin only                          |
| `/admin/users`                 | Admin only                          |

---

## Key Design Decisions

### Why not a separate backend (Express / NestJS / FastAPI)?

Vercel's free tier does not support long-running Node servers. A separate backend would require a second hosting provider (Render, Railway, etc.) with a free tier that sleeps on inactivity, introducing latency and operational overhead for an assignment showcase. Keeping everything inside Next.js eliminates this and is the standard approach for Vercel deployments.

### Why Neon over Supabase?

Both are free and excellent. Neon is chosen because:

- Its serverless HTTP driver is purpose-built for edge/serverless environments.
- Less opinionated — no need to use Supabase's client SDK or row-level security model when Drizzle + Auth.js already handle auth/authz.
- Supabase remains a valid alternative if a real-time feature (e.g., live status updates for agents) becomes desirable later.

### Why Drizzle over Prisma?

Prisma's Rust query engine binary adds ~50–100ms cold-start latency on Vercel serverless functions. Drizzle is a pure TypeScript library with zero native dependencies, making cold starts negligible.

### Why JWT sessions instead of database sessions?

Avoids an extra DB round-trip on every request. The role and user ID in the JWT are sufficient for all access-control decisions. Token invalidation is handled by a short expiry (e.g., 24 h) combined with a re-login flow.

---

## Development Tooling

| Tool                    | Purpose                               |
| ----------------------- | ------------------------------------- |
| `pnpm`                  | Fast, disk-efficient package manager  |
| `drizzle-kit`           | Schema migrations (`pnpm db:migrate`) |
| `eslint` + `prettier`   | Linting & formatting                  |
| `husky` + `lint-staged` | Pre-commit hooks                      |

---

## Summary

| Concern             | Solution                          |
| ------------------- | --------------------------------- |
| Fullstack framework | Next.js 16 (App Router)           |
| Language            | TypeScript                        |
| Database            | Neon — Serverless PostgreSQL      |
| ORM                 | Drizzle ORM                       |
| Auth & RBAC         | Auth.js v5 (JWT)                  |
| Forms & validation  | react-hook-form + Zod             |
| UI components       | Tailwind CSS + shadcn/ui          |
| PDF generation      | @react-pdf/renderer (server-side) |
| Deployment          | Vercel Hobby (free)               |
| Package manager     | pnpm                              |
