# Rythm - Build Logs

Append-only log of completed work slices. Every agent should add an entry when a task is finished, even if the change is small.

---

## 2026-05-07 - Calendar V1

- Added active `/calendar` route with month grid, selected-day agenda, habit-list/cadence filters, month navigation, and contextual detail pane.
- Added `GET /api/calendar`, `lib/calendar.ts`, calendar query validation, and unit coverage for month projection and completion state.
- Enabled Calendar in the Tasks rail and updated deferred E2E mocks/spec expectations without running E2E.
- Updated canonical docs so Calendar is shipped and Journal remains the only disabled placeholder.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Activity Log Wireframe Wording Cleanup

- Updated the Activity Log section of the active wireframe reference to avoid archive wording in correction, empty-state, and selection rules.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Landing Copy Deck Terminology Cleanup

- Updated the non-archive landing page HTML copy deck to match the implemented Tasks-first landing copy.
- Replaced visible History/archive/Quests/Categories wording with Activity Log, tasks, and habit-list language where the deck describes user-facing copy or screenshot requirements.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - API Fallback Copy Cleanup

- Updated remaining validator/fallback copy and landing filter text that could surface in UI from category/type wording to list, habit-list, or cadence wording.
- Aligned product inventory filter descriptions with Tasks-first habit-list and cadence labels.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Canonical Docs Terminology Cleanup

- Updated the project overview and product inventory to describe shipped surfaces as Today, Lists, Habit Lists, and Activity Log while preserving current internal model/route notes.
- Updated design guidance examples to use task/habit-list language instead of quest/category/archive wording.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Upcoming Metadata Copy Cleanup

- Removed raw period-key text from Upcoming rows and detail metadata while keeping habit list and cadence visible.
- Updated Activity Log completion edit/delete 404 errors to use Activity Log wording.
- Updated agent/design guidance to use "Create task" as the button-copy example.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Landing Copy Terminology Cleanup

- Updated public landing page copy to use Tasks-first product language for tasks, habit lists, and Activity Log review.
- Removed visible quest/category/archive wording from the landing value props, pricing bullets, FAQ answers, and mockup summary text while leaving internal route/model names unchanged.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Activity Log Row Copy Cleanup

- Removed raw period-key text from Activity Log list rows; completion time and task context remain visible.
- Replaced remaining "archive" wording in Activity Log empty/context/sheet copy and sidebar summary with Activity Log language.
- Updated the deferred auth E2E assertion to match the current auth panel headline without running E2E.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Habit Lists Copy Cleanup

- Replaced developer-facing Habit Lists detail copy about the category compatibility layer with product-facing Tasks workspace language.
- Tightened Habit Lists header metadata, row order text, starter-pack row radius, and reorder API error copy to match Tasks-first wording.
- Updated the wireframe reference copy so `/categories` maps to `Tasks / Habit Lists` and no longer describes category compatibility as user-facing copy.
- Updated the category reorder validator message and deferred PWA E2E expectation to match the current Habit Lists / Activity Log wording.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Lists Detail Pane Cleanup

- Replaced the Lists detail pane's boxed Created / Last updated stat cards with a quiet definition-list treatment.
- Updated destructive task deletion copy to refer to linked Activity Log entries instead of "completion history" so the wording stays Tasks-first.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Detail Pane Metadata Cleanup

- Removed raw period keys from the Today detail pane and completion IDs / period keys from the Activity Log detail pane.
- Kept human-readable status, streak, cadence, habit list, and completion time visible so detail panes stay useful without exposing implementation identifiers.
- Updated the deployment smoke checklist and component-convention notes so future agents do not restore raw period-key checks or old metric-card helpers.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Authenticated Loading State Correction

- Replaced the authenticated route loading skeleton's old three-card metric grid with a list-first skeleton that mirrors the corrected Today / Upcoming / Lists / Habit Lists / Activity Log layout.
- Added a contextual detail-pane skeleton at the `xl` breakpoint so loading state matches the four-zone desktop shell without introducing dashboard-style cards.
- Removed unused app layout helper components (`PageShell`, `PageIntro`, `MetricCard`, `DetailPanel`, `DetailStat`, `InteractiveListCard`) that preserved the older metric/card-heavy direction and updated the handoff guidance to avoid reintroducing them.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - Auth And Support Copy Cleanup

- Rewrote auth-side panel, auth-card helper text, offline fallback, and route-error copy so implemented support surfaces use Tasks-first language instead of old quest/dashboard phrasing or developer-facing diagnostics.
- Updated metadata, manifest description, email-verified notice, and API error strings that can surface in toasts to use Tasks / Habit Lists / Today wording while leaving old route paths and internal model names unchanged.
- Aligned offline, app-error, and auth-helper containers with the documented radius token set.
- Skipped E2E and screenshot QA per owner instruction; see [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) temporary verification note.

## 2026-05-06 - App Layout Correction Pass

- Compact rail navigation in the authenticated shell so the module rail and Tasks rail read as navigation instead of descriptive cards.
- Flattened the top of Today, Upcoming, Lists, Habit Lists, and Activity Log: removed dashboard-like metric strips and moved counts into quiet supporting text so rows appear sooner.
- Moved route-owned detail panes from `2xl` to `xl`, making the wireframed four-zone desktop layout visible on ordinary desktop widths.
- Aligned repeated list group cards and context panes back to tokenized app radii and lighter shadows.
- Updated `PRODUCT_PLAN.md` and `DESIGN_DIRECTION.md` to record the correction pass.
- Verified: `npm run verify` passes. A targeted `npm run test:e2e -- tests/e2e/app-layout.spec.ts --reporter=list --workers=1` run also passed once (10/10), but the owner has asked agents to skip further E2E for now because the Playwright / screenshot workflow appears to destabilize this PC. `npm run qa:layout` was attempted, but the screenshot runner timed out before producing artifacts and repeated attempts exhausted the Windows PowerShell host.

## 2026-05-06 - Authenticated Shell Layout Reframe

- Split the authenticated shell into separate desktop zones: module rail, Tasks rail, and content column. The feature screens continue to own their contextual detail panes at wide desktop breakpoints, preserving the wireframed four-zone layout without duplicating pane logic.
- Updated mobile app chrome to a compact `Tasks / [view]` header with a direct Add action and a drawer that preserves the same module, view, and task-space IA.
- Kept route paths unchanged (`/dashboard`, `/quests`, `/categories`, `/history`) while adding future-route aliases for active-state compatibility.
- Updated authenticated app layout e2e coverage to use Tasks-first labels and include the `Upcoming` surface.
- Fixed Playwright dev-server startup for the layout suite by pinning the web server cwd to the repo root and adding a PostCSS `from` fallback before Tailwind v4 runs, preventing Tailwind from resolving out of `C:\Projects`.
- Kept the Habit Lists starter-pack action reachable below the `2xl` detail-pane breakpoint and removed duplicate History note input IDs across the context pane and mobile sheet.
- Verified: `npm run lint`, `npm run build`, `npm run discipline:check`, and `npm run test:e2e -- tests/e2e/app-layout.spec.ts --reporter=list --workers=1` pass (10/10 layout e2e).

## 2026-05-05 - Upcoming Agenda Surface

- Added the `Upcoming` route and screen as a date-grouped planning surface over future recurring periods, keeping `MAIN` tasks excluded until the product has a due-date model.
- Added `GET /api/upcoming`, `lib/upcoming.ts`, and `lib/validators/upcoming.ts` so daily tasks project across the horizon while weekly and monthly tasks emit once per future period.
- Added unit coverage for the projection helper and extended the authenticated-shell e2e mocks and screenshot review flow to include the `Upcoming` surface.
- Updated the canonical docs so `Upcoming` is now treated as shipped rather than a disabled placeholder.

## 2026-05-05 - Discipline Guard Doc Consolidation

- Updated `scripts/check-repo-discipline.ts` to require `docs/PRODUCT_PLAN.md` for source changes instead of the removed `docs/to_dos.md`.
- Updated the guard's user-facing and technical canonical-doc warnings to reference the consolidated doc set (`PROJECT_OVERVIEW.md`, `PRODUCT_PLAN.md`, `DESIGN_DIRECTION.md`, `TECHNICAL_PLAN.md`, `AGENT_HANDOFF.md`).
- Removed stale technical-debt notes for the old tracker, pending token migration, and unresolved database provider after the current docs marked those items complete.
- Fixed `PROJECT_OVERVIEW.md` so Current Limitations reflects the Neon decision and the remaining deployment/email/PWA validation work.
- Verified: `npm run discipline:check` and `npm run verify` pass.

## 2026-05-04 - P1.1 UI Primitive Token Migration

- `Button` base radius: `rounded-md` (12px) → `rounded-sm` (8px). Icon variant updated to match. Aligns with the DESIGN_DIRECTION.md rule "small controls: 8px (`--radius-sm`)". Pill (`rounded-full`) retained where it carries semantic meaning (circular check/uncheck buttons, avatar circles, dot separators, pill badges).
- `Sheet` close button: `rounded-md` → `rounded-sm`. Consistent with button family; removes the last incidental non-token shape in the overlay system.
- `auth-card.tsx` icon box: `rounded-2xl` → `rounded-xl`. `rounded-2xl` was using a Tailwind default (16px) outside the token set; `rounded-xl` maps to `--radius-xl` (20px) which is the correct token for prominent panel accents.
- `Input`, `Select`, `Textarea`, `Card`, `AlertDialogContent` audited and confirmed already correct (all `rounded-lg` or `rounded-xl` per design mapping).
- Also fixed `prisma.config.ts` `directUrl` spread: Prisma 7 requires `directUrl` in `prisma.config.ts`, not in `schema.prisma`. The `@prisma/config` TS types lag behind; used a spread cast (`...({ directUrl } as Record<string, string>)`) to satisfy both the CLI and the TypeScript compiler. Comment in file explains the workaround.
- Verified: `npm run verify` passes (34/34 tests, ESLint clean, TypeScript clean, production build clean).

## 2026-05-04 - Neon Database Setup + Strategic Decisions (P0.2)

- Updated `.env.local` with Neon pooled connection (`DATABASE_URL` via PgBouncer) and direct connection (`DIRECT_URL` bypassing pooler for DDL/migrations). Commented out the local Docker fallback.
- Fixed `prisma.config.ts`: `directUrl` is not a valid property in `defineConfig`'s datasource type, so moved it to `prisma/schema.prisma` as `directUrl = env("DIRECT_URL")` — the standard Prisma approach. Removed `getDirectUrl` import from `prisma.config.ts`.
- Applied baseline migration (`20260311170000_init`) to Neon via `npm run prisma:migrate:deploy` — confirmed 1 migration applied.
- Resolved **Open Strategic Decision 2 (Database Provider)** → Neon (serverless Postgres). Updated `PRODUCT_PLAN.md` and `TECHNICAL_PLAN.md` with the decision and Neon connection setup details.
- Resolved **Open Strategic Decision 3 (Habit Lists model)** → separate entity (tentative, user-flagged uncertain). Documented as "create as separate entity for safety; owner is unsure — re-confirm before any schema split". Updated `PRODUCT_PLAN.md` with owner's note preserved verbatim.
- P0.2 marked complete in `PRODUCT_PLAN.md`.
- Verified: `npm run lint && npm run build` pass cleanly.

## 2026-05-04 - Landing Page Visual Audit + Polish Pass

- Replaced all three `ScreenPlaceholder` skeleton boxes (grey rectangles + "Screenshot coming" text) with real app mockups: `TodayMockup`, `StructureMockup`, `HistoryMockup`. Each shows actual app content — checklist rows, category lists, day-grouped log — using the same visual language as the hero preview.
- Changed proof stats from 4 individual cards to a single bordered container with a 2×2 divided grid on mobile and 4-up on desktop. Numbers are now the focus, not the card chrome.
- Added icon containers to feature cards (9×9px bordered box with `bg-background`) replacing bare floating icons. Also removed `min-h-48` / `min-h-44` from feature and problem cards to let content determine height naturally.
- Reduced section padding from `py-20 sm:py-24` to `py-16 sm:py-20` across all sections, tightening the overall page rhythm.
- Added benefit pills to the pivot section ("Calm daily view", "Honest streaks", "Quiet XP", "Life-area structure", "Editable log") to give the transition more visual substance.
- Verified visually via preview screenshots; build still clean (`npm run lint && npm run build` pass).

## 2026-05-03 - Landing Page Full Rewrite + Verify Pass

- Rewrote [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) to apply a clear design voice: `font-semibold` headings, correct copy in all section titles (no wireframe planning notes left as page headings), and gamification-aware content throughout.
- Added the "Does Rythm have gamification?" FAQ entry and a "Progress rewards (XP, badges)" row in the comparison table (both absent in the previous version), consistent with the gamification direction settled in the docs.
- Showed XP in the hero app shell mock (480 XP, "Next milestone: 500") and in the detail pane, giving the landing page a concrete preview of the quiet-gamification posture.
- Replaced the "Mobile-ready rhythm" features card with a "Quiet progress" card (Trophy icon) so the features grid introduces the XP concept in its natural reading order.
- Used `<details>/<summary>` HTML for the mobile nav dropdown and FAQ accordion — keeps the component a pure server component (no `"use client"` needed).
- Fixed two pre-existing issues in [components/categories/category-manager.tsx](../components/categories/category-manager.tsx): added missing `Skeleton` import and added missing `category` field to `CategoriesPayload` type (the POST response shape).
- Verified: `npm run verify` passes cleanly — 34/34 unit tests pass, ESLint clean, TypeScript clean, production build succeeds with 18 routes generated.

## 2026-05-03 - Landing Page Polish Pass

- Polished [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) while preserving the documented landing sequence from [docs/landing-page.html](./landing-page.html).
- Improved hero responsiveness with `svh`, removed the forced heading class, enlarged CTA hit areas, and kept the product preview anchored at the bottom of the first screen.
- Replaced the inert mobile hamburger button with a CSS-only mobile navigation dropdown while keeping the primary CTA visible.
- Cleaned the hero product mock by fixing the encoded streak marker, tightening the responsive app-preview grid, and adding an accessible product-preview label.
- Added section scroll offsets, stronger section-label tracking, proof/table/FAQ polish, and footer link hover states.
- Verified with `npx eslint components/marketing/landing-page.tsx` and an HTTP check against `http://localhost:3000` returning status `200`.

## 2026-05-03 - Landing Comparison Key Fix

- Fixed duplicate React keys in the landing comparison table in [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) by keying table cells with row label and column index instead of repeated cell text.
- Verified the landing component with `npx eslint components/marketing/landing-page.tsx`.

## 2026-05-03 - Landing Hero CTA And Preview Position

- Increased the hero CTA button text size in [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx).
- Adjusted the hero layout so the app preview fills the remaining hero space and sits flush toward the bottom before the next landing section.
- Verified the landing component with `npx eslint components/marketing/landing-page.tsx`.

## 2026-05-03 - Landing Hero Preview Buildout

- Replaced the hero placeholder text in [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) with an actual Today preview mock inside the dashed product frame.
- Set the hero section to `min-h-[calc(100vh-73px)]` so the hero fills the first screen under the sticky header before the proof and content sections appear on scroll.
- Verified the landing component with `npx eslint components/marketing/landing-page.tsx`.

## 2026-05-03 - Landing Hero Simplification

- Updated the hero in [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) to match the simpler mockup: headline, supporting copy, CTA pair, risk note, and one large dashed product-preview frame.
- Removed the nested hero stage navigation and product mock that made the page show two taskbar/nav-like areas.
- Verified the landing component with `npx eslint components/marketing/landing-page.tsx`.

## 2026-05-03 - Landing Page Wireframe Alignment

- Rebuilt [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) to follow [docs/landing-page.html](./landing-page.html) as the implementation source.
- Added the wireframed public landing sequence: sticky nav, staged hero, proof strip, problem framing, solution line, core features, Today / Structure / History deep dives, workflow, comparison table, testimonials and metrics, pricing, FAQ, final CTA, and footer.
- Carried over the wireframe's placeholder proof, testimonials, and pricing language so the live page matches the current copy deck.
- Kept styling within the existing slate marketing token system and reused local UI primitives.
- Verified the landing component with `npx eslint components/marketing/landing-page.tsx`.

## 2026-05-03 - Landing Page First Pass

- Reworked [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) from a lighter hero page into a fuller staged landing page.
- Replaced the old marketing structure with a sticky header, stronger hero, product preview, problem/solution section, product deep dives, workflow section, mobile/PWA section, FAQ, and final CTA.
- Aligned the landing copy and layout more closely with the canonical product tone: calm, structured, honest, and product-led.
- Kept the implementation inside the existing design-token system rather than introducing a new visual language.
- Verification was partially blocked because local project dependencies were not installed, so `eslint` could not run from the repo.
