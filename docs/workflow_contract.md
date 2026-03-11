# Workflow Contract

## Canonical Files

- `docs/overview.md` is the non-technical product overview of the project.
- `docs/techplan.md` is the canonical technical plan for schema, endpoints, stack, and system boundaries.
- `docs/to_dos.md` is the main progress tracker.
- `docs/workflow_contract.md` is the canonical workflow contract for AI agents and developers.
- `docs/parity_review.md` records the final prototype-vs-root cutover review.
- `docs/environment.md` documents runtime and deployment-facing environment variables.
- `docs/deployment_smoke.md` documents how to run Playwright against a deployed URL once preview or production access exists.
- `docs/manual_verification.md` documents the screenshot-based manual QA workflow for desktop and mobile layout review.

## Core Agreement

- We are building the real application in the root Next.js project.
- `npm` is the canonical package manager for the root app and `package-lock.json` is the lockfile of record.
- New product work should be implemented in the root app unless a task explicitly says otherwise.
- Historical prototype context now lives in `docs/parity_review.md` and git history, not in a second live app directory.

## Working Order Per Task

For any non-trivial task, follow this order:

1. Read the relevant parts of `docs/overview.md`.
2. Read `docs/techplan.md` if the task touches architecture, data contracts, API design, auth, environment, or deployment.
3. Check `docs/to_dos.md` and pick the matching task line.
4. Check `docs/parity_review.md` if historical prototype behavior matters.
5. Implement in the root Next.js app.
6. Verify with the smallest meaningful validation step. Prefer `npm run verify` when the task touches shared app behavior, build integrity, or deployment-sensitive code.
7. Update `docs/to_dos.md` if the task is truly finished.
8. Create a separate commit for a completed task, unless the active instruction is to defer commits and use a temporary commit tracker.

## Repo Boundary Rules

- Do not reintroduce a second app workspace for prototype-only product development.
- If logic is brought forward from historical prototype work, normalize it to Next.js App Router, server/client boundaries, and production constraints.
- Keep browser-only code isolated behind explicit client components.
- Move provider calls that need control, caching, or protection behind server boundaries where appropriate.
- Keep styling token-driven. `app/globals.css` is the canonical source for theme tokens and component code should avoid hardcoded visual values when a token can represent them.

## Documentation Rules

- Update `docs/overview.md` when understanding of architecture, scope, or system boundaries materially changes.
- Update `docs/techplan.md` when schema, endpoint contracts, auth behavior, runtime boundaries, or technical decisions materially change.
- Update `docs/environment.md` when runtime configuration, deployment assumptions, or environment variable usage changes.
- Update `docs/vercel_deployment.md` when Vercel runtime assumptions, function limits, or deployment posture changes.
- Update `docs/to_dos.md` when a task is started, finished, split, or deprioritized.
- If commits are intentionally deferred, create or update a temporary commit tracker document before ending the task.
- Keep task names concrete enough that another developer can resume work without re-auditing the repo.
- If a discovered blocker changes the migration strategy, record it in `docs/overview.md` or this contract before continuing.

## Definition Of Done

A task is done only if all relevant conditions are true:

- The implementation exists in the root app, not only in the reference app.
- The task has been validated with an appropriate check.
- `docs/to_dos.md` is updated.
- The result does not quietly regress the migration boundary or workflow assumptions.

## Commit Convention

Commit message format:

`<tag>: <task name>`

Allowed examples:

- `feat: Add room shell route`
- `fix: Exclude reference app from root TypeScript scope`
- `docs: Define project overview and workflow contract`

Use simple top-level tags such as:

- `feat`
- `fix`
- `refactor`
- `docs`
- `chore`
- `ui`
- `style`

## Operating Principles

- Prefer shipping complete vertical slices over scattering partial migrations across many files.
- Stabilize route structure, data contracts, and service boundaries early.
- Keep fairness explainable and privacy constraints visible in implementation decisions.
- Treat Vercel deployment readiness as a first-class goal, not an afterthought.
- Keep a single canonical quality gate. Local work and CI should converge on the same `npm run verify` baseline unless a task explicitly needs broader coverage like Playwright.
