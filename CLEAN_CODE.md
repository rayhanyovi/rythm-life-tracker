# CLEAN_CODE.md — Rhythm Project

This document is the **living clean code contract** for the Rhythm codebase.
It serves three purposes:

1. **Rules** — the standards every agent and dev must follow
2. **Audit** — findings from the initial architecture review (May 2026)
3. **Progress** — what has been refactored, what is pending

When all pending items are done, delete Sections 2 and 3 and keep only Section 1.

---

## Section 1 — Project Clean Code Rules

These rules are non-negotiable for all new code and must be applied to existing code during refactor sessions.

### R1 — File Size
- **No component file > 300 lines.** Split into focused sub-components.
- **No lib/util file > 150 lines.** Extract into sub-modules if needed.
- Exception: generated files and migration files are exempt.

### R2 — DRY (Don't Repeat Yourself)
- If the same logic appears in **3 or more places**, extract it — hook, helper, or shared component.
- Copy-pasting with minor variable name changes is always a violation.

### R3 — Custom Hooks for Stateful Logic
- Components are "views." State, effects, and async logic belong in custom hooks under `hooks/`.
- Each hook has one responsibility: fetching, mutation, selection, grouping, etc.
- Hook names start with `use`. E.g., `useDataFetch`, `useMutation`, `useAutoSelect`.

### R4 — Shared UI Components
- Repeated JSX patterns (badges, detail rows, section labels) → `components/ui/` or a feature-shared file.
- Never define a mini-component inline inside another component file if it is used in more than one place.

### R5 — Centralized Types
- TypeScript types referenced across more than one file live in `lib/types.ts`.
- Never redefine a type locally that already exists in `@prisma/client` or a validator schema.
- Zod schema inferences (`z.infer<typeof schema>`) are the source of truth for validator-related types.

### R6 — API Routes: Thin Handlers
- Route handlers contain only: auth check, body parse, schema validation, one lib call, response.
- No business logic inline in routes. Delegate to `lib/`.
- All routes use shared helpers from `lib/http.ts` (`jsonResponse`, `jsonError`, `validationErrorResponse`).

### R7 — Validator Primitives
- Common Zod schema fragments (trimmed strings, nullable notes, search params) live in `lib/validators/common.ts`.
- Never copy a Zod schema fragment between validator files.

### R8 — Tests: Reuse Helpers
- All smoke/integration tests share the single in-memory DB from `tests/helpers/in-memory-app-db.ts`.
- Never create a new test DB mock from scratch. Extend the existing one.
- Unit tests are pure: no DB, no HTTP, no file I/O.

---

## Section 2 — Audit Findings (May 2026)

### 🔴 HIGH PRIORITY

#### H1 — Extract Custom Hooks (`hooks/` directory)

These stateful patterns repeat verbatim across all 4 manager components
(`attribute-manager.tsx`, `category-manager.tsx`, `task-manager.tsx`, `quest-manager.tsx`):

**`useDataFetch<T>(url: string, deps?: DependencyList)`**
- Handles: loading state, error state, cancellation via `cancelled` flag, `cache: "no-store"` fetch
- Repeated ~30 lines in each of the 4 managers
- Pattern:
  ```ts
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function run() { /* fetch, set, cancel guard */ }
    void run();
    return () => { cancelled = true; };
  }, deps);
  ```

**`useMutation()`**
- Returns `{ isPending, errorMessage, statusMessage, runMutation, clearMessages }`
- Wraps `useTransition` + try/catch + error/status state into one hook
- Repeated ~15 lines in each manager, called 8+ times per manager

**`useAutoSelect<T extends { id: string }>(items, selectedId, setSelectedId)`**
- Auto-selects first item when selected item disappears from list
- Repeated ~12 lines in all 4 managers

**`useGroupedItems<T>(items, groupByField, nameField)`**
- Groups flat arrays into `{ id, name, items }[]` sections
- Repeated ~18 lines in `task-manager.tsx` and `quest-manager.tsx`

#### H2 — API Route Boilerplate

The following blocks are copy-pasted across **10+ route files**:

**Auth check (every handler):**
```ts
const session = await getSessionFromRequest(request);
if (!session) return jsonError(401, "Authentication required.");
```

**JSON body parse (all POST/PATCH handlers):**
```ts
let parsedBody: unknown;
try { parsedBody = await request.json(); }
catch { return jsonError(400, "Request body must be valid JSON."); }
```

**Prisma FK error catch (all create/update handlers):**
```ts
if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
  return jsonError(400, "References an invalid item.");
}
```

**Fix:** Add to `lib/http.ts`:
- `parseJsonBody(request)` — returns `{ ok: true; data: unknown } | { ok: false; response: Response }`
- `handlePrismaError(error)` — returns `Response | null`

#### H3 — Shared Validator Primitives

These Zod fragments are copy-pasted across multiple validator files:

| Fragment | Duplicated in |
|---|---|
| `titleSchema = z.string().trim().min(1, ...)` | `task.ts`, `quest.ts` |
| `normalizedDescriptionSchema` (string → null transform) | `task.ts`, `quest.ts` |
| `normalizedNoteSchema` (string → null transform) | `completion.ts`, `task.ts` |
| `searchParamSchema` (trim + undefined if empty) | `task.ts`, `quest.ts` |
| `atLeastOneField` refine | `task.ts`, `quest.ts` |
| `attributeNameSchema` / `categoryNameSchema` (identical logic) | `attribute.ts`, `category.ts` |

**Fix:** Create `lib/validators/common.ts` with all shared fragments. Import from there in all validator files.

---

### 🟡 MEDIUM PRIORITY

#### M1 — Split Large Components

| File | Lines | Action |
|---|---|---|
| `components/tasks/task-manager.tsx` | ~1,300 | Extract `<TaskFormSheet>`, `<TaskDetailSheet>`, `<TaskListSection>` |
| `components/quests/quest-manager.tsx` | ~1,182 | Same pattern as task-manager |
| `components/attributes/attribute-manager.tsx` | ~828 | Extract `useReorderList` hook + `<AttributeListItem>` |
| `components/categories/category-manager.tsx` | ~828 | Same pattern as attribute-manager |

Each manager should end up as an **orchestrator of ~200 lines** that wires together focused sub-components.

#### M2 — Shared UI Components (currently defined inline)

| Component | Currently In | Move To |
|---|---|---|
| `<KindBadge>` / `<CadenceBadge>` | task-manager, quest-manager | `components/ui/task-badge.tsx` |
| `<SectionLabel label count>` | task-manager, quest-manager | `components/ui/section-label.tsx` |
| `<DetailRow label>` | task-manager, quest-manager | `components/ui/detail-row.tsx` |
| Error/status `<Alert>` block | all 4 managers | `components/ui/manager-alert.tsx` |

#### M3 — Centralize TypeScript Types

| Type | Issue | Fix |
|---|---|---|
| `TaskKind` | Redefined locally in `task-manager.tsx` and `dashboard-screen.tsx` | Import directly from `@prisma/client` |
| `RouteContext<T>` | Defined 4 times as `{ params: Promise<{ id: string }> }` | Add once to `lib/types.ts` |
| `TaskRecord`, `AttributeRecord`, etc. | Defined in component files | Move to `lib/types.ts` or derive from Prisma + Zod |

---

### 🟢 LOW PRIORITY

#### L1 — Route Context Type Deduplication

Each `[id]` route redefines the same type:
```ts
type XxxRouteContext = { params: Promise<{ id: string }> };
```
**Fix:** Export `type RouteContext = { params: Promise<{ id: string }> }` from `lib/types.ts`.

#### L2 — In-Memory Test DB Boilerplate

`tests/helpers/in-memory-app-db.ts` (~920 lines) has repetitive `findMany` filter patterns.
Not urgent — correctness matters more than DRY in test infrastructure. Revisit only when adding new models becomes painful.

#### L3 — `lib/quests.ts` mirrors `lib/tasks.ts`

Both export `findOwned*` functions with identical structure. Once legacy Quest code is removed
(Phase 1 Migration Step D), `lib/quests.ts` is deleted entirely.

---

## Section 3 — Progress Tracker

### ✅ Done

- Initial codebase audit (this document, May 2026)
- Phase 1 task system restructure: `Attribute`, `Task`, `TaskCompletion` models live alongside legacy
- New API routes: `/api/attributes`, `/api/tasks`, `/api/tasks/[id]/current-completion`, `/api/bootstrap/default-attributes`
- New pages: `/today`, `/lists`, `/attributes`, `/activity-log` with 308 redirects from old paths
- New components: `AttributeManager`, `TaskManager`
- Updated: `lib/periods`, `lib/streaks`, `lib/dashboard`, `lib/upcoming`, `lib/calendar`
- Updated: sidebar, dashboard-screen
- All 40 unit + smoke tests pass; `npm run verify` green
- **Sprint A complete (May 2026):** 4 hooks extracted (`use-data-fetch`, `use-mutation`, `use-auto-select`, `use-grouped-items`); `parseJsonBody`/`handlePrismaError` added to `lib/http.ts`; `lib/validators/common.ts` created; all 4 managers wired to hooks; 13 route handlers use `parseJsonBody`; 6 validator files import from `common.ts`. Net: −434 lines. `npm run verify` green (40/40 tests).

---

### 🔄 Pending Refactors (clean code sprints)

#### Sprint B — Component Splitting (resolves M1 + M2)

1. Split `task-manager.tsx` → orchestrator + `<TaskFormSheet>` + `<TaskDetailSheet>` + `<TaskListSection>`
2. Split `quest-manager.tsx` → same pattern
3. Split `attribute-manager.tsx` → extract `useReorderList` + `<AttributeListItem>`
4. Split `category-manager.tsx` → same pattern
5. Create shared UI: `<ItemBadge>`, `<SectionLabel>`, `<DetailRow>`, `<ManagerAlert>`
6. `npm run verify` must pass ✓

#### Sprint C — Types + Cleanup (resolves M3 + L1 + L3)

1. Create `lib/types.ts` with `RouteContext` and manager record types
2. Remove local type redefinitions from component files
3. Update all `[id]` routes to use `RouteContext`
4. After legacy Quest removal: delete `lib/quests.ts`, `lib/categories.ts`
5. `npm run verify` must pass ✓

---

### 📋 Still Pending (feature phases — separate from clean code)

- Phase 1 wrap-up: Remove legacy Category/Quest/QuestCompletion models (Migration Step D)
- Phase 2: Habits mechanic (HabitEntry, +/− buttons, streak modes)
- Phase 3: Projects
- Update docs: `PRODUCT_PLAN.md`, `TECHNICAL_PLAN.md`, `AGENT_HANDOFF.md`, `BUILD_LOGS.md`
- Update Playwright e2e tests for new route paths
