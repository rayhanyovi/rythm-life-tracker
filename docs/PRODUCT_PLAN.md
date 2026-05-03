# Rythm — Product Plan

This document is the single source of truth for **what's done, what's in flight, what's next, and what's deliberately out of scope**. It also surfaces unresolved strategic decisions that block downstream implementation work.

If a feature is not listed in here, it is not on the roadmap. Adding a feature requires updating this doc first.

## How To Read This Doc

1. Skim **Open Strategic Decisions** — these are unresolved product calls that block implementation. Don't start work that depends on them until they are settled.
2. Read **Feature Inventory** — the honest current state.
3. Read **Priority List** — the actionable next slices, with acceptance criteria.
4. Check **IA Roadmap** only if you're working on navigation, sidebar, route renames, or new surfaces.
5. Skim **Open Product Questions** at the end — these are not blocking but worth knowing about.

---

## Open Strategic Decisions

Decisions 2 and 3 are unresolved. Each blocks specific downstream work. **Do not pick one silently** — surface the question to the user and wait for a decision. Decision 1 is resolved (Tasks-first).

### 1. IA Direction: Quest Model vs Tasks-First

**Status:** ✅ RESOLVED — **Tasks-first wins.**

Routes are scheduled to be renamed: `/dashboard` → `/today`, `/quests` → `/lists`, `/categories` → `/habit-lists`, `/history` → `/activity-log`, with permanent redirects from the old paths. The `Upcoming`, `Calendar`, and `Journal` placeholder modules are valid forward roadmap items. See the IA-Conditional Roadmap section below for the implementation sequence.

The `Habit Lists` data model question (Strategic Decision 3) is now active — resolve it before implementing the route renames.

---

### 2. Database Provider

**Status:** unresolved.

**Background:** The schema is fully portable across PostgreSQL-compatible providers. Local development uses a Dockerized Postgres. Production has not been provisioned.

**Shortlist** (full comparison in [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md#database-provider-options)):

- **Prisma Postgres** — fastest path; tight Vercel + Prisma integration; preview URLs auto-wired.
- **Neon** — strong per-branch preview database story; serverless Postgres; slightly more setup for Prisma direct/pool URLs.
- **Supabase Postgres** — full Postgres with dashboard and ecosystem optionality; we don't use Supabase Auth or RLS so most of the value is unrealized.
- **Managed PostgreSQL (generic)** — vendor-neutral, more operational effort, weakest preview-environment story.

**Recommendation:** Prisma Postgres if the team wants the shortest path; Neon if per-branch preview databases are valuable. Defer Supabase and self-managed unless there is a specific reason.

**Blocks:** real production deployment, performance/quota planning, real `prisma migrate deploy` against production.

---

### 3. `Habit Lists` Data Model

**Status:** unresolved — now **implementation-blocking** since Decision 1 resolved to Tasks-first.

**Background:** The sidebar maps the existing `/categories` route to a label called `Habit Lists`. The schema has only one container entity: `Category`. Either:

- **(a)** `Habit Lists` is purely a UI label for `Category` and the schema does not change — the quickest path.
- **(b)** `Habit Lists` is a separate concept that holds a curated cadence (e.g., "Morning Routine" containing several Daily quests) and `Category` becomes a different concept (e.g., a life domain like "Health"), requiring a schema split.

Resolve this before starting the route-rename work, since the rename will also update nav labels and page copy.

---

## Feature Inventory

### Completed (verified in code)

Auth and account
- Sign in form ([app/(auth)/sign-in/page.tsx](../app/(auth)/sign-in/page.tsx))
- Sign up form ([app/(auth)/sign-up/page.tsx](../app/(auth)/sign-up/page.tsx))
- Forgot password ([app/forgot-password/page.tsx](../app/forgot-password/page.tsx))
- Reset password ([app/reset-password/page.tsx](../app/reset-password/page.tsx))
- Email verification (Better Auth `sendOnSignUp` + `sendOnSignIn`)
- Local-dev verification bypass via `RYTHM_DEV_SKIP_EMAIL_VERIFICATION`
- Better Auth route handler at [app/api/auth/[...all]/route.ts](../app/api/auth/[...all]/route.ts)
- Allowed hosts configured for `localhost:3000` and `*.vercel.app`
- Auth email delivery via Resend (gated behind `AUTH_EMAIL_FROM` + `RESEND_API_KEY`); fallback to server log when unset

Categories
- List, create, rename, delete, reorder
- Default-category bootstrap on first login (Spiritual / Finance / Career / Health / Personal Growth / Relationship)
- Delete blocked when quests still reference the category
- API: [app/api/categories/route.ts](../app/api/categories/route.ts), [app/api/categories/[id]/route.ts](../app/api/categories/[id]/route.ts), [app/api/categories/reorder/route.ts](../app/api/categories/reorder/route.ts), [app/api/bootstrap/default-categories/route.ts](../app/api/bootstrap/default-categories/route.ts)
- UI: [components/categories/category-manager.tsx](../components/categories/category-manager.tsx)

Quests
- List with search, category filter, type filter, include-inactive toggle
- Create, edit, deactivate, hard-delete
- API: [app/api/quests/route.ts](../app/api/quests/route.ts), [app/api/quests/[id]/route.ts](../app/api/quests/[id]/route.ts)
- UI: [components/quests/quest-manager.tsx](../components/quests/quest-manager.tsx)

Dashboard (current-period view)
- Date display, category filter, show-inactive toggle
- Quick check / uncheck for the active period (DAILY/WEEKLY/MONTHLY/MAIN)
- Inline note edit on completion
- Streak badge per quest (`—` for MAIN)
- API: [app/api/dashboard/route.ts](../app/api/dashboard/route.ts), [app/api/quests/[id]/current-completion/route.ts](../app/api/quests/[id]/current-completion/route.ts)
- UI: [components/dashboard/dashboard-screen.tsx](../components/dashboard/dashboard-screen.tsx)

History (activity log)
- Chronological list grouped by day with cursor pagination
- Filter by quest, category, quest type, date range
- Edit note on a completion
- Delete a completion (effectively "uncheck" for that period)
- API: [app/api/history/route.ts](../app/api/history/route.ts), [app/api/completions/[id]/route.ts](../app/api/completions/[id]/route.ts)
- UI: [components/history/history-screen.tsx](../components/history/history-screen.tsx)

PWA
- `app/manifest.ts` + dynamic icon routes ([app/icon.tsx](../app/icon.tsx), [app/apple-icon.tsx](../app/apple-icon.tsx), [app/pwa/icon-192.png/route.tsx](../app/pwa/icon-192.png/route.tsx), [app/pwa/icon-512.png/route.tsx](../app/pwa/icon-512.png/route.tsx))
- Service worker registration at [components/pwa/pwa-register.tsx](../components/pwa/pwa-register.tsx)
- Offline fallback page at [app/offline/page.tsx](../app/offline/page.tsx)
- Local PWA dev toggle via `NEXT_PUBLIC_PWA_DEV_ENABLED`

Public surface
- Landing page at `/` with sign-in / sign-up CTAs ([components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx))
- Authenticated users redirected to `/dashboard`

Deployment readiness
- Vercel Node.js runtime explicit on every Prisma route
- `prisma.config.ts` at repo root, `postinstall` runs `prisma generate`
- `npm run env:check` and `npm run env:check:deployment` (the latter blocks deploy on incomplete env, including missing email delivery config)
- Local Docker stack ([compose.yaml](../compose.yaml), [Dockerfile](../Dockerfile))
- Demo data seed via `npm run seed:demo` ([scripts/seed-demo.ts](../scripts/seed-demo.ts))

Quality gates
- Canonical `npm run verify` (env check + Prisma validate + unit tests + lint + production build)
- Unit tests in `tests/` for period helpers, streak calculation, payload validators
- Playwright e2e suite (`npm run test:e2e`) covering auth layout, authenticated shell, dashboard, quests, categories, history, PWA installability, offline fallback
- Manual screenshot review (`npm run qa:layout`)
- Repo discipline guard (`npm run discipline:check`) blocks edits in `quest-companion/` and edits without `docs/to_dos.md` updates *(this guard will need to be updated to reference `PRODUCT_PLAN.md` instead — see Recommended Refactors in [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md#known-technical-debt))*

### Partially Complete / In Flight

- **IA route renames.** Sidebar labels are already Tasks-first (`Today`, `Lists`, `Habit Lists`, `Activity Log`). Routes still live at old paths (`/dashboard`, `/quests`, `/categories`, `/history`). Rename + redirect work is queued in the IA Roadmap below — resolve Strategic Decision 3 first.

### Coming Soon (visible but disabled in UI)

- **`Upcoming`** — date-grouped agenda over the next short horizon. Currently a disabled sidebar entry. Ships only if Decision 1 picks Tasks-first.
- **`Calendar`** — month grid with selected-day agenda. Currently a disabled sidebar entry. Ships only if Decision 1 picks Tasks-first.
- **`Journal`** — a future module placeholder for reflective writing. Currently a disabled module-rail entry. No data model exists yet. Ships only if Decision 1 picks Tasks-first AND a `Journal` entity is designed.

### Explicitly Out Of Scope

These are deliberate non-goals. Adding any of them without an explicit user decision is a wrong-direction move.

- Analytics, charts, trend graphs, scoring
- Sub-quests, parent-child quest relationships
- Social features, sharing, leaderboards, public profiles
- Team or household collaboration
- Offline-first mutation queue, background sync, conflict resolution
- Native mobile apps (iOS, Android)
- Multi-locale UI (English-only is intentional)
- Per-quest deadlines or due dates beyond period reset

---

## Priority List (Independent Of Strategic Decisions)

These items can be picked up regardless of how the IA decision lands.

### P0 — Must-have before broader use

#### P0.1 — Validate Resend email delivery in production

- **Why:** email verification and password reset are now part of the auth MVP. The deployment env checker (`npm run env:check:deployment`) already blocks deploy without `AUTH_EMAIL_FROM` + `RESEND_API_KEY`, but no real-deploy verification has happened.
- **Acceptance:**
  - A real deploy (preview or prod) sends a verification email through Resend and the email lands in an inbox (not spam).
  - Forgot-password flow sends a reset email through Resend and the link works end-to-end.
  - `RYTHM_DEV_SKIP_EMAIL_VERIFICATION` is verified to be **off** in the deployed environment.
- **Dependencies:** Resend API key, sender domain configured. P0.2 (database provider) recommended first so the same deploy is being tested.
- **Risks:** Sender deliverability (DKIM/SPF) may need DNS work on the chosen domain.

#### P0.2 — Pick a database provider and migrate

- **Why:** the only major undone item from the original delivery checklist. Cannot meaningfully test production without a real DB.
- **Acceptance:**
  - One of Prisma Postgres / Neon / Supabase Postgres / managed PG is chosen and provisioned.
  - `DATABASE_URL` and (if applicable) `DIRECT_URL` are set in Vercel preview and production.
  - `npm run prisma:migrate:deploy` runs cleanly against the chosen DB.
  - The deployment smoke checklist (sign up → create category → create quest → check it → see in history → uncheck → sign out) passes against the deployed URL.
- **Dependencies:** Strategic Decision 2.
- **Risks:** Provider-specific connection limits or pooling behavior may force `DIRECT_URL` configuration.

#### P0.3 — Real-device PWA install validation

- **Why:** Chromium mobile installability is verified in browser smoke tests, but no human has confirmed install on a real iOS or Android device.
- **Acceptance:**
  - App installs cleanly on a real Android device (Chrome) and iOS device (Safari "Add to Home Screen").
  - Installed app opens to the correct shell, shows the correct icon and name.
  - Offline navigation lands on the offline fallback page rather than a browser error.
- **Dependencies:** P0.1 + P0.2 (need a deployed URL with auth + DB working).
- **Risks:** iOS Safari has known PWA quirks; manifest theme color or icon dimensions may need tweaks.

### P1 — Important polish and consistency

#### P1.1 — Token migration pass on `components/ui` primitives

- **Why:** the design tokens in [app/globals.css](../app/globals.css) are already in the new slate / cool-premium family with the new radius scale (8 / 12 / 14 / 20px), but several primitives still default to older shapes (e.g., `rounded-full` on base `Button`, `rounded-2xl` on `Input` and `Select`). [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) explicitly calls for moving away from full-pill defaults.
- **Acceptance:**
  - `Button` base no longer defaults to fully pill-shaped. Pill remains available for explicit semantic uses (badges, segmented controls).
  - `Input`, `Select`, `Textarea` align to the `--radius-lg` (14px) family unless they have a specific reason to differ.
  - `Sheet` close affordances follow the new rounded-rectangle system rather than default pill cues.
  - No regressions in `npm run qa:layout` screenshots; visual review confirms the calmer, more architectural feel described in `DESIGN_DIRECTION.md`.
- **Dependencies:** none.
- **Risks:** Cascading visual side-effects on screens that relied on old shapes.

#### P1.2 — Drag-and-drop category reordering

- **Why:** Currently reordering uses up/down buttons. DnD is on the original spec as a "if easy" upgrade.
- **Acceptance:**
  - User can reorder categories on `/categories` by dragging on desktop and long-press-drag on mobile.
  - Up/down buttons remain available as a fallback for accessibility.
  - Reorder persists via `POST /api/categories/reorder` and survives reload.
- **Dependencies:** none.
- **Risks:** Touch-DnD libraries can be heavy; pick one that respects the mobile-first stance.

#### P1.3 — Mobile gesture polish on dashboard rows

- **Why:** The fastest action on the dashboard is check / uncheck. A swipe-to-check or long-press-to-note interaction would tighten the daily ritual.
- **Acceptance:**
  - Swiping a quest row to the right marks it complete; swiping left removes the completion.
  - Long-press opens the note sheet for the active period.
  - Existing checkbox tap still works (additive, not replacement).
  - Works on iOS Safari and Android Chrome PWA installs.
- **Dependencies:** P1.1 recommended first to avoid restyling immediately after.
- **Risks:** Gesture conflicts with native browser swipe-back. May require careful event-coalescing.

### P2 — Nice-to-have

- **P2.1 — Color tagging for categories.** Each category gets an optional accent color (constrained to the slate palette family) used as a left bar on the dashboard row. Schema impact: one new nullable text column on `categories`.
- **P2.2 — Bulk actions on the activity log.** Multi-select rows in `/history` to delete a batch of completions in one call. Schema unchanged; new `DELETE /api/completions/batch` endpoint.
- **P2.3 — Dark mode pass.** The dark token set already exists in [app/globals.css](../app/globals.css). What's missing is a UI affordance to toggle and persist preference. Marketing pages stay light per design direction.

### Later

- **Gamification system** — XP awarded per completion, milestone badges, progression levels. Must stay within the calm design language: no aggressive celebration animations, no streak-as-social-pressure mechanics, no push-notification urgency loops. Visual treatment: XP as a small factual counter (mono text, no glow), badges displayed in a dedicated profile or stats surface, not flooding the main list. Schema additions are entirely additive (new tables alongside existing ones: `user_xp_ledger`, `badges`, `user_level`, `achievement_unlocks`). Design the system explicitly before any implementation work starts.
- Analytics (deliberately deferred — see Out of Scope; revisit only if the user explicitly reverses that stance)
- Multi-locale UI
- Public sharing of streaks
- Cloud-sync of preferences across devices

---

## IA Roadmap (Tasks-First)

Strategic Decision 1 is resolved: Tasks-first is canonical. The work below is now approved and actionable.

1. **Resolve `Habit Lists` data model** (Strategic Decision 3) — do this first, before any route or copy changes.
2. **Route renames + redirects.** `/dashboard` → `/today`, `/quests` → `/lists`, `/categories` → `/habit-lists`, `/history` → `/activity-log`. Old paths return permanent redirects (`308`). Update `app/manifest.ts` start URL, sidebar `href` values, all page title copy, Playwright e2e route references, and the deployment smoke checklist.
3. **`Upcoming` v1.** Date-grouped agenda surface over existing completion data. Filters for next 7 / 14 / 30 days. No schema change required for v1 — Daily/Weekly/Monthly quests already imply future periods via the period helper.
4. **`Calendar` v1.** Month grid with selected-day agenda below it. Reuses the `Today` row component for the agenda. No schema change for v1.
5. **`Journal` foundation.** Decide entity shape (`journal_entries(user_id, date, body, created_at, updated_at)` is a reasonable starting point), build a minimal write surface, then graduate it from disabled to enabled in the sidebar.

---

## Open Product Questions (Non-Blocking)

These are worth flagging but not gating any current work. If you encounter one while implementing, surface it to the user before guessing.

- **Category deletion behavior.** Currently the API rejects deletion if any quest references the category. Should there ever be a "delete and reassign quests to ____" flow, or is the current strict behavior the intended product stance?
- **Streak fetch windows.** Streak calc currently fetches the last 90 daily, 52 weekly, or 24 monthly completion records. Are those windows generous enough? Users with multi-year streaks would silently see them capped.
- **Note retention on uncheck.** When a user unchecks a completion, the row is deleted and the note goes with it. Should notes survive an uncheck (would require a soft-delete model) or is the current "completion + note are atomic" semantics the right one?
- **Category sort vs reorder vs alphabetical.** `sort_order` is user-controlled. Should there be an alphabetical-sort mode for users who don't want to manage order manually?
- **Quest description field.** Description exists but isn't surfaced on the dashboard row. Should the row show description on long-press, or is the field strictly for the form view?
- **Default-category bootstrap timing.** The bootstrap fires on first login. Should a user with zero categories ever re-trigger it, or is the current "once" behavior intentional?

---

## Suggested Implementation Sequence

Pick vertical slices, ship them complete, then move on. Avoid scattering partial migrations across multiple files in parallel.

1. Resolve Strategic Decision 3 (`Habit Lists` data model) — now the only open strategic blocker.
2. P0.2 (database provider) — pick + migrate.
3. P0.1 (Resend email) — verify delivery in the deployed environment.
4. P0.3 (real-device PWA install).
5. IA route renames + redirects (see IA Roadmap above) — unblocked once Decision 3 is settled.
6. P1.1 (token migration pass on `components/ui`) — biggest visual coherence win.
7. `Upcoming` v1, then `Calendar` v1.
8. P1.2 / P1.3 (DnD reorder, mobile gestures) — polish layer.
9. P2 items as bandwidth allows.
10. Gamification design pass (schema + visual treatment) before any implementation.

The repo discipline guard expects every source change to ship alongside a `PRODUCT_PLAN.md` (or `to_dos.md` until the guard is updated) edit. Update this doc as you finish each slice.
