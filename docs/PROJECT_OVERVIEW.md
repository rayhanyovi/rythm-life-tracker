# Rythm — Project Overview

> **Read this first.** Five minutes here gives you the product context for everything else in `/docs`.

## What Is Rythm

**Rythm** (deliberately spelled with one `h`) is a personal life-rhythm tracker delivered as an installable Progressive Web App.

In one sentence: *Rythm helps people build a calm daily rhythm by checking off recurring quests and one-time milestones, without gamification or analytics theater.*

In one paragraph: Rythm gives a single user a clean, mobile-first surface to define the activities that matter (Daily, Weekly, Monthly, or one-time Main quests), group them into life categories, and check them off for the current period. The app remembers completion per period, computes streaks for recurring quests, and provides a chronological activity log for review and correction. Authentication, data, and PWA installation all work end-to-end.

In a longer paragraph: The product is opinionated about *what it is not*. It is not a habit-tracker game with XP, levels, badges, or social leaderboards. It is not a productivity dashboard with KPI walls and analytics charts. It is not a generic task manager with projects, deadlines, and assignments. Rythm is a quiet ritual tool — closer in feel to Linear, Todoist, or Notion than to Habitica or Strava — designed for adults who want personal structure without performance theater. Every product and design decision should compress toward that stance.

## The Problem It Solves

Many people who want more discipline in their lives fail to keep it because:

1. They have no system for tracking recurring intentions across different life domains (spiritual, finance, health, etc.).
2. Their existing routines feel scattered across calendars, notebooks, and reminders.
3. The habit-tracker apps they try are either too gamified (XP, streaks-as-currency, social pressure) or too complex (sub-tasks, projects, deadlines, analytics).

Rythm answers this with a deliberately minimal model: a user defines quests grouped by category; each period (today, this week, this month, or "ever" for Main quests) the quest is either checked or not; streaks are visible but never the point.

## Who It Is For

Primary persona: an individual who already values structure and consistency, who returns to the app from a phone in the morning or evening, and who wants to know quickly:

- *what is on my plate for the current period*
- *what have I already completed*
- *what is my current streak*

The MVP target user is the founder and the founder's partner — a small, captive audience who can validate the product loop quickly. Broader rollout is downstream.

## Product Philosophy

Rythm should feel:

- **calm** — visually quiet, not energetic
- **structured** — clear hierarchy, predictable layout
- **honest** — never inflate progress, never hide gaps
- **list-led** — grouped rows beat card galleries
- **mobile-first** — installable PWA, comfortable on a phone in a single hand
- **non-gamified** — no XP, no badges, no celebrations

If a design or feature decision moves the product toward "looks like a startup admin dashboard" or "feels like a habit-tracker game," it is a wrong-direction signal.

## What Makes Rythm Different

| Other category | Rythm's stance |
|---|---|
| Gamified habit trackers (Habitica, Streaks) | No XP, no badges, no celebratory animations. Streak is informational, not currency. |
| Productivity dashboards (Notion templates, Things) | No projects, no deadlines, no sub-tasks. Period-based completion is the only model. |
| Analytics-heavy trackers (HabitNow, Way of Life) | No charts, no trend graphs, no scoring. Activity log is chronological text. |
| Generic to-do apps (Todoist, Microsoft To Do) | Recurring is first-class, not bolted on. Period reset is built into the data model. |
| Wellness/social apps (Strava, Fitbit) | Single-user. No sharing, no comparison, no public leaderboards. |

## Current Status

The MVP is largely shipped:

- **Auth flow** — sign up, sign in, sign out, forgot password, reset password, email verification (with a local-dev bypass flag)
- **Categories** — full CRUD plus reorder, with a default-category bootstrap on first login (Wheel of Life: Spiritual, Finance, Career, Health, Personal Growth, Relationship)
- **Quests** — full CRUD (DAILY / WEEKLY / MONTHLY / MAIN) with search, filter, deactivate vs delete
- **Dashboard** — current-period view, category filter, show-inactive toggle, quick check/uncheck, optional completion notes, streak badge
- **History** — chronological activity log, filter by quest/category/type, edit completion notes, delete completion records
- **PWA** — manifest, icons, service worker for shell caching, offline fallback page
- **Deployment posture** — Next.js fullstack on Vercel, Better Auth + Prisma + PostgreSQL-compatible, deployment env checker, Resend integration for auth emails

A live IA pivot is in flight: the sidebar already shows "Tasks-first" labels (`Today`, `Lists`, `Habit Lists`, `Activity Log`) with `Upcoming`, `Calendar`, and `Journal` as disabled placeholders. Underlying routes (`/dashboard`, `/quests`, `/categories`, `/history`) remain on the Quest data model. Whether to commit to Tasks-first or revert to Quest naming is an unsettled product decision tracked in [PRODUCT_PLAN.md](./PRODUCT_PLAN.md#open-strategic-decisions).

## Current Limitations

These are honest constraints to be aware of, not bugs:

- **Single-user only.** No sharing, no team accounts, no household mode.
- **One database, one timezone default.** All period calculations default to `Asia/Jakarta`; multi-timezone users will see periods aligned to that timezone.
- **No offline mutation queue.** The PWA caches the shell and serves an offline fallback page, but writes require a live connection.
- **English-only UI.** Copy is intentionally English; localization is not on the near-term roadmap.
- **No analytics.** This is a product stance, not a missing feature. Charts and trend lines are explicitly out of scope.
- **Database provider not finalized.** The schema is portable across PostgreSQL-compatible providers; the actual production provider has not been chosen yet.

## Where To Go Next

- For roadmap, priorities, and acceptance criteria → [PRODUCT_PLAN.md](./PRODUCT_PLAN.md)
- For visual DNA, IA, and component rules → [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md)
- For architecture, schema, API, env, and deployment → [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md)
- For agent workflow and source-of-truth conflicts → [AGENT_HANDOFF.md](./AGENT_HANDOFF.md)
