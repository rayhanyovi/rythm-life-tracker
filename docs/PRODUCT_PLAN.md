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

All three strategic decisions are now resolved (1 fully, 2 fully, 3 tentatively). Decision 3 is marked with an owner uncertainty note — re-confirm before implementing the schema split.

### 1. IA Direction: Quest Model vs Tasks-First

**Status:** ✅ RESOLVED — **Tasks-first wins.**

Routes are scheduled to be renamed: `/dashboard` → `/today`, `/quests` → `/lists`, `/categories` → `/habit-lists`, `/history` → `/activity-log`, with permanent redirects from the old paths. The `Upcoming`, `Calendar`, and `Journal` placeholder modules are valid forward roadmap items. See the IA-Conditional Roadmap section below for the implementation sequence.

The `Habit Lists` data model question (Strategic Decision 3) is now active — resolve it before implementing the route renames.

---

### 2. Database Provider

**Status:** ✅ RESOLVED — **Neon.**

Neon (serverless Postgres) is the chosen provider. Baseline migration applied 2026-05-04. See [TECHNICAL_PLAN.md Section 12](./TECHNICAL_PLAN.md#12-database-provider) for connection setup, Vercel env config, and local dev instructions.

---

### 3. `Habit Lists` Data Model

**Status:** ✅ RESOLVED (tentatively) — **separate entity, but owner is unsure — revisit before implementing.**

**Decision:** Treat `Habit Lists` as a new entity distinct from `Category`. `Category` becomes a life-domain container (e.g. Health, Finance) and `HabitList` becomes a curated cadence group (e.g. "Morning Routine", "Evening Wind-down") that holds recurring quests. This avoids a future migration if the concepts diverge; a `HabitList` table that turns out to be unnecessary is easier to remove than a `Category` table that needs to be split.

**Owner's note:** *"I don't know about this — just make it separate to be safe. I can remove it if it's unnecessary or use it if it's useful."* Do not implement the schema split without first re-confirming this decision with the owner, since it requires a new table, a data migration for existing quests, and updates to all category-linked API routes.

**Blocks:** IA route renames (Step 1 of the IA Roadmap).

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
- Auth, offline, route-error, metadata, manifest, and toast-surfaced API copy use Tasks-first language and user-facing recovery text.

Authenticated app shell
- Desktop shell split into module rail, Tasks rail, and content column; feature screens provide contextual detail panes from normal desktop widths (`xl`) upward.
- Mobile shell uses a compact `Tasks / [view]` top bar with direct Add access and a drawer that preserves the same module/view/task-space IA.
- `Calendar` and `Journal` remain disabled placeholders; route paths still use the old URLs until the IA Roadmap route-rename step.
- UI: [components/app/app-shell.tsx](../components/app/app-shell.tsx), [components/app/app-sidebar.tsx](../components/app/app-sidebar.tsx)

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

Upcoming
- Date-grouped agenda over future recurring periods
- Filters for next 7 / 14 / 30 days, habit list, and cadence
- Daily tasks appear on each future day; weekly/monthly tasks appear once when a new period enters the horizon
- One-time `MAIN` tasks are excluded because the current schema has no due date
- API: [app/api/upcoming/route.ts](../app/api/upcoming/route.ts)
- UI: [components/upcoming/upcoming-screen.tsx](../components/upcoming/upcoming-screen.tsx)

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
- Playwright e2e suite (`npm run test:e2e`) covering auth layout, authenticated shell, Today, Upcoming, Lists, Habit Lists, Activity Log, PWA installability, offline fallback
- Playwright's local dev server is pinned to the repo root, and the PostCSS/Tailwind pipeline includes a `from` fallback so Tailwind v4 does not resolve from the parent `C:\Projects` directory during e2e runs.
- Manual screenshot review (`npm run qa:layout`)
- Repo discipline guard (`npm run discipline:check`) blocks edits in `quest-companion/` and source edits without `docs/PRODUCT_PLAN.md` updates.

### Partially Complete / In Flight

- **IA route renames.** The app shell and page labels are Tasks-first (`Today`, `Upcoming`, `Lists`, `Habit Lists`, `Activity Log`), but routes still live at old paths (`/dashboard`, `/quests`, `/categories`, `/history`). Rename + redirect work is queued in the IA Roadmap below — resolve Strategic Decision 3 first.

### Coming Soon (visible but disabled in UI)

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

**Status: ✅ DONE** — Neon provisioned, baseline migration applied 2026-05-04. `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) are set in `.env.local`. Still need to set both in Vercel env vars for preview and production, and run the deployment smoke checklist against a deployed URL.

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

**Status: ✅ DONE** — Completed 2026-05-04.

- `Button` base: `rounded-md` (12px) → `rounded-sm` (8px) per the design rule "small controls = 8px". Icon variant updated to match. Full-pill (`rounded-full`) is still available for semantic uses (badges, circular avatar buttons, dots).
- `Input`, `Select`, `Textarea`: already used `rounded-lg` (14px = `--radius-lg`) — no changes needed.
- `Sheet` close button: `rounded-md` → `rounded-sm` — consistent with the button family.
- `auth-card.tsx` icon box: `rounded-2xl` (un-tokenized Tailwind default) → `rounded-xl` (20px = `--radius-xl`).
- All `rounded-full` usages reviewed: retained where semantic (circular check/uncheck button, avatar circles, dot separators, pill badges). Removed where incidental.
- `prisma.config.ts` `directUrl` handling: Prisma 7 requires `directUrl` in `prisma.config.ts`, not `schema.prisma`. The TS type lags; worked around with a spread cast (`...({ directUrl: getDirectUrl() } as Record<string, string>)`). See `prisma.config.ts` comment for context.
- Verified: `npm run verify` passes (34/34 tests, ESLint clean, TS clean, production build).

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

#### P1.4 — Authenticated shell layout reframe

**Status: ✅ DONE** — Completed 2026-05-06.

- Desktop shell now follows the wireframed structure: module rail, Tasks rail, content column, and route-owned detail panes at wide breakpoints.
- Mobile shell exposes the same IA through a drawer and keeps a compact Add action in the top bar.
- Layout e2e coverage passes across desktop and mobile after the PostCSS/Tailwind e2e startup repair. Full verification notes are recorded in [BUILD_LOGS.MD](./BUILD_LOGS.MD).
- Follow-up correction pass completed 2026-05-06: compacted rail navigation, flattened feature-screen headers, removed dashboard-like metric strips, and moved detail panes from `2xl` to `xl` so the wireframed four-zone desktop layout appears on ordinary desktop widths.

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
3. ~~**`Upcoming` v1**~~ — done 2026-05-05. Date-grouped agenda surface over existing completion data. Filters for next 7 / 14 / 30 days. No schema change required for v1 — Daily/Weekly/Monthly quests already imply future periods via the period helper. `MAIN` tasks remain excluded until a due-date/scheduling model exists.
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

1. ~~Resolve Strategic Decision 3~~ — resolved (tentatively, separate entity; re-confirm before schema work).
2. ~~P0.2 (database provider)~~ — ✅ done (Neon, migration applied).
3. **P0.1 (Resend email)** — set Vercel env vars (`AUTH_EMAIL_FROM`, `RESEND_API_KEY`), deploy, verify email delivery end-to-end.
4. **P0.3 (real-device PWA install)** — depends on P0.1 + a deployed URL with working auth + DB.
5. **Set Vercel env vars** — `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` must be set in Vercel before any preview/production deploy is usable.
6. **IA route renames + redirects** — unblocked once Decision 3 schema work is done.
7. ~~P1.1 (token migration pass on `components/ui`)~~ — ✅ done (button/sheet/auth-card radius tokens aligned).
8. ~~Authenticated shell layout reframe~~ and ~~`Upcoming` v1~~, then `Calendar` v1.
9. P1.2 / P1.3 (DnD reorder, mobile gestures) — polish layer.
10. P2 items as bandwidth allows.
11. Gamification design pass (schema + visual treatment) before any implementation.

The repo discipline guard expects every source change to ship alongside a `PRODUCT_PLAN.md` edit. Update this doc as you finish each slice.
