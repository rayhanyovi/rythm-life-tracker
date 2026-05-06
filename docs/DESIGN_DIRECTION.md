# Rythm — Design Direction

This is the canonical source of truth for the **product structure**, **information architecture**, and **visual DNA** of Rythm. If a UI decision needs to be made and this document does not answer it, surface the question rather than guess.

> **For agents:** read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) before this file. Implement against the rules in this doc; if your change conflicts with what's here, update this doc first and align with the user, then write code.

> **IA direction is settled:** Rythm uses the **Tasks-first IA**. Routes are scheduled to be renamed to match (`/today`, `/lists`, `/habit-lists`, `/activity-log`) with permanent redirects from the old paths — see [PRODUCT_PLAN.md IA Roadmap](./PRODUCT_PLAN.md#ia-roadmap-tasks-first) for the implementation sequence. Until the renames land, code uses the old route paths (`/dashboard`, `/quests`, etc.) but all copy, page titles, and sidebar labels use Tasks-first terminology.

---

## Section 1 — Product Stance

### What Rythm Is

A personal life-rhythm tracker built around recurring quests and one-time milestones. Its core job is: open the app, understand the current period fast, check or uncheck what matters, get out.

### Audience

People who want personal structure and consistency. They open the app from a phone, often as a morning or evening ritual. They are adults; they are not looking for celebration animations or social validation.

### Brand Personality

**Calm. Structured. Honest.** Quiet, trustworthy, practical. Should support focus and consistency without sounding celebratory, competitive, or noisy.

### Aesthetic Direction

Mobile-first, low-noise, and list-led. Readable hierarchy, comfortable touch targets, contextual detail panels instead of multi-page management sprawl. Explicitly avoids XP-game patterns, KPI-wall dashboards, and decorative complexity that competes with the daily checklist.

### Core Design Principles

1. The first viewport must answer: *what is the current period, what is my visible progress, and what can I check right now*.
2. Daily execution takes priority over management surfaces; management takes priority over archive review.
3. Contextual sheets, drawers, and side panes are preferred over route jumps for note editing and object maintenance.
4. Lists and grouped rows beat card galleries for operational flows.
5. Empty, loading, error, and destructive states must be explicit, honest, and action-oriented.

### Visual Reference Inheritance

The Creative Tim Impact Design System Pro landing page is used as a **composition and typography reference**, not as a color or decoration source. From it Rythm inherits:

- oversized, high-confidence headline hierarchy
- framed hero stages with product preview as the anchor
- disciplined section rhythm
- premium SaaS-style proof and conversion sequencing
- typography-led hierarchy

Explicit rejections from the reference:

- copied blue gradients
- glossy enterprise-SaaS polish as the main identity
- feature-grid sprawl as the default pattern
- card-heavy operational layouts
- visual noise that weakens the calm ritual stance

### Tone Split By Surface

| Surface | Tone |
|---|---|
| Landing | persuasive, staged, premium, but still calm |
| Auth | quiet, trustworthy, low-noise |
| App shell | restrained and supportive |
| `Today` | fast, readable, operational |
| `Upcoming` / `Calendar` | planning-oriented, but still quiet |
| `Lists` and `Habit Lists` | practical and ordered |
| `Activity Log` | sober and corrective, not analytical theater |

---

## Section 2 — Information Architecture

The IA is **Tasks-first**. Route renames are scheduled work — see [PRODUCT_PLAN.md IA Roadmap](./PRODUCT_PLAN.md#ia-roadmap-tasks-first). Until renames land, route paths remain at their old values; all copy and labels use Tasks-first terminology.

### Routes

| Current route | Future route | Purpose |
|---|---|---|
| `/` | `/` | Public landing (unauthenticated) or redirect to Today (authenticated) |
| `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` | unchanged | Auth surfaces |
| `/dashboard` | `/today` | Current-period view |
| `/quests` | `/lists` | Quest CRUD + management |
| `/categories` | `/habit-lists` | Category CRUD + reorder |
| `/history` | `/activity-log` | Chronological completion log |
| `/offline` | `/offline` | PWA offline fallback |
| `/upcoming` | `/upcoming` | Date-grouped near-future agenda |
| *(planned)* | `/calendar` | Month grid with selected-day agenda |

Old routes will redirect permanently (`308`) after the rename lands. Update `app/manifest.ts` start URL and PWA metadata at the same time.

### Navigation Structure

```text
Module Rail        Tasks Rail
  Tasks              Today              → /dashboard  (→ /today after rename)
  Journal (disabled) Upcoming           → /upcoming
                     Calendar           (disabled placeholder)
                     Activity Log       → /history    (→ /activity-log after rename)
                     ── Task Spaces ──
                     Lists              → /quests     (→ /lists after rename)
                     Habit Lists        → /categories (→ /habit-lists after rename)
```

### Surface Roles

| Surface | Route | Role |
|---|---|---|
| Today | `/dashboard` → `/today` | Daily-use home — recurring habit check-ins due this period |
| Upcoming | `/upcoming` | Near-future planning surface for date-grouped recurring work |
| Calendar | *(planned)* | Month grid with selected-day agenda |
| Activity Log | `/history` → `/activity-log` | Completion review, note correction, and deletion |
| Lists | `/quests` → `/lists` | Quest definitions and management — search, filter, edit |
| Habit Lists | `/categories` → `/habit-lists` | Grouping containers (life domains or recurring cadence containers) |

### Navigation Rules

- The module rail stays intentionally short: `Tasks` and `Journal` only.
- Fixed views and list buckets share one rail rather than splitting into more top-level destinations.
- `Lists` and `Habit Lists` live below fixed views and never become peer modules.
- User identity, sign-out, and install or account status are utility elements, not primary nav.
- Mobile collapses the rails into a drawer or stacked switcher rather than inventing a second IA.
- Disabled placeholder modules (`Calendar`, `Journal`) must look obviously inactive — do not let them invite clicks that go nowhere.

### Public And Support Surfaces

These remain outside the authenticated app shell:

- `Landing`
- `Sign in`, `Sign up`, `Forgot password`, `Reset password`
- `Offline`

---

## Section 3 — Typography

### Font Tokens (canonical names in `app/globals.css`)

- `--font-sans`: `"Instrument Sans", "Aptos", "Segoe UI", sans-serif`
- `--font-serif`: `"Newsreader", Georgia, serif`
- `--font-mono`: `"IBM Plex Mono", "Cascadia Code", Consolas, monospace`

### Role Rules

- **Sans is the primary UI and headline family across the entire product.**
- **Serif is a selective accent only.** Used for short emotional lines on landing, quote accents, occasional pricing or CTA support lines. **Not** used for app navigation, app page titles, dense body copy, controls, labels, or form text.
- **Mono is reserved for technical and meta labels.** Used for eyebrow labels, technical IDs or period keys, measurement-like meta text, small badges with genuinely meta content. **Mono must not become the main brand voice.**

### Type Scale

| Size (px) | Use |
|---|---|
| 12 | Metadata, eyebrow labels, helper tags |
| 14 | Compact supporting text |
| 16 | Default body text and control labels |
| 20 | Card titles and small section titles |
| 28 | App page titles |
| 40 | Landing section titles |
| 56 | Landing hero headline |

### Weight And Rhythm

- Default body weight: `400`
- Default UI emphasis: `500` or `600`
- App page titles: `600`
- Landing titles and hero: `700` or `800`
- Uppercase eyebrow text uses modest tracking, not exaggerated display spacing.

### Copy Density Rules

- Landing body copy should rarely exceed `70ch`.
- App descriptive copy should rarely exceed `60ch`.
- Hero lines should be visually short and assertive, not paragraph-like.

---

## Section 4 — Color System

### Direction

**Cool premium slate.** Replaces an earlier warm-green system. Should feel: clean, composed, premium, slightly editorial, low-saturation.

Should **not** feel: neon, purple-biased, default dark SaaS, icy corporate blue.

### Light Theme Tokens (canonical, defined in `app/globals.css`)

```css
--background:          hsl(214 28% 97%);
--foreground:          hsl(220 20% 14%);
--card:                hsl(210 20% 99%);
--card-foreground:     hsl(220 20% 14%);
--popover:             hsl(210 20% 99%);
--popover-foreground:  hsl(220 20% 14%);
--primary:             hsl(223 39% 29%);
--primary-foreground:  hsl(0 0% 100%);
--secondary:           hsl(214 18% 92%);
--secondary-foreground:hsl(220 20% 14%);
--muted:               hsl(214 18% 92%);
--muted-foreground:    hsl(218 10% 42%);
--accent:              hsl(220 36% 88%);
--accent-foreground:   hsl(223 39% 29%);
--destructive:         hsl(1 60% 46%);
--destructive-foreground: hsl(0 0% 100%);
--border:              hsl(217 16% 82%);
--input:               hsl(217 16% 82%);
--ring:                hsl(223 39% 29%);
--chart-1..5:          hsl(223 39% 29%) … hsl(214 12% 58%);
--sidebar:             hsl(214 24% 95%);
--sidebar-foreground:  hsl(220 20% 14%);
--sidebar-primary:     hsl(223 39% 29%);
--sidebar-primary-foreground: hsl(0 0% 100%);
--sidebar-accent:      hsl(214 18% 92%);
--sidebar-accent-foreground: hsl(220 20% 14%);
--sidebar-border:      hsl(217 16% 80%);
--sidebar-ring:        hsl(223 39% 29%);
```

Marketing-only tokens (used by `landing-shell`, `landing-grid`, `landing-card`, etc., applied via utility classes in `app/globals.css`):

```css
--marketing-shell-background
--marketing-grid-background
--marketing-card-background
--marketing-mini-panel-background
--marketing-pill-background
--marketing-pill-foreground
--marketing-orbit-background
--marketing-spotlight-background
--app-background-image
--app-auth-panel-background
--app-selection-background
```

Rules for marketing tokens:

- no saturated gradients
- no purple bias
- no glow-driven atmosphere
- screenshots remain the main visual proof
- background interest must stay low-contrast and structural

### Dark Theme

Dark mode tokens already exist in `app/globals.css` under `.dark`. Dark mode is **derived** from the slate family — it must not invent a second visual identity, must not add neon accents or glow borders, and is light-mode-first (a toggle would be added later, not the default).

### Color Use Rules

- Neutrals do most of the work.
- Primary exists for action, not atmosphere.
- Accent exists for gentle emphasis, not decorative flooding.
- Marketing pages may use larger tonal blocks, but always inside the same slate family.
- App screens prioritize contrast through hierarchy and border structure before relying on color.
- Do not hardcode `hsl(...)`, `oklch(...)`, `rgba(...)`, gradient literals, or shadow literals in components if a token can represent the value. Add a token to `app/globals.css` first if a new surface treatment is needed.

---

## Section 5 — Layout, Spacing, Radius, Shadow

### Spacing Scale

Use these as the working spacing system. Pixels.

| Step | Use |
|---|---|
| 4 | Micro offsets, icon gaps |
| 8 | Tight inline spacing |
| 12 | Label-to-control spacing |
| 16 | Default small block gap |
| 24 | Grouped content spacing |
| 32 | Default panel padding |
| 48 | Large content grouping |
| 72 | Desktop section spacing |
| 96 | Landing hero, major page-break spacing |

Spacing creates rhythm, not sameness. Resist the urge to make every gap equal.

### Radius Tokens (canonical, defined in `app/globals.css`)

```css
--radius:    0.875rem; /* 14px — base */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 14px;
--radius-xl: 20px;
```

Mapping rules:

- Small controls (buttons, badges, chips): `8px` (`--radius-sm`)
- Default cards and inputs: `14px` (`--radius-lg`, also the `--radius` base)
- Large panels, sheets, and staged landing containers: `20px` (`--radius-xl`)

Hard rule: **default buttons should not be fully pill-shaped everywhere.** Reserve full-pill (`rounded-full`) for selective badges, pills, and segmented UI where it carries a semantic role. The product should feel architectural, not bubbly.

### Borders

- Keep borders visible and disciplined.
- Use borders to define hierarchy *before* reaching for heavier shadow.
- Inputs, cards, sheets, and panels must remain readable even with shadow removed.

### Shadows

The shadow family is defined in `app/globals.css` (`--shadow-2xs` through `--shadow-2xl`). Stay:

- soft
- low-contrast
- non-glowy

Use shadow to separate layers, not to manufacture excitement.

### Surface Rules

- Marketing surfaces may have staged backgrounds and tonal depth.
- App surfaces should mostly stay near-neutral with subtle tonal separation.
- Avoid nested card-on-card-on-card composition.

### Landing Layout Rules

- Use a 12-column desktop grid.
- Build landing pages as staged sections, not endless card piles.
- Hero pattern: oversized headline → framed hero stage → product preview as the anchor visual → one primary CTA + at most one educational secondary CTA.
- Proof appears before pricing.
- Product screenshots matter more than decorative imagery.
- Feature sections are allowed, but cards stay terse and subordinate to the main narrative.

### App Layout Rules

- App shell structure: module rail, task rail, list column, detail pane.
- Mobile collapses rails into a drawer or stacked switcher rather than inventing a second IA.
- App interiors are list-first.
- Contextual detail belongs in side panes or sheets — not new routes.
- Dense workflows privilege rows, groups, and stacked sections over feature-card layouts.
- Desktop adds persistent context, not unrelated new destinations.
- Current implementation: [components/app/app-shell.tsx](../components/app/app-shell.tsx) owns the module rail, Tasks rail, and mobile drawer; feature screens own their contextual detail panes at wide desktop breakpoints.

---

## Section 6 — Component Family Rules

### Buttons

- Default button shape moves away from always-pill.
- Primary buttons should feel decisive and architectural.
- Outline buttons should remain quiet and structured.
- Ghost buttons are allowed for secondary or destructive actions but should not disappear into the background.
- Button copy: prefer specific verbs over generic ones. Use **"Create quest"** rather than **"Submit"**, **"Save note"** rather than **"OK"**.

### Forms

- Inputs feel calm, legible, and stable.
- Border and focus states communicate priority without glow.
- Layouts favor clean stacks over excessive side-by-side fragmentation on mobile.
- Filter and form layouts that get padded should prefer `Select`, `Checkbox`, `Sheet`, `AlertDialog`, `Alert`, and `Toast` from the `shadcn/ui` jalur for behavior consistency across mobile and desktop.

### Alerts, Empty States, Destructive UI

- Use the same border, radius, and shadow grammar as normal surfaces.
- Destructive actions are explicit and unembellished.
- Blocked destructive states explain dependencies directly. Example: "Cannot delete category — 4 quests still reference it. Move them first."

### Cards And Panels

- Grouped rows beat cards.
- Mixed task sections beat tile galleries.
- Filters stay compact.
- Contextual sheets and drawers preserve list context.

### Navigation

- Sidebar (desktop) is persistent and quiet.
- Mobile uses a sheet drawer triggered from a hamburger or compact header.
- The active nav item should be readable but not loud.

### Toasts

- Used for transient confirmation (save success) and recoverable error.
- Auto-dismiss after a short interval; provide explicit dismiss.
- Do not use toasts as the only error surface for destructive actions; pair with inline error.

---

## Section 7 — Wireframes

ASCII layouts, mobile-first, with desktop expansion. Tasks-first labels are canonical. Route paths shown are current values; they will update when the IA route renames land.

### 7.1 — Authenticated Shell (Mobile Drawer)

```text
+----------------------------------+
| [≡]  Tasks / Today      [+ Add]  |   ← header collapses module + task rails
| Tue, Mar 12                      |
+----------------------------------+
|                                  |
|   list content                   |
|                                  |
+----------------------------------+

Drawer (opened from [≡]):
+----------------------------------+
| Tasks                            |
|   • Today                        |
|   • Upcoming                    |
|     Calendar      (disabled)     |
|     Activity Log                 |
|   ── Task Spaces ──              |
|     Lists                        |
|     Habit Lists                  |
|                                  |
| Journal           (disabled)     |
+----------------------------------+
```

The route paths inside the drawer will update when the route renames land (see IA Roadmap).

### 7.2 — Authenticated Shell (Desktop)

```text
+----------+----------------+---------------------------------+------------------+
| Modules  | Tasks rail     | List column                     | Detail pane      |
| Tasks    | Today          | (the actionable surface)        | (contextual)     |
| Journal* | Upcoming       |                                 |                  |
|          | Calendar*      |                                 |                  |
|          | Activity Log   |                                 |                  |
|          | ── Spaces ──   |                                 |                  |
|          | Lists          |                                 |                  |
|          | Habit Lists    |                                 |                  |
+----------+----------------+---------------------------------+------------------+

* = disabled placeholder
```

Rail labels update when route renames land.

### 7.3 — Today / Dashboard (Mobile)

```text
+----------------------------------+
| Tasks / Today          [+ Add]   |
| Tue, Mar 12                      |
+----------------------------------+
| [Filter: All categories ▾] [□ Show inactive] |
+----------------------------------+
| OVERDUE                          |
| [ ] Bangun tidur                 |
|     Habit list: Daily Schedule   |
|     Daily · streak 0       [...] |
+----------------------------------+
| TODAY                            |
| [x] Salat Subuh                  |
|     Habit list: Daily Schedule   |
|     Daily · streak 12      [...] |
| [ ] Fix onboarding copy          |
|     List: Product                |
|     Due today · streak —   [...] |
+----------------------------------+
| [Open detail sheet on row tap]   |
+----------------------------------+
```

Forbidden patterns on this screen:

- dashboard KPI wall
- splitting recurring vs one-off into separate first-class canvases
- permanent heavy detail panel on mobile
- card-per-quest gallery layouts

### 7.4 — Today / Dashboard (Desktop)

```text
+----------+----------------+---------------------------------+------------------+
| Modules  | Tasks rail     | Today                           | Detail pane      |
| ...      | Today          | Tue, Mar 12         [+ Add]    | Salat Subuh      |
|          | ...            +---------------------------------+ Daily            |
|          |                | OVERDUE                         | Streak: 12       |
|          |                | [ ] Bangun tidur         Habit  | Note:            |
|          |                |---------------------------------| [textarea]       |
|          |                | TODAY                           | [Save note]      |
|          |                | [x] Salat Subuh          Habit  | [Defer]          |
|          |                | [ ] Fix onboarding copy List    | [Delete]         |
+----------+----------------+---------------------------------+------------------+
```

The list column stays dominant. The detail pane supports inspection and editing only — never replaces the list as the primary action surface.

### 7.5 — Upcoming (Mobile, Tasks-first)

```text
+----------------------------------+
| Tasks / Upcoming     [Filters]   |
+----------------------------------+
| Thu, Mar 13                      |
| [ ] Product QA pass              |
|     List: Product                |
|     Due tomorrow          [Open] |
| [ ] Money review                 |
|     Habit list: Focus            |
|     Weekly recurrence     [Open] |
+----------------------------------+
| Fri, Mar 14                      |
| [ ] Landing page draft           |
|     List: Marketing       [Open] |
+----------------------------------+
```

Group by date first, then show the same mixed task model used in Today.

### 7.6 — Calendar (Mobile, planned, Tasks-first only)

```text
+----------------------------------+
| Tasks / Calendar    [Jump date]  |
+----------------------------------+
| March 2026                       |
| Su Mo Tu We Th Fr Sa             |
| ..  ..  10  11  12  13  14       |
|             [12]                 |
+----------------------------------+
| Selected: Wed, Mar 12            |
| [x] Salat Subuh           Habit  |
| [ ] Fix onboarding copy   Project|
+----------------------------------+
```

Calendar is another view on the same task pool. Selected-day agenda uses the same row grammar as Today.

### 7.7 — Lists / Quests (Mobile)

```text
+----------------------------------+
| Tasks / Lists          [+ Add]   |
+----------------------------------+
| [Search]   [Type ▾] [Cat ▾]      |
+----------------------------------+
| ACTIVE                           |
| Salat Subuh                      |
|   Daily · Spiritual              |
|   [Edit] [Deactivate] [Delete]   |
| Money review                     |
|   Weekly · Finance               |
|   [Edit] [Deactivate] [Delete]   |
+----------------------------------+
| INACTIVE   [Show / Hide]         |
| ...                              |
+----------------------------------+
```

Page title is `Lists` (Tasks-first canonical). Route is `/quests` until the rename lands.

### 7.8 — Habit Lists / Categories (Mobile)

```text
+----------------------------------+
| Tasks / Habit Lists    [+ Add]   |
+----------------------------------+
| [↕] Spiritual         (4 quests) |
| [↕] Health            (3 quests) |
| [↕] Career            (2 quests) |
| ...                              |
+----------------------------------+
| Default starter pack             |
| (visible only if no categories)  |
+----------------------------------+
```

Drag-and-drop reorder is P1; up/down buttons currently fill the role on mobile.

### 7.9 — Activity Log / History (Mobile)

```text
+----------------------------------+
| Tasks / Activity Log [Filters]   |
+----------------------------------+
| MAR 12, 2026                     |
| 07:10  Salat Subuh        [Open] |
|        Spiritual · Daily         |
| 09:30  Fix onboarding     [Open] |
|        Career · Daily            |
+----------------------------------+
| MAR 11, 2026                     |
| 18:10  Money review       [Open] |
|        Finance · Weekly          |
+----------------------------------+
| [Load more]                      |
+----------------------------------+

Sheet: completion detail, note edit, delete completion
```

Activity log stays chronological and human-readable, never table-like. Empty states route users back to action surfaces, not to a dead-end archive.

### 7.10 — Landing (Mobile)

```text
+----------------------------------+
| Rythm                            |
+----------------------------------+
| Build a rhythm you can           |
| actually keep.                   |
| Short supporting paragraph.      |
|                  [Start free]    |
+----------------------------------+
| Product preview                  |
| (Today snapshot screenshot)      |
+----------------------------------+
| 1. Calm daily clarity            |
| 2. Recurring + due tasks         |
| 3. Honest activity log           |
+----------------------------------+
| Sign in    Footer                |
+----------------------------------+
```

Single-column on both mobile and desktop. One dominant CTA.

### 7.11 — Sign In (Mobile)

```text
+----------------------------------+
| Rythm                            |
| Sign in to continue your rhythm  |
+----------------------------------+
| Email                            |
| [________________________]       |
| Password                         |
| [________________________]       |
|                  [Sign in]       |
| Forgot password?                 |
+----------------------------------+
| Need an account? Go to sign up   |
+----------------------------------+
```

Form is the task. Supporting copy stays short. No companion panel should outweigh the form itself.

### 7.12 — Offline (Mobile)

```text
+----------------------------------+
| You're offline                   |
| Rythm can reopen the shell, but  |
| live writes still need network.  |
+----------------------------------+
| [Try sign in again]              |
| [Retry app entry]                |
+----------------------------------+
```

Two recovery actions max. Honest about the limitation.

---

## Section 8 — Action Placement

| Surface | Primary action | Secondary actions |
|---|---|---|
| Today / Dashboard | Row check / uncheck, quick add | Filter, show-inactive toggle, open detail sheet |
| Upcoming | Date triage over projected recurring periods | Filter |
| Calendar (planned) | Date selection, scheduling | Filter |
| Lists / Quests | Select a list, add or edit a quest | Search, type/category filter, deactivate |
| Habit Lists / Categories | Add or rename a list | Reorder, delete-with-guard |
| Activity Log / History | Filter and open a completion | Note edit (inside detail), delete (destructive secondary) |
| Landing | One dominant CTA per section | One educational secondary CTA in hero |
| Auth | One submit per form | Secondary recovery link visible (forgot, sign up) |
| Offline | Two recovery actions max | none |

---

## Section 9 — Responsive Behavior

- **Mobile is the source layout.** Desktop extends it with width, not new conceptual layers.
- Desktop may expose the full four-zone shell (modules, tasks rail, list column, detail pane), but content order must remain understandable in a single vertical flow.
- Mobile collapses module and task rails into a drawer or stacked switcher *before* degrading task-row readability.
- Filters collapse or compact on mobile before list content is pushed below the fold.
- Contextual editing uses:
  - Mobile: bottom sheet or full-height sheet
  - Desktop: side pane or drawer
- No screen depends on hover to reveal its primary path.
- Touch targets and spacing stay comfortable for one-handed PWA use on phones.

---

## Section 10 — Motion And Interaction

### Durations

- Fast: `160ms`
- Default: `240ms`
- Staged entrance: `400ms`

### Easing

Smooth ease-out curves only.

### Motion Rules

- Motion supports state change, hierarchy, and entrance.
- Motion is **never** the identity of the product.
- No bounce.
- No ornamental floatiness as a core behavior.
- Landing may use restrained staged entrance (the `.landing-enter` keyframe in `app/globals.css` is the canonical example).
- App motion stays quieter and more utilitarian.

---

## Section 11 — Light / Dark Policy

- Light mode is the source system.
- Dark mode is supported but **derived** — same slate family, adjusted lightness.
- Dark mode does not invent a second visual identity.
- No neon accents, glow borders, or default dark-marketing aesthetics.
- Marketing pages default to light unless a specific future campaign requires otherwise.

---

## Section 12 — Token Mapping And Component Touchpoints

The first implementation pass of the design migration should update the base primitives before touching feature screens:

| File | Current state | Target state |
|---|---|---|
| [components/ui/button.tsx](../components/ui/button.tsx) | Base button and `icon` size default to `rounded-full` | Default to rounded-rectangle (`--radius-sm` family); pill remains available as an explicit semantic variant |
| [components/ui/input.tsx](../components/ui/input.tsx) | `rounded-2xl` | `--radius-lg` (14px) |
| [components/ui/select.tsx](../components/ui/select.tsx) | Trigger and popover use `rounded-2xl` | Align trigger to `--radius-lg`, popover to `--radius-xl` if popover acts as a panel |
| [components/ui/textarea.tsx](../components/ui/textarea.tsx) | `rounded-lg` | Already close; review against final tokens |
| [components/ui/sheet.tsx](../components/ui/sheet.tsx) | Pill-cued close affordances | Rounded-rectangle, follow the surface grammar |

After primitives are updated, propagate through:

- [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) — marketing shell still expresses older warm-system pill-heavy language; should adopt slate tokens and rectangle shapes.
- [components/app/app-shell.tsx](../components/app/app-shell.tsx) and [components/app/app-sidebar.tsx](../components/app/app-sidebar.tsx) — shell structure now follows the module rail + Tasks rail + mobile drawer grammar; keep future shell changes inside this pattern.
- Feature screens under [components/dashboard](../components/dashboard), [components/upcoming](../components/upcoming), [components/quests](../components/quests), [components/categories](../components/categories), [components/history](../components/history) — list rows, chips, and filters should inherit the new primitives instead of keeping local pill-heavy exceptions.

When the visual pass happens, theme metadata should also align:

- `app/manifest.ts` `theme_color`
- `app/layout.tsx` `metadata.themeColor`

---

## Section 13 — Do / Do Not Cheat Sheet

### Do

- Use big, confident type where hierarchy needs it.
- Let screenshots carry marketing credibility.
- Keep borders disciplined and visible.
- Favor staged composition on landing.
- Favor rows and grouped content inside the app.
- Reach for tokens before adding new visual values.
- Add new tokens to `app/globals.css` first when a new surface treatment is genuinely needed.
- Use Tasks-first labels in all copy, page titles, and sidebar text.
- Use specific verbs in button copy ("Create quest" beats "Submit").
- When implementing gamification, keep it quiet: XP as a small mono counter, badges in a dedicated surface (not the main list), no glow, no aggressive animations.

### Do Not

- Copy the reference colors (no Creative Tim blue gradients).
- Default to purple, neon, or gradient-heavy styling.
- Use full-pill buttons everywhere — reserve them for semantic pill use.
- Turn operational screens into card galleries.
- Use glossy glassmorphism or startup-glow polish.
- Treat dark mode as the primary personality of the product.
- Hardcode `hsl(...)`, `oklch(...)`, gradient literals, or shadow literals when a token can represent the value.
- Implement gamification with fire emojis, celebration floods, aggressive streak-as-pressure mechanics, or social leaderboard UI — gamification is planned but must stay in the calm register.
- Build KPI walls or dashboard card galleries.
- Introduce hover-only interactions on primary paths.
- Rename routes without following the IA Roadmap sequence in [PRODUCT_PLAN.md](./PRODUCT_PLAN.md#ia-roadmap-tasks-first) (route rename is planned work with a specific sequence, not a one-off edit).

---

## Section 14 — QA Checklist

The design system is correctly applied if all of the following are true:

- A landing hero can be built without guessing headline hierarchy, hero composition, CTA styling, or screenshot framing.
- The authenticated shell can be built without guessing module rail, task rail, list column, or detail pane behavior.
- `Today`, `Lists`, and `Activity Log` can be restyled without guessing fonts, semantic colors, radius, shadows, or density.
- The relationship to the visual reference is explicit: composition and type discipline inherited; palette and glossy decoration rejected.
- The app still reads as a calm ritual tool, not a SaaS admin dashboard.
- The landing page can be more expressive than the app without looking like a different product.
- Dark mode remains obviously derived from the light system.
- Any gamification surface (XP counter, badge grid) uses the same quiet slate token palette — no glow, no neon, no outsized celebration states.

---

## Companion Artifacts

- [docs/wireframes.html](./wireframes.html) — full app wireframe spec (HTML)
- [docs/landing-page.html](./landing-page.html) — landing page wireframe and copy deck (HTML)

These two are kept as visual references. If they conflict with this document, this document wins.

## Implementation Notes

- This document is the source of truth for visual implementation.
- If current code conflicts with this document, the document wins.
- The next UI pass should use this document to migrate the component primitives in `components/ui` first, then propagate to feature screens (see Section 12).
- The next IA-aware UI pass depends on resolving the strategic decision in [PRODUCT_PLAN.md](./PRODUCT_PLAN.md#open-strategic-decisions).
