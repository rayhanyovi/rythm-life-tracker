# Rythm - Agent Handoff Guide

This document is written for AI coding agents (including weaker ones like Claude Haiku) who are picking up Rythm without context. **Read this first.** It tells you what the project is, where decisions live, what to do before touching anything, and what mistakes to avoid.

---

## 1. Read These First, In This Order

1. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - what Rythm is, who it's for, the product stance. ~5 minutes.
2. [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) - feature inventory, priorities, **Open Strategic Decisions**. The Open Strategic Decisions section is non-negotiable; if your task touches any of them, stop and surface the question to the user instead of picking a side.
3. [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) - visual DNA, IA, token catalog, component rules. Read before any UI change.
4. [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) - architecture, schema, API, env, deployment. Read before any code change.
5. [BUILD_LOGS.MD](./BUILD_LOGS.MD) - append-only record of recently finished work. Read it before starting so you do not duplicate or contradict the latest slice.

You can skim 1, 2, and 5 every time. Read 3 and 4 only when the task domain demands them.

---

## 2. Source-Of-Truth Map

Use this when documents conflict (and they sometimes will, briefly, between PRs).

| Question type | Authoritative doc |
|---|---|
| What is the product? Who is it for? | [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) |
| Is feature X in scope? What's the priority? | [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) |
| What are we building next? Acceptance criteria? | [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) |
| How should this UI look? What token to use? | [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) |
| What's the IA? | Tasks-first (settled). See [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) Section 2 and [PRODUCT_PLAN.md IA Roadmap](./PRODUCT_PLAN.md#ia-roadmap-tasks-first) for the route-rename sequence. |
| What's the schema? What's the API contract? | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Sections 3-6 |
| How do I run this locally? Deploy it? | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Sections 10-11 |
| Which env vars exist? | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Section 9 |
| What was finished recently? | [BUILD_LOGS.MD](./BUILD_LOGS.MD) |
| Workflow / commit conventions? | This doc, [Section 9](#9-workflow-per-task) |

**Conflict resolution rule:** if code says one thing and a canonical doc says another, the doc wins. Update the code or surface the conflict to the user. Do not silently let the docs drift.

---

## 3. Project-Specific Naming Nuance

- **Spelling:** "Rythm" is intentional with one `h`. Do not "fix" it to "Rhythm".
- **IA direction is settled: Tasks-first.** All copy, page titles, and sidebar labels use Tasks-first terminology now. Route paths are currently at their old values (`/dashboard`, `/quests`, `/categories`, `/history`) but are scheduled to be renamed - see [PRODUCT_PLAN.md IA Roadmap](./PRODUCT_PLAN.md#ia-roadmap-tasks-first) for the correct sequence before touching routes.
- **Current routes vs planned routes:**
  - `/` -> unchanged
  - `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` -> unchanged
  - `/dashboard` -> will become `/today`
  - `/quests` -> will become `/lists`
  - `/categories` -> will become `/habit-lists`
  - `/history` -> will become `/activity-log`
  - `/upcoming` -> unchanged
  - `/offline` -> unchanged
- **Sidebar labels (canonical Tasks-first):**
  - `Today` -> `/dashboard` (`/today` after rename)
  - `Lists` -> `/quests` (`/lists` after rename)
  - `Habit Lists` -> `/categories` (`/habit-lists` after rename)
  - `Activity Log` -> `/history` (`/activity-log` after rename)
  - `Upcoming` -> `/upcoming`
  - `Calendar`, `Journal` are **disabled placeholders** - valid forward roadmap items, not to be removed
- **Do not rename routes unilaterally.** The route rename is planned work with a specific sequence in [PRODUCT_PLAN.md](./PRODUCT_PLAN.md#ia-roadmap-tasks-first). Resolve `Habit Lists` data model (Strategic Decision 3) first, then follow the sequence exactly.

---

## 4. Before Implementing Any New UI

Run through this checklist in order. If any step has no answer, stop and ask.

1. Read the relevant section of [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md). Different surfaces have different rules.
2. Find the right token in [`app/globals.css`](../app/globals.css). Don't hardcode `hsl()`, `oklch()`, gradients, or shadows.
3. Reuse a primitive from `components/ui/` (`Button`, `Input`, `Sheet`, `Select`, `AlertDialog`, etc.). Do **not** install a second UI kit or fork shadcn primitives without reason.
4. Reuse a layout pattern from `components/app/` (`PageShell`, `PageIntro`, `MetricCard`, `DetailPanel`, `InteractiveListCard`, `EmptyState`).
5. Mobile-first: design the mobile layout first, expand to desktop with width, not new conceptual zones.
6. Avoid hover-only paths, full-pill defaults, gradient flooding, glow shadows, neon accents.
7. Use specific verbs in button copy ("Create quest" beats "Submit"). See [DESIGN_DIRECTION.md Section 6](./DESIGN_DIRECTION.md#section-6--component-family-rules).
8. Use Tasks-first labels in all copy: `Today`, `Lists`, `Habit Lists`, `Activity Log` - not `Dashboard`, `Quests`, `Categories`, `History`.

If your change introduces a new visual treatment that no existing token covers, **add the token to `app/globals.css` first**, then use it. Don't sprinkle one-off literals.

---

## 5. Before Adding A New Feature

1. Confirm the feature is in [PRODUCT_PLAN.md](./PRODUCT_PLAN.md). If it's not, propose adding it there first - surface the proposal to the user; do not silently expand scope.
2. Check if the feature depends on an Open Strategic Decision (database provider, `Habit Lists` data model - IA direction is now settled). If yes, surface the dependency to the user before implementing.
3. Confirm the feature is not on the Out-of-Scope list in [PRODUCT_PLAN.md](./PRODUCT_PLAN.md#explicitly-out-of-scope). If it is, do not implement.
4. Check the priority level. P0 first, then P1, then P2. Don't pick up Later items unless explicitly asked.
5. Re-read the acceptance criteria for the matching priority entry. Each P0 / P1 item has explicit criteria - meet all of them.

---

## 6. Before Changing Schema Or API

1. Update [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Sections 4 and 6 first (or in the same PR).
2. Respect the integrity rules: ownership chain (`category -> quest -> completion`), the unique completion constraint, the period_type-must-match-quest_type rule.
3. Use the central period helper (`lib/periods/`) - never recompute period keys ad hoc.
4. Generate a Prisma migration, never edit the canonical baseline migration retroactively.
5. Keep route handlers on the Node.js runtime if they touch Prisma. Edge runtime is incompatible with `@prisma/adapter-pg`.
6. Continue to validate session and resolve `userId` from session, **never** from request payload.

---

## 7. How To Decide If A Feature Is "Done"

A task is complete when **all** of the following are true:

1. The implementation lives in the root Next.js app (not `quest-companion/`).
2. Every acceptance criterion in the [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) entry is met.
3. `npm run verify` passes locally.
4. If the change touched UI, `npm run qa:layout` shows no regressions on either device profile.
5. If the change is large, the deployment smoke checklist still passes against a deployed URL.
6. [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) is updated to reflect the new state.
7. If schema, API, env, or deployment changed, [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) is updated.
8. If visual treatment changed, [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) is updated (or the change is consistent with what's already there).
9. [BUILD_LOGS.MD](./BUILD_LOGS.MD) has a new entry for the finished slice.

If any of those is missing, the task is **not** done. Don't mark it done in the tracker.

---

## 8. Common Mistakes To Avoid

These are the patterns that go wrong on this codebase. If you catch yourself doing any of them, stop.

### Product mistakes

- Adding analytics charts, KPI walls, trend lines, or scoring.
- Building a card gallery instead of grouped rows.
- Adding sub-quests, projects, deadlines, or other Quest model expansions outside what's in [PRODUCT_PLAN.md](./PRODUCT_PLAN.md).
- Implementing gamification before the design spec exists - gamification is in the roadmap (`Later`) but the visual system and schema must be designed first, not improvised.
- Implementing gamification in a noisy or aggressive style (fire-emoji streak symbols, celebration floods, push-pressure mechanics, leaderboards) - it must stay within the calm design language.
- Renaming routes outside the approved IA Roadmap sequence.

### Design mistakes

- Hardcoding a color, gradient, or shadow when a token exists.
- Defaulting `Button` or other primitives to fully pill-shaped.
- Adding glossy gradients, glow borders, or startup-glow polish.
- Using mono or serif as the main UI voice.
- Hover-dependent primary paths.
- Treating dark mode as the primary identity (it's derived from light).

### Technical mistakes

- Computing `period_key` outside `lib/periods/`.
- Trusting client-sent `userId` instead of resolving from session.
- Adding a Prisma route on the Edge runtime.
- Using `--no-verify` to skip pre-commit hooks.
- Reading `process.env.X` directly outside `lib/env.ts`.
- Reintroducing product work in `quest-companion/` - that's a frozen reference, gated by `npm run discipline:check`.
- Mixing two UI kits (e.g., adding Material UI alongside shadcn).
- Editing the canonical baseline migration. Generate a follow-up migration instead.
- Setting `RYTHM_DEV_SKIP_EMAIL_VERIFICATION=true` in preview / production.
- Setting `RYTHM_E2E_AUTH_BYPASS=true` outside the e2e test runner.

### Workflow mistakes

- Marking a task complete when `npm run verify` is failing.
- Bundling unrelated changes into one commit.
- Committing without updating the relevant doc.
- Finishing a task without adding an entry to [BUILD_LOGS.MD](./BUILD_LOGS.MD).
- Using `git commit --amend` after a hook failure (the commit didn't happen - create a new one).
- Force-pushing to `main`.

---

## 9. Workflow Per Task

For every non-trivial task:

1. **Read** the relevant section of the relevant canonical doc(s). At minimum [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) to confirm scope, and [BUILD_LOGS.MD](./BUILD_LOGS.MD) to see the latest finished slices.
2. **Inspect** the current code state. Don't trust a memory; read the file.
3. **Plan** the change as a vertical slice (touches the layers needed end-to-end, not horizontal half-migrations).
4. **Implement** in the root app.
5. **Verify** with the smallest meaningful command:
   - Touched shared app behavior, build integrity, or deployment-sensitive code -> `npm run verify`
   - Touched UI -> also `npm run qa:layout`
   - Touched repo boundaries or scope -> `npm run discipline:check`
6. **Update** the relevant canonical doc(s):
   - Always update [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) if scope or status changed.
   - Update [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) if schema, API, env, conventions, or deployment changed.
   - Update [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) if visual treatment, IA, or component rules changed.
   - Update [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) only when the product's positioning or limitations meaningfully shift.
7. **Log the build** in [BUILD_LOGS.MD](./BUILD_LOGS.MD):
   - Every finished task gets an entry.
   - Keep it append-only and chronological.
   - Include what changed, where it changed, and any verification or blocker worth preserving.
8. **Commit** as a separate commit per finished task with the format `<tag>: <task name>` (`feat`, `fix`, `refactor`, `docs`, `chore`, `ui`, `style`).

---

## 10. Documentation Update Rules

| If you change... | Update... |
|---|---|
| Product scope, priority, acceptance criteria, or status | [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) |
| Schema, API, route handler shape | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Sections 3-6 |
| Auth flow, session handling, allowed hosts | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Section 7 |
| Conventions, package manager, repo boundaries | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Section 8 + [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) |
| Env vars, fallbacks, env checker | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Section 9 |
| Local dev workflow, scripts | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Section 10 |
| Deployment posture, runtime, env requirements | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Section 11 |
| Database provider decision | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Section 12 + [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) Open Strategic Decisions |
| Test or QA workflow | [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) Section 13 |
| Tokens, fonts, color palette, radius, shadow | [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) Sections 3-5 |
| IA, navigation, surface roles | [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) Section 2 + [PRODUCT_PLAN.md IA Roadmap](./PRODUCT_PLAN.md#ia-roadmap-tasks-first) |
| Component family rules (buttons, forms, etc.) | [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) Section 6 |
| Wireframes | [DESIGN_DIRECTION.md](./DESIGN_DIRECTION.md) Section 7 |
| Product positioning, target user, philosophy | [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) |
| Any finished implementation slice | [BUILD_LOGS.MD](./BUILD_LOGS.MD) |

If the change touches an Open Strategic Decision, do not silently update the doc to pick a side - surface the question to the user, get a decision, then update.

---

## 11. Working In This Repo

### Package Manager

- **`npm` is canonical.** `package-lock.json` is the lockfile of record.
- Don't introduce `pnpm-lock.yaml`, `yarn.lock`, or `bun.lockb`.

### Repo Boundary

- Implementation goes in the root Next.js app.
- `quest-companion/` is a frozen reference and **off-limits**. The discipline guard (`npm run discipline:check`) blocks edits there.

### Commits

- Format: `<tag>: <task name>` - examples: `feat: Add Upcoming agenda surface`, `fix: Stop client from sending userId`, `docs: Reorganize project documentation`.
- One commit per finished task by default.
- Never `--no-verify` to skip hooks.
- Never `git commit --amend` after a hook failure (the commit didn't happen - create a new one).
- Never force-push to `main`.

### Branches And PRs

- The PR template at [`.github/pull_request_template.md`](../.github/pull_request_template.md) lists the required canonical-docs checkbox set. Tick the boxes honestly.
- Pull requests must keep the doc set consistent - don't leave a feature in [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) marked as P1 if you just shipped it.

### When You Get Stuck

1. Re-read the canonical doc that owns the question.
2. Check the file you're editing for context comments.
3. If the docs are silent, the answer is "ask the user" - not "guess and ship."
4. If a doc claim conflicts with what you see in code, the doc wins. Update the code, or surface the conflict.

### Quick Reference Of Useful Commands

```bash
# Day-to-day
npm run dev                          # Start Next.js (auto-runs db:prepare)
npm run docker:up                    # Compose: app + db
npm run docker:db                    # Compose: db only

# Quality gates
npm run verify                       # env + prisma + test + lint + build
npm run lint                         # ESLint
npm run test                         # node:test unit tests
npm run test:e2e                     # Playwright e2e
npm run qa:layout                    # Manual screenshot capture
npm run discipline:check             # Repo boundary guard

# Database
npm run prisma:migrate:dev           # Create/apply dev migration
npm run prisma:migrate:deploy        # Apply migrations (production-safe)
npm run prisma:studio                # Prisma Studio GUI

# Env
npm run env:check                    # Local env validator
npm run env:check:deployment         # Deploy gate
```

---

## 12. The Spirit Of The Work

Rythm is meant to feel calm, structured, honest, and intentional. Every change should compress toward that.

If you find yourself reaching for aggressive animations, gradient floods, analytics dashboards, or social pressure mechanics, you've drifted. Stop, re-read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md), and pick a path that makes the product quieter, not louder.

Gamification is now on the roadmap - but it belongs in the same quiet register. An XP counter in mono text is fine. A fireworks animation on every check-off is not. The product earns trust through honesty, not excitement.

The user has been deliberate about what Rythm is and is not. Trust the docs. Update them when something changes. Don't break the spirit by accident.
