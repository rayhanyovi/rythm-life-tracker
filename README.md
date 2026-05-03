# Rythm

A personal life-rhythm tracker. Build a rhythm you can actually keep — recurring quests and one-time milestones, checked off period by period, with no gamification and no analytics theater.

Installable PWA. Single user. Mobile-first. Calm, structured, honest.

## Documentation

All canonical project documentation lives in [`/docs`](./docs):

| Doc | Read it when… |
|---|---|
| [docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) | You want the 5-minute version of what Rythm is, who it's for, and what's currently shipped. |
| [docs/PRODUCT_PLAN.md](./docs/PRODUCT_PLAN.md) | You're deciding scope, priority, or acceptance criteria — or checking the **Open Strategic Decisions**. |
| [docs/DESIGN_DIRECTION.md](./docs/DESIGN_DIRECTION.md) | You're touching UI, IA, tokens, or component rules. |
| [docs/TECHNICAL_PLAN.md](./docs/TECHNICAL_PLAN.md) | You're touching architecture, schema, API, env, deployment, or QA. |
| [docs/AGENT_HANDOFF.md](./docs/AGENT_HANDOFF.md) | **Start here if you're an AI coding agent.** Tells you what to read, what to avoid, and how to ship a change cleanly. |

Reference artifacts:

- [docs/landing-page.html](./docs/landing-page.html) — landing page wireframe and copy deck
- [docs/wireframes.html](./docs/wireframes.html) — full app wireframe spec
- [docs/archive/](./docs/archive) — historical PRD and superseded wireframes (do not use as source of truth)

## Quickstart

```bash
# Install
npm install

# Local Postgres in Docker
npm run docker:db

# Configure env (copy .env.example → .env.local, fill in values)
# At minimum: BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL

# Apply migrations
npm run prisma:migrate:dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For full setup, env reference, and deployment notes, see [docs/TECHNICAL_PLAN.md](./docs/TECHNICAL_PLAN.md).

## Stack

Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Better Auth · Prisma 7 · PostgreSQL · Vercel.

## Status

MVP largely shipped. Open work is tracked in [docs/PRODUCT_PLAN.md](./docs/PRODUCT_PLAN.md). Three strategic decisions remain unresolved (IA direction, database provider, `Habit Lists` data model) — they're documented honestly in the same file.

## Project Layout

```
app/                # Next.js App Router (auth, app, api routes, PWA shell)
components/         # ui/ primitives, app/ shared layout, feature folders
lib/                # env, auth, db, periods, streaks, validators
prisma/             # schema + canonical migration baseline
scripts/            # env check, discipline check, layout review, demo seed
tests/              # node:test unit tests
docs/               # canonical product, design, technical, and agent docs
quest-companion/    # frozen prototype reference — off-limits for new work
```

## License

Private project. All rights reserved.
