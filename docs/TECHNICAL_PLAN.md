# Rythm — Technical Plan

This is the canonical technical reference for Rythm. Architecture, schema, API contract, conventions, environment, deployment, and quality gates all live here. If you're touching code, this is the doc that owns the answer.

> Read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) first for context. Read [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) before changing scope. Read [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) before changing UI.

## Table Of Contents

1. [Architecture](#1-architecture)
2. [App Structure](#2-app-structure)
3. [Domain Model](#3-domain-model)
4. [Database Schema](#4-database-schema)
5. [Period And Streak Rules](#5-period-and-streak-rules)
6. [API Contract](#6-api-contract)
7. [Authentication Flow](#7-authentication-flow)
8. [Conventions And Guardrails](#8-conventions-and-guardrails)
9. [Environment Variables](#9-environment-variables)
10. [Local Development](#10-local-development)
11. [Deployment](#11-deployment)
12. [Database Provider Options](#12-database-provider-options)
13. [Testing And QA](#13-testing-and-qa)
14. [Performance And Accessibility](#14-performance-and-accessibility)
15. [Known Technical Debt](#15-known-technical-debt)

---

## 1. Architecture

### Stack

- **Runtime:** Next.js 16 (App Router) on Node.js, deployed to Vercel
- **UI:** React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui primitives
- **Auth:** Better Auth (`better-auth` + `@better-auth/prisma-adapter`)
- **ORM:** Prisma 7 (`@prisma/client` + `@prisma/adapter-pg` + `pg`)
- **Database:** Neon (serverless Postgres) — see [Section 12](#12-database-provider-options)
- **Testing:** `node:test` + `tsx` for unit tests; `@playwright/test` for browser smoke
- **PWA:** custom `app/manifest.ts` + service worker registered from `components/pwa/pwa-register.tsx`

### High-Level Diagram

```text
Browser / installed PWA
   │
   ▼
Next.js App Router (Vercel, Node.js runtime)
   ├── Server Components / Server Actions
   ├── Route Handlers (app/api/**/route.ts)
   └── Better Auth handler at /api/auth/[...all]
        │
        ▼
   Prisma 7 (driver adapter: @prisma/adapter-pg)
        │
        ▼
   PostgreSQL-compatible database
```

### Architectural Rules

- The browser client is for session-aware UI and lightweight interactions. **Mutations and authoritative reads go through the server boundary**, never client-direct-to-database.
- Better Auth owns the session cookie and auth lifecycle.
- Prisma is the source of truth for the data model and query execution.
- **Authorization is enforced in application server code, not via RLS.** Every protected route handler validates session and ownership.
- UI primitives are standardized through `shadcn/ui` and live in `components/ui`. Product-level composition lives in `components/app/` and feature folders.
- Route handlers that touch Prisma run on the **Node.js runtime**, not Edge.

---

## 2. App Structure

Verified against the current repo layout. Paths are relative to the repo root.

### Routes

```
app/
  page.tsx                              # public landing OR redirect to /dashboard
  layout.tsx                            # root layout, metadata, fonts
  manifest.ts                           # PWA manifest
  icon.tsx, apple-icon.tsx              # dynamic icons
  pwa/icon-192.png/route.tsx            # PWA icon 192
  pwa/icon-512.png/route.tsx            # PWA icon 512

  (auth)/                               # auth route group
    layout.tsx
    sign-in/page.tsx
    sign-up/page.tsx
  forgot-password/page.tsx              # outside (auth) for layout reasons
  reset-password/page.tsx

  (app)/                                # authenticated app group
    layout.tsx                          # mounts AppShell
    loading.tsx, error.tsx
    calendar/page.tsx
    dashboard/page.tsx
    upcoming/page.tsx
    quests/page.tsx
    categories/page.tsx
    history/page.tsx

  offline/page.tsx                      # PWA offline fallback

  api/
    auth/[...all]/route.ts              # Better Auth handler
    bootstrap/default-categories/route.ts
    categories/route.ts
    categories/[id]/route.ts
    categories/reorder/route.ts
    quests/route.ts
    quests/[id]/route.ts
    quests/[id]/current-completion/route.ts
    completions/[id]/route.ts
    calendar/route.ts
    dashboard/route.ts
    upcoming/route.ts
    history/route.ts
```

Every API route under `app/api/` declares `export const runtime = "nodejs"` because they all touch Prisma.

### Components

```
components/
  ui/                                   # shadcn/ui primitives (button, input, sheet, …)
  app/                                  # shared product layout
    app-shell.tsx                       # authenticated shell, mobile drawer, desktop sidebar
    app-sidebar.tsx                     # nav rail (Tasks-first labels currently)
    auth-shell.tsx, auth-card.tsx, auth-form.tsx
    request-password-reset-form.tsx, reset-password-form.tsx
    sign-out-button.tsx
    empty-state.tsx                     # shared app empty-state primitive
  marketing/
    landing-page.tsx                    # public landing
  pwa/
    pwa-register.tsx                    # service worker registration
  dashboard/dashboard-screen.tsx
  upcoming/upcoming-screen.tsx
  calendar/calendar-screen.tsx
  quests/quest-manager.tsx
  categories/category-manager.tsx
  history/history-screen.tsx
```

### lib/

Domain logic lives in `lib/`. Direct imports of these are preferred over reimplementing.

| File | Responsibility |
|---|---|
| `lib/auth.ts` | Better Auth server config |
| `lib/auth-client.ts` | Better Auth client instance |
| `lib/auth-email.ts` | Email delivery for verification + reset (Resend or fallback log) |
| `lib/db.ts` | Prisma client singleton (dev-safe) |
| `lib/env.ts` | Env resolver — single source of truth for env access; do not read `process.env` directly elsewhere |
| `lib/session.ts` | `sessionApi` — central session access; tests can swap implementations |
| `lib/periods/index.ts` | Period key calculation (DAILY / WEEKLY / MONTHLY / MAIN) |
| `lib/streaks/index.ts` | Streak calculation |
| `lib/dashboard.ts`, `lib/upcoming.ts`, `lib/calendar.ts`, `lib/quests.ts`, `lib/categories.ts`, `lib/history.ts` | Domain-level data access used by API routes |
| `lib/category-defaults.ts` | Wheel-of-Life seed |
| `lib/validators/*.ts` | Zod payload validators (category, quest, completion, dashboard, upcoming, calendar, history) |
| `lib/http.ts` | Shared HTTP helpers for route handlers |
| `lib/utils.ts` | `cn()` and small utility helpers |

### prisma/

```
prisma/
  schema.prisma
  migrations/
    20260311170000_init/migration.sql   # canonical baseline
```

Prisma CLI is configured via `prisma.config.ts` at the repo root.

### scripts/

```
scripts/
  check-env.ts                          # used by env:check, env:check:deployment
  check-repo-discipline.ts              # enforces repo boundaries
  capture-layout-review.ts              # used by qa:layout
  prepare-e2e-db.ts                     # starts local Postgres and creates rythm_e2e for Playwright
  postcss-from-fallback.cjs             # sets PostCSS result.opts.from before Tailwind v4 runs
  seed-demo.ts                          # demo data seed
```

### Other root files worth knowing

- `package.json` — scripts catalogue
- `prisma.config.ts` — Prisma CLI config; loads env from `.env.local` / `.env`
- `compose.yaml`, `Dockerfile`, `.dockerignore` — local Docker stack
- `.env.example` — env baseline (also referenced by Docker workflows; see Section 9 → Env Files)
- `tests/` — `node:test` unit tests
- `playwright/` (or `tests/e2e/`) — Playwright e2e
- `quest-companion/` — frozen prototype reference; **off-limits for new work** (enforced by `npm run discipline:check`)

---

## 3. Domain Model

Defined in [prisma/schema.prisma](../prisma/schema.prisma). TypeScript domain types are derived from Prisma client output; project-shared types live in [types/app.ts](../types/app.ts).

### Enums

```ts
enum QuestType {
  DAILY
  WEEKLY
  MONTHLY
  MAIN
}

// PeriodType is the same set of values in code
type PeriodType = QuestType;
```

### Better Auth Tables

Better Auth manages four core tables. They are owned by Better Auth's schema generation; do not modify their fields without coordinating with Better Auth's adapter expectations.

- `user` (id, email, name, emailVerified, image, createdAt, updatedAt)
- `session` (id, userId, token, expiresAt, ipAddress, userAgent, …)
- `account` (id, providerId, accountId, userId, password, …)
- `verification` (id, identifier, value, expiresAt, …)

App-domain tables reference `user.id` directly. They are **not** dependent on any third-party `auth.users` shape.

### Application Tables

```ts
type Category = {
  id: string;
  userId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
};

type Quest = {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  questType: QuestType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type QuestCompletion = {
  id: string;
  userId: string;
  questId: string;
  periodType: QuestType;
  periodKey: string;
  completedAt: string;
  note: string | null;
  createdAt: string;
};
```

### Derived Type — Dashboard Item

```ts
type DashboardQuestItem = {
  questId: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string | null;
  questType: QuestType;
  isActive: boolean;
  isCompletedNow: boolean;
  currentPeriodKey: string;
  streak: number | null; // null for MAIN — UI shows "—"
  completionId: string | null;
  note: string | null;
};
```

---

## 4. Database Schema

### Tables

```sql
-- categories
id          string  primary key (cuid)
user_id     string  not null  references user(id) on delete cascade
name        text    not null
sort_order  int     not null default 0
created_at  timestamptz not null default now()

unique  (user_id, name)
index   (user_id, sort_order)
```

```sql
-- quests
id          string  primary key (cuid)
user_id     string  not null  references user(id) on delete cascade
category_id string  not null  references categories(id) on delete restrict
title       text    not null
description text    null
quest_type  enum('DAILY','WEEKLY','MONTHLY','MAIN') not null
is_active   boolean not null default true
created_at  timestamptz not null default now()
updated_at  timestamptz not null default now() (auto-updated by Prisma + DB trigger)

index (user_id, category_id)
index (user_id, quest_type, is_active)
```

```sql
-- quest_completions
id           string  primary key (cuid)
user_id      string  not null  references user(id) on delete cascade
quest_id     string  not null  references quests(id) on delete cascade
period_type  enum('DAILY','WEEKLY','MONTHLY','MAIN') not null
period_key   text    not null
completed_at timestamptz not null default now()
note         text    null
created_at   timestamptz not null default now()

unique (user_id, quest_id, period_type, period_key)
index  (user_id, quest_id, period_type, period_key)
index  (user_id, completed_at desc)
```

### Integrity Rules

- `quests.user_id` must equal the `user_id` of the referenced category.
- `quest_completions.user_id` must equal `quests.user_id`.
- `quest_completions.period_type` must equal `quests.quest_type`.
- `MAIN` quests always use `period_key = 'ONE_TIME'`.
- These constraints are enforced both in the schema (FKs + unique) and in route handler logic.

### Migration Baseline

The canonical baseline migration is [`prisma/migrations/20260311170000_init/migration.sql`](../prisma/migrations/20260311170000_init/migration.sql). It includes:

- Better Auth tables
- App-domain tables with all constraints and indexes
- A trigger keeping `quests.updated_at` consistent for writes that occur outside Prisma

Future migrations layer on top of this baseline. Do not edit the canonical baseline retroactively — generate a follow-up migration instead.

---

## 5. Period And Streak Rules

### Period Key Format

| Quest Type | Period Key | Example |
|---|---|---|
| `DAILY` | `YYYY-MM-DD` | `2026-05-03` |
| `WEEKLY` | ISO week-year + week | `2026-W18` |
| `MONTHLY` | `YYYY-MM` | `2026-05` |
| `MAIN` | constant | `ONE_TIME` |

### Single-Helper Rule

**All period_key calculation goes through [`lib/periods`](../lib/periods/index.ts).** Do not recompute period keys ad-hoc in route handlers, components, or server actions. Inconsistent period calculation is a top source of timezone bugs and streak mismatches.

### Default Timezone

`Asia/Jakarta`. Set via `NEXT_PUBLIC_APP_TIMEZONE`; falls back to the constant in `lib/env.ts`.

### Streak Rule

Defined in [`lib/streaks`](../lib/streaks/index.ts). Streaks apply to `DAILY`, `WEEKLY`, `MONTHLY` only. `MAIN` returns `null` (UI displays `—`).

**Current streak** = number of consecutive completed periods ending at:

- the current period, **if** the quest is completed for the current period; otherwise
- the previous period (the streak is still visible even if today is not yet checked, but breaks if there's any gap before the previous period).

This means a user who hasn't checked today still sees their streak, but the streak resets to 0 the moment they have an unchecked period older than the most recent.

### MVP Strategy

Streaks are computed in the application layer using a bounded fetch:

- DAILY: last 90 periods
- WEEKLY: last 52 periods
- MONTHLY: last 24 periods

If performance ever becomes a problem, move this to a DB function or materialized view. Not a current concern.

---

## 6. API Contract

All routes are App Router route handlers under `app/api/`. All return JSON. Every protected route validates the Better Auth session and filters by the resolved `user.id` server-side. Clients **must not** send `userId` as a parameter.

### 6.1 Auth — `/api/auth/[...all]`

Catch-all handled by Better Auth's `toNextJsHandler`. Used for sign-in, sign-up, sign-out, password reset request, password reset, email verification, resend verification.

Implementation lives in [app/api/auth/[...all]/route.ts](../app/api/auth/[...all]/route.ts). Configuration in [lib/auth.ts](../lib/auth.ts) sets:

- email + password authentication
- `emailAndPassword.sendResetPassword` enabled
- `emailVerification.sendVerificationEmail` enabled
- `sendOnSignUp` and `sendOnSignIn` true (verification required for first sign-in)
- reset token TTL: 1 hour
- reset password revokes existing sessions
- `allowedHosts`: `localhost:3000`, host of `BETTER_AUTH_URL`, `*.vercel.app`

### 6.2 Dashboard — `GET /api/dashboard`

Query params:

- `date?: string` — ISO date `YYYY-MM-DD`; if absent, server uses current date in app timezone
- `categoryId?: string` — filter to one category
- `includeInactive?: boolean` — show deactivated quests in the response

Response:

```ts
type DashboardResponse = {
  date: string;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    items: DashboardQuestItem[];
  }>;
};
```

### 6.3 Upcoming — `GET /api/upcoming`

Query params:

- `horizon?: "7" | "14" | "30"` — defaults to `7`
- `start?: string` — ISO date `YYYY-MM-DD`; if absent, server uses the current local date
- `categoryId?: string` — filter to one category
- `questType?: "DAILY" | "WEEKLY" | "MONTHLY"` — `MAIN` is intentionally excluded because one-time tasks have no due date in the current schema

Response:

```ts
type UpcomingResponse = {
  startDate: string;
  endDate: string;
  horizonDays: number;
  groups: Array<{
    date: string;
    items: Array<{
      questId: string;
      categoryId: string;
      categoryName: string;
      title: string;
      description: string | null;
      questType: "DAILY" | "WEEKLY" | "MONTHLY";
      periodKey: string;
      isCompleted: boolean;
      completionId: string | null;
      note: string | null;
    }>;
  }>;
};
```

Projection rule: daily quests appear on every future day in the horizon. Weekly and monthly quests appear once when a new period enters the horizon. Current-period rows are excluded so Upcoming does not duplicate Today.

### 6.4 Calendar — `GET /api/calendar`

Authenticated route. Requires session.

Query params:

- `month?: string` — `YYYY-MM`; defaults to the current app month
- `categoryId?: string` — filter to one category-backed habit list
- `questType?: "DAILY" | "WEEKLY" | "MONTHLY"` — `MAIN` is intentionally excluded because one-time tasks have no due date in the current schema

Response:

```ts
type CalendarResponse = {
  month: string;
  startDate: string;
  endDate: string;
  days: Array<{
    date: string;
    dayOfMonth: number;
    inMonth: boolean;
    isToday: boolean;
    totalCount: number;
    completedCount: number;
    items: Array<{
      questId: string;
      categoryId: string;
      categoryName: string;
      title: string;
      description: string | null;
      questType: "DAILY" | "WEEKLY" | "MONTHLY";
      periodKey: string;
      isCompleted: boolean;
      completionId: string | null;
      note: string | null;
    }>;
  }>;
};
```

Projection rule: daily tasks appear on every visible calendar cell. Weekly and monthly tasks appear once per visible period. The API returns a stable 42-cell month grid so the client layout does not shift between months.

### 6.5 Categories

| Method + Path | Body / Params | Notes |
|---|---|---|
| `GET /api/categories` | none | Returns all categories for the session user, sorted by `sort_order asc` |
| `POST /api/categories` | `{ name }` | Trims whitespace; rejects duplicate per user |
| `PATCH /api/categories/:id` | `{ name? }` | Same validation as create |
| `POST /api/categories/reorder` | `{ categoryIds: string[] }` | Reassigns `sort_order` based on array index |
| `DELETE /api/categories/:id` | none | **Rejected if any quest references the category.** Error message asks user to move or delete quests first. |

### 6.6 Quests

| Method + Path | Body / Params | Notes |
|---|---|---|
| `GET /api/quests` | `?search&categoryId&questType&includeInactive` | List view |
| `POST /api/quests` | `{ categoryId, title, description?, questType, isActive? }` | Validates ownership of `categoryId` |
| `GET /api/quests/:id` | none | Single quest |
| `PATCH /api/quests/:id` | `{ categoryId?, title?, description?, questType?, isActive? }` | Same ownership validation |
| `DELETE /api/quests/:id` | none | Hard delete; cascades to completions |

### 6.7 Current Completion

| Method + Path | Body | Notes |
|---|---|---|
| `PUT /api/quests/:id/current-completion` | `{ note?: string }` | Server computes `period_key` from quest type + app timezone. Upserts `(user_id, quest_id, period_type, period_key)`. |
| `DELETE /api/quests/:id/current-completion` | none | Removes the completion for the active period. |

### 6.8 Completion Note And Delete

| Method + Path | Body | Notes |
|---|---|---|
| `PATCH /api/completions/:id` | `{ note: string \| null }` | Edits the note on a specific completion. |
| `DELETE /api/completions/:id` | none | Used by history correction flow to remove an old completion. |

### 6.9 History — `GET /api/history`

Query params:

- `from?, to?` — date range
- `questId?, categoryId?, questType?` — filters
- `cursor?` — pagination cursor

Response:

```ts
type HistoryResponse = {
  items: Array<{
    completionId: string;
    completedAt: string;
    note: string | null;
    questId: string;
    questTitle: string;
    questType: QuestType;
    categoryId: string;
    categoryName: string;
    periodKey: string;
  }>;
  nextCursor: string | null;
};
```

### 6.10 Default-Category Bootstrap — `POST /api/bootstrap/default-categories`

Idempotently creates the Wheel-of-Life seed (Spiritual / Finance / Career / Health / Personal Growth / Relationship). Only creates categories that don't already exist for the user. Called automatically after first login.

### Validation Rules (Cross-Cutting)

- `Category.name`: required, trimmed, unique per user.
- `Quest.title`: required, trimmed.
- `Quest.categoryId`, `Quest.questType`: required, must reference a category owned by the same user.
- `Completion.note`: optional, trimmed, nullable.
- A completion cannot be created for a quest the user does not own.
- A completion's `period_type` must match the parent quest's `quest_type`.

Shared validators live under [`lib/validators/*`](../lib/validators).

---

## 7. Authentication Flow

### Library

Better Auth ([`better-auth`](../node_modules/better-auth)) configured in [lib/auth.ts](../lib/auth.ts).

### Server Setup

- `auth.api.getSession({ headers: await headers() })` is the canonical way to read the session inside server components and route handlers.
- The central wrapper is [`lib/session.ts`](../lib/session.ts) — `sessionApi` — which tests can stub.
- Session cookie is set by Better Auth; client uses `auth-client.ts` for sign-in/sign-up/reset flows.
- `allowedHosts`: `localhost:3000` + host from `BETTER_AUTH_URL` + `*.vercel.app`.
- `trustedOrigins`: `http://localhost:3000` + origin from `BETTER_AUTH_URL` + `https://*.vercel.app`.

### Email Delivery

- Verification and reset emails go through Resend when `AUTH_EMAIL_FROM` and `RESEND_API_KEY` are set.
- If either is missing, [lib/auth-email.ts](../lib/auth-email.ts) falls back to a structured server log so local dev keeps moving.
- `npm run env:check:deployment` blocks deploy if either is missing.

### Email Verification Posture

- Required for first sign-in by default.
- Local dev can bypass with `RYTHM_DEV_SKIP_EMAIL_VERIFICATION=true`. The bypass is gated to non-Vercel runtimes only and refused by the deployment env check.
- Reset password tokens live for 1 hour and revoke old sessions when consumed.

---

## 8. Conventions And Guardrails

### Package Manager

- `npm` is canonical. `package-lock.json` is the lockfile of record.
- Do not introduce `pnpm`, `yarn`, or `bun` lockfiles.

### Component Library

- `shadcn/ui` for primitives. Files in `components/ui` are generated/forked from shadcn — keep them close to upstream patterns.
- Shared product primitives in `components/app/` are intentionally narrow (`AppShell`, `AppSidebar`, auth helpers, sign-out, and `EmptyState`).
- Feature screens in `components/dashboard|upcoming|calendar|quests|categories|history` own their list/detail composition directly so they can match the Tasks-first four-zone shell without drifting back to metric-card or card-gallery helpers.
- Do not mix multiple UI kits.

### Tokens And Styling

- [`app/globals.css`](../app/globals.css) is the **source of truth** for color, font, radius, shadow, and surface tokens. See [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md#section-4--color-system).
- Do not hardcode `hsl(...)`, `oklch(...)`, `rgba(...)`, gradient literals, or shadow literals inside components when a token can represent the value.
- Add a token to `app/globals.css` first if a new surface treatment is genuinely needed.

### Filter / Form Density

- Compact filters use `Select` + `Checkbox` + `Sheet` + `AlertDialog` from `shadcn/ui` to keep mobile and desktop behavior consistent.

### Server / Client Boundaries

- Browser-only code lives behind explicit `"use client"` components.
- Provider calls that need control, caching, or protection live behind server boundaries.
- Mutations and authoritative reads go through route handlers or server actions, not direct database calls from the browser.

### Repo Boundaries

- Implement in the **root Next.js app**, never in `quest-companion/`. The discipline guard ([scripts/check-repo-discipline.ts](../scripts/check-repo-discipline.ts)) enforces this.
- The discipline guard also expects every source change to ship with a tracker update in `docs/PRODUCT_PLAN.md`.

### Commits

- Format: `<tag>: <task name>` — e.g., `feat: Add Upcoming agenda surface`, `fix: Stop client from sending userId`.
- Allowed tags: `feat`, `fix`, `refactor`, `docs`, `chore`, `ui`, `style`.
- Create a separate commit per finished task unless the active instruction is to defer commits.
- **Never** use `--no-verify` or `--no-gpg-sign` to skip hooks. Fix the underlying issue.

### Don't-Break List

The following are load-bearing and changing them is a high-risk move requiring user confirmation:

- The single-helper rule for period_key (`lib/periods/`).
- The unique constraint on `(user_id, quest_id, period_type, period_key)`.
- The Node.js runtime declaration on every Prisma route.
- The server-side ownership filter on every protected route.
- The `quest-companion/` boundary (treat as read-only).

---

## 9. Environment Variables

All env access goes through [`lib/env.ts`](../lib/env.ts). Do not read `process.env.X` directly elsewhere.

### Required

#### `BETTER_AUTH_SECRET`

Random secret used by Better Auth to sign tokens.

```env
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
```

- Mandatory in preview and production.
- Local dev has a fallback constant in `lib/env.ts` (`rythm-local-build-secret-change-me-before-deploy`); **do not rely on it** — explicit is safer.
- The deployment env checker rejects empty / default values.

#### `BETTER_AUTH_URL`

Base URL the app announces to Better Auth.

```env
BETTER_AUTH_URL=http://localhost:3000
```

- Local: `http://localhost:3000` (or whatever port you use).
- Preview: the preview domain or production domain depending on what flow you want to test.
- Production: the final domain, e.g., `https://app.example.com`.
- Deployment env checker rejects values still pointing at `localhost`.

#### `DATABASE_URL`

Connection string for Prisma.

```env
# Next.js on host, Postgres on host or Docker
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rythm?schema=public

# Next.js inside Docker Compose, Postgres in compose service `db`
DATABASE_URL=postgresql://postgres:postgres@db:5432/rythm?schema=public
```

- Mandatory in preview and production.
- Local dev has a fallback to `localhost:5432` in `lib/env.ts` for non-Vercel runtimes; the actual database still has to exist for migrations and queries to work.

### Optional — Runtime

#### `DIRECT_URL`

Direct (non-pooled) connection string for Neon. Required because `DATABASE_URL` points at Neon's PgBouncer pooler, which cannot execute DDL (migrations). `prisma.config.ts` passes this to the Prisma CLI for `prisma migrate deploy`. The app's `@prisma/adapter-pg` client uses `DATABASE_URL` (pooled). Both must be set in every deployed environment.

#### `NEXT_PUBLIC_APP_TIMEZONE`

Default app timezone for period calculations. Falls back to `Asia/Jakarta`. Exposed to the client (because of the `NEXT_PUBLIC_` prefix).

```env
NEXT_PUBLIC_APP_TIMEZONE=Asia/Jakarta
```

#### `AUTH_EMAIL_FROM`

Sender for verification and reset emails.

```env
AUTH_EMAIL_FROM=Rythm <auth@your-domain.com>
```

- Pairs with `RESEND_API_KEY`.
- Without it, email delivery falls back to a server log.
- Deployment env checker fails if missing in preview / production because email verification is part of the auth MVP.

#### `RESEND_API_KEY`

API key for Resend.

```env
RESEND_API_KEY=re_xxx
```

- Pairs with `AUTH_EMAIL_FROM`.
- Deployment env checker fails if missing in preview / production.

### Optional — Development And Testing

#### `RYTHM_DEV_SKIP_EMAIL_VERIFICATION`

Local-only flag to bypass email verification.

```env
RYTHM_DEV_SKIP_EMAIL_VERIFICATION=true
```

- Active only in non-Vercel runtimes.
- When set, sign-up and sign-in skip the verification step.
- Deployment env checker rejects this in preview / production.

#### `NEXT_PUBLIC_PWA_DEV_ENABLED`

Turn on service worker registration during local development. Off by default to prevent it from getting in the way of normal dev cycles.

```env
NEXT_PUBLIC_PWA_DEV_ENABLED=true
```

#### `RYTHM_E2E_AUTH_BYPASS`

Auth bypass for Playwright e2e suites. Requires the e2e request to also send the `x-rythm-e2e-user-id` header. Active only when explicitly set; `npm run test:e2e` sets it automatically. **Never** enable in preview or production.

```env
RYTHM_E2E_AUTH_BYPASS=true
```

#### E2E Database

Playwright e2e runs against a dedicated local Docker Postgres database, not the `DATABASE_URL` from `.env.local`. `npm run test:e2e` sets both URLs to:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rythm_e2e?schema=public
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/rythm_e2e?schema=public
```

The `pretest:e2e` lifecycle runs `npm run db:e2e:prepare`, which starts the Compose `db` service and creates `rythm_e2e` if it does not exist.

### Compose-Only Overrides

Read by [compose.yaml](../compose.yaml) for the local Postgres container — not by application code.

```env
POSTGRES_DB=rythm
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### Env Files

- `.env` / `.env.local` — local development with Next.js running on the host (used by Next.js runtime and Prisma CLI)
- `.env.docker` — optional explicit override file for full-stack Compose runs (`docker compose --env-file .env.docker up --build`); not shipped, create from a copy of `.env.example` with `DATABASE_URL=postgresql://postgres:postgres@db:5432/rythm?schema=public` if you want to override the Compose defaults
- [`.env.example`](../.env.example) — canonical baseline; suitable for both host and Compose flows (Compose uses `${VAR:-default}` fallbacks in [compose.yaml](../compose.yaml), so `.env.docker` is only needed for explicit overrides)

### Env Check Commands

```bash
npm run env:check                # safe local validator; reports active fallbacks
npm run env:check:deployment     # deploy gate — fails on missing required values
```

`env:check:deployment` fails when:

- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, or `DATABASE_URL` is missing or default.
- `BETTER_AUTH_URL` still points at `localhost`.
- `AUTH_EMAIL_FROM` or `RESEND_API_KEY` is missing.
- `RYTHM_DEV_SKIP_EMAIL_VERIFICATION=true`.

---

## 10. Local Development

### Quickstart (Next.js on host, Postgres on host or Docker)

1. `npm install` (runs `prisma generate` via `postinstall`)
2. Create `.env.local` from `.env.example` and fill in:
   ```env
   BETTER_AUTH_SECRET=replace-with-a-long-random-secret
   BETTER_AUTH_URL=http://localhost:3000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rythm?schema=public
   NEXT_PUBLIC_APP_TIMEZONE=Asia/Jakarta
   RYTHM_DEV_SKIP_EMAIL_VERIFICATION=true
   ```
3. Start a local Postgres. Easiest: `npm run docker:db` (just the database container).
4. `npm run prisma:migrate:dev` — creates the schema.
5. `npm run dev` — starts Next.js at http://localhost:3000.

`npm run dev` runs `db:prepare` first, which generates the Prisma client and applies pending migrations.

### Quickstart (Full Docker Compose)

1. `npm run docker:up` — builds the app image, starts Postgres + Next.js.
2. App is at http://localhost:3000.
3. Inside the container, `db:prepare` already ran via the entrypoint.

To override env explicitly (optional — Compose has built-in defaults for local dev):

```bash
cp .env.example .env.docker
# edit DATABASE_URL to point at the `db` service host:
#   DATABASE_URL=postgresql://postgres:postgres@db:5432/rythm?schema=public
# edit any other secrets you want to set explicitly
docker compose --env-file .env.docker up --build
```

Notes:

- Source code is bind-mounted; `node_modules` and `.next` live in named volumes for hot-reload stability on Docker Desktop.
- Postgres exposes `localhost:5432` even when the app runs in Compose, so you can attach a desktop client.

### Useful Scripts

```bash
npm run dev                          # Next.js dev server (auto-runs db:prepare)
npm run docker:up                    # Compose: app + db
npm run docker:db                    # Compose: db only
npm run docker:down                  # Stop and remove orphans

npm run prisma:generate              # Regenerate Prisma client
npm run prisma:validate              # Schema validation
npm run prisma:migrate:dev           # Apply migrations + create new
npm run prisma:migrate:deploy        # Apply migrations only (production-safe)
npm run prisma:migrate:status        # Migration status
npm run prisma:studio                # Prisma Studio GUI

npm run seed:demo                    # Seed demo data

npm run lint                         # ESLint
npm run test                         # node:test unit tests
npm run test:watch                   # node:test watch
npm run test:e2e                     # Playwright e2e (auto-sets E2E flags)
npm run qa:layout                    # Capture desktop + mobile screenshots
npm run verify                       # Canonical quality gate (env + prisma + test + lint + build)

npm run env:check                    # Local env validator
npm run env:check:deployment         # Deploy gate
npm run discipline:check             # Repo boundary + tracker guard
```

---

## 11. Deployment

### Target

A single Next.js fullstack app on Vercel. No separate backend service.

### Runtime

Every API route under `app/api/` declares `export const runtime = "nodejs"`. Locked routes:

- `app/api/auth/[...all]/route.ts`
- `app/api/bootstrap/default-categories/route.ts`
- `app/api/categories/route.ts`
- `app/api/categories/[id]/route.ts`
- `app/api/categories/reorder/route.ts`
- `app/api/completions/[id]/route.ts`
- `app/api/dashboard/route.ts`
- `app/api/upcoming/route.ts`
- `app/api/history/route.ts`
- `app/api/quests/route.ts`
- `app/api/quests/[id]/route.ts`
- `app/api/quests/[id]/current-completion/route.ts`

### Required Environment Variables (Preview And Production)

```
BETTER_AUTH_SECRET
BETTER_AUTH_URL
DATABASE_URL
AUTH_EMAIL_FROM
RESEND_API_KEY
```

### Optional

```
DIRECT_URL                       # if provider needs pooled + direct
NEXT_PUBLIC_APP_TIMEZONE         # defaults to Asia/Jakarta
```

### Preview Environment

- Use a real `BETTER_AUTH_SECRET` (no defaults).
- Use a preview database, not production.
- `BETTER_AUTH_URL` should match the preview domain unless you specifically want preview to talk to the production auth host.
- Better Auth's `allowedHosts` already accepts `*.vercel.app`.

### Production Environment

- Production-strength `BETTER_AUTH_SECRET`.
- Final domain in `BETTER_AUTH_URL`.
- Production database in `DATABASE_URL`.
- Production Resend credentials.

### Install / Build

- `npm install` triggers `prisma generate` via `postinstall`.
- `npm run build` runs Next.js production build.
- Recommended deploy gate: `npm run env:check:deployment` before letting the build proceed.
- Production migrations: `npm run prisma:migrate:deploy`.

### Deployment Smoke Checklist

After a preview or production URL is available, run the smoke flow once manually:

1. Open `/sign-up`, create a new account.
2. Verify email if verification is on; sign in.
3. Open `/categories` (Habit Lists). Create a habit list.
4. Open `/quests` (Lists). Create a `DAILY` task.
5. Open `/dashboard` (Today). Check the task. Add a note.
6. Open `/history`. Confirm the completion shows with habit list, cadence, human-readable time, and note.
7. Edit the note. Delete the completion.
8. Confirm the completion disappears from `/history` and Today returns to unchecked.
9. Sign out. Confirm protected routes redirect to `/sign-in`.

PWA smoke (after the data smoke passes):

1. Open the app on a real mobile device or devtools mobile emulation.
2. Confirm manifest and icons load.
3. Install via the browser's install prompt or "Add to Home Screen".
4. Open the installed app. Confirm shell renders.
5. Toggle airplane mode. Open a route. Confirm the offline fallback page loads.

### Deployment Posture (Already Done)

- Next.js App Router fullstack structure
- Better Auth route handler
- Canonical env resolver in `lib/env.ts`
- Prisma client generation on install
- Prisma CLI config at [`prisma.config.ts`](../prisma.config.ts)
- Env template ([`.env.example`](../.env.example))
- Deployment env checker
- Manifest, icons, minimal service worker
- All Prisma routes locked to Node.js runtime

### Deployment Open Items

- Choose a database provider — see [Section 12](#12-database-provider-options) and [PRODUCT_PLAN.md P0.2](./PRODUCT_PLAN.md#p02--pick-a-database-provider-and-migrate).
- Run the deployment smoke once against a preview URL.
- Validate real-device PWA install — see [PRODUCT_PLAN.md P0.3](./PRODUCT_PLAN.md#p03--real-device-pwa-install-validation).

---

## 12. Database Provider

**✅ RESOLVED — Neon.**

Neon (serverless Postgres) is the chosen provider. Baseline migration was applied on 2026-05-04.

### Connection Setup

Neon separates two connection endpoints that must both be configured:

| Variable | Endpoint | Used by |
|---|---|---|
| `DATABASE_URL` | Pooled (`*-pooler.*.neon.tech`) | `@prisma/adapter-pg` in the app runtime |
| `DIRECT_URL` | Direct (`*.neon.tech`, no `-pooler`) | Prisma CLI for `prisma migrate deploy` |

`prisma.config.ts` reads both via `getDatabaseUrl()` and `getDirectUrl()` from `lib/env.ts`.

The pooler (PgBouncer in transaction mode) cannot execute DDL. Always use `DIRECT_URL` for migrations.

### Vercel Env Setup

Set both variables in Vercel for every environment (preview + production):

```
DATABASE_URL=postgresql://neondb_owner:<password>@<branch>-pooler.<region>.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:<password>@<branch>.<region>.neon.tech/neondb?sslmode=require
```

Neon's Vercel integration can auto-wire per-branch `DATABASE_URL` for preview deployments. If enabled, also configure `DIRECT_URL` as the direct connection for the matching branch.

### Local Development

`.env.local` currently points to the Neon database. To switch to a local Docker Postgres instead, comment out the Neon lines and uncomment the local fallback line in `.env.local`. The `getDatabaseUrl()` function falls back to `postgresql://postgres:postgres@localhost:5432/rythm` if `DATABASE_URL` is unset and the runtime is not Vercel.

---

## 13. Testing And QA

### Canonical Quality Gate

```bash
npm run verify
```

Runs (in order):

1. `npm run env:check` — env sanity
2. `npm run prisma:validate` — schema validation
3. `npm run test` — node:test unit tests
4. `npm run lint` — ESLint
5. `npm run build` — Next.js production build

If `npm run verify` is clean locally, the same gate passes on CI. Treat its failures as blockers.

### Unit Tests

- Runner: `node --test --import tsx tests/index.test.ts`
- Source: [tests/](../tests/)
- Coverage priorities: helpers in `lib/periods`, `lib/streaks`, and `lib/validators/*`.
- Smoke-style route tests run against an in-memory DB stub via the `sessionApi` seam in `lib/session.ts` so the auth → category → quest → completion → history flow is verifiable without a real database.

### Browser E2E Tests

- Runner: `@playwright/test`
- Command: `npm run test:e2e`
- The script automatically sets:
  - `RYTHM_E2E_AUTH_BYPASS=true`
  - `NEXT_PUBLIC_PWA_DEV_ENABLED=true`
  - `PLAYWRIGHT_APP_PORT=3100`
  - `BETTER_AUTH_URL=http://localhost:3100`
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rythm_e2e?schema=public`
  - `DIRECT_URL=postgresql://postgres:postgres@localhost:5432/rythm_e2e?schema=public`
  - Starts the Docker Compose `db` service and creates `rythm_e2e` before Playwright starts
  - Forces a fresh dev server with `.next-e2e` dist dir
  - Pins Playwright `webServer.cwd` to the repo root; do not rely on the invoking terminal's parent directory
  - Uses `scripts/postcss-from-fallback.cjs` before `@tailwindcss/postcss` so Tailwind v4 receives a concrete CSS `from` path when Turbopack omits one
- Coverage:
  - Auth layout responsive
  - Forgot/reset password layouts
  - Authenticated app shell + dashboard + quest form + categories + history with mocked APIs
  - Manifest + icon endpoints
  - Service worker registration
  - Chromium mobile installability (no blocking errors)
  - Offline navigation fallback

### Manual Layout Review

```bash
npm run qa:layout
```

Captures desktop Chrome + Pixel 7 screenshots of:

- `sign-in`, `dashboard`, `quests`, `categories`, `history`

Saves to `.artifacts/manual-layout-review/<timestamp>/` for human review.

Use this when the change is large enough that automated tests alone aren't enough — typically before a UI release.

### Repo Discipline Guard

```bash
npm run discipline:check
```

Currently enforces:

- No source changes inside `quest-companion/`.
- Source changes must include a tracker update in `docs/PRODUCT_PLAN.md`.

### CI

GitHub Actions runs `npm run verify`, `npm run test:e2e`, and `npm run env:check:deployment` against dummy-but-valid env values to keep the repo deploy-ready.

### Manual Smoke Checklist

The deployment smoke flow lives in [Section 11](#11-deployment).

---

## 14. Performance And Accessibility

### Performance

- Prisma routes run on Node.js (not Edge) — Edge is incompatible with the `@prisma/adapter-pg` driver.
- Dashboard check / uncheck uses optimistic UI to feel instant; revert on error.
- Streak calc uses bounded fetch windows (90 / 52 / 24 periods). Move to DB function only if measured performance becomes a problem.
- Image assets use Next.js asset optimization where applicable.
- Service worker caches app shell only; data requests stay online-first.

### Accessibility

- Touch targets follow the design direction's mobile-first sizing (see [DESIGN_DIRECTION.md Section 9](./DESIGN_DIRECTION.md#section-9--responsive-behavior)).
- No screen depends on hover to reveal its primary path.
- Focus rings stay visible per the slate `--ring` token.
- Destructive actions are explicit and unembellished (see [DESIGN_DIRECTION.md Section 6](./DESIGN_DIRECTION.md#section-6--component-family-rules)).
- Form inputs come from `shadcn/ui` primitives which expose Radix-level accessibility hooks (labels, descriptions, error roles).
- `Sheet` and `AlertDialog` use Radix primitives for focus trapping and ESC dismiss.
- All routes work without JavaScript-only navigation patterns where reasonable; the App Router defaults this for free.

---

## 15. Known Technical Debt

In rough priority order. None of these are blocking the current MVP, but each is worth picking up at the right time.

### Default Boilerplate `README.md`

The repo `README.md` was the default Next.js boilerplate before this consolidation pass and is now a Rythm-specific landing card with a doc map.

### `quest-companion/` Reference App

The frozen prototype still ships in the repo. Discipline guard blocks edits to it, but it adds clone size and potential confusion. Decide whether to keep it (for future visual reference) or remove it entirely once the design migration in [PRODUCT_PLAN.md P1.1](./PRODUCT_PLAN.md#p11--token-migration-pass-on-componentsui-primitives) is complete.

### IA Route Renames Pending

The IA direction is settled (Tasks-first). Route renames (`/dashboard` → `/today`, etc.) are approved work but not yet implemented. Until the renames land, route paths remain at their old values. See [PRODUCT_PLAN.md IA Roadmap](./PRODUCT_PLAN.md#ia-roadmap-tasks-first) for the required sequence (resolve `Habit Lists` data model first, then rename in one coordinated commit that also updates `app/manifest.ts`, sidebar `href` values, Playwright e2e route refs, and the deployment smoke checklist).

### `lib/session.ts` Seam Underused

The `sessionApi` indirection exists specifically so route tests can swap session sources, but most route handlers still call `auth.api.getSession` directly. Migrating handlers to consistently use `sessionApi` would make the in-memory smoke tests more reliable.
