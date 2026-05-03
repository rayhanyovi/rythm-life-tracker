# Archived: Original PRD + BRD + TRD (January 2026)

> **STATUS: HISTORICAL — DO NOT USE AS SOURCE OF TRUTH.**
>
> This file consolidates the original product brief that bootstrapped Rythm. It is preserved here for historical context and decision provenance only. Several technical choices in this document have been **superseded**:
>
> - **Auth:** Original spec called for Supabase Auth. Current implementation uses **Better Auth**.
> - **Database access:** Original spec called for Supabase client + RLS. Current implementation uses **Prisma ORM** with **server-side authorization** (no RLS).
> - **Backend:** Original spec called for Supabase as the backend. Current implementation is a **fullstack Next.js app on Vercel** with a PostgreSQL-compatible database.
> - **Routes:** Original spec listed `/login`, `/register`. Current implementation uses `/sign-in`, `/sign-up`.
> - **Subset of UI direction:** Original spec said "clean, minimal, no heavy theming." Current direction (preserved in [DESIGN_DIRECTION.md](../DESIGN_DIRECTION.md)) is more opinionated: cool premium slate, typography-led, list-led, non-gamified, mobile-first.
>
> If you need the current product spec, read [docs/PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md) and [docs/PRODUCT_PLAN.md](../PRODUCT_PLAN.md). If you need the current technical plan, read [docs/TECHNICAL_PLAN.md](../TECHNICAL_PLAN.md). If you need the current design direction, read [docs/DESIGN_DIRECTION.md](../DESIGN_DIRECTION.md).
>
> The product **concepts** in this document — quests, categories, completion-per-period, streaks, the Wheel-of-Life seed — remain accurate. The **tech and architecture** sections do not.

---

## Original Header

> Version: 1.0
> Status: MVP Definition
> Project Owner: Yovi
> Product Name: **Rythm**

---

## 1. Product Overview

### 1.1 Vision

Rythm adalah aplikasi **habit & life rhythm tracker** berbasis quest yang membantu pengguna menjalani rutinitas hidup secara konsisten melalui sistem checklist yang sederhana dan terstruktur.

Aplikasi ini berfokus pada:

- Rutinitas yang berulang (Daily / Weekly / Monthly)
- Milestone hidup (Main Quest)
- Sistem streak untuk menjaga konsistensi

Tujuan utama Rythm adalah memberikan pengguna **struktur kehidupan yang jelas** melalui sistem quest sederhana yang bisa dicentang setiap periode.

---

## 2. Business Requirements (BRD)

### 2.1 Problem Statement

Banyak orang ingin hidup lebih disiplin tetapi kesulitan menjaga konsistensi karena:

- Tidak ada sistem tracking yang jelas
- Rutinitas tidak terstruktur
- Habit tracker terlalu kompleks atau terlalu gamified

Rythm menyelesaikan masalah ini dengan:

- Sistem **quest sederhana**
- Checklist berbasis periode
- Tracking streak otomatis
- Struktur hidup berbasis kategori

### 2.2 Target Users

**Primary Users:** individu yang menyukai rutinitas, ingin sistem disiplin yang jelas, menjalankan habit seperti ibadah, olahraga, belajar.

**Early Users:** founder + pasangan founder.

### 2.3 Value Proposition

- Struktur hidup yang jelas
- Habit tracking yang ringan
- Visual progress sederhana
- Sistem quest yang intuitif

### 2.4 Success Metrics (MVP)

- Pengguna mampu membuat quest sendiri
- Pengguna dapat mencentang quest setiap hari
- Streak dapat dihitung secara otomatis
- Dashboard memberikan overview rutinitas

Tidak ada analytics kompleks pada MVP.

---

## 3. Product Requirements (PRD)

### 3.1 Platform

- Web Application
- Progressive Web App (PWA)
- Multi-user

### 3.2 Authentication

> **SUPERSEDED.** Original spec said Supabase Auth + email/password. Current implementation uses Better Auth + email/password with email verification. See [TECHNICAL_PLAN.md Section 7](../TECHNICAL_PLAN.md#7-authentication-flow).

### 3.3 Core Product Concepts (still accurate)

#### Quest

Quest adalah aktivitas yang ingin dilakukan pengguna.

| Type | Description |
|---|---|
| Daily | Diulang setiap hari |
| Weekly | Diulang setiap minggu |
| Monthly | Diulang setiap bulan |
| Main Quest | Quest satu kali (milestone) |

#### Category

Quest dikelompokkan dalam kategori berdasarkan konsep **Wheel of Life**.

Default seed: Spiritual, Health, Career, Finance, Personal Growth, Relationship.

Pengguna juga dapat membuat kategori baru.

#### Completion

Completion terjadi ketika user mencentang quest. Completion disimpan **per periode**.

Example for a daily quest "Run 30 minutes":

```
Completion:
  2026-01-01
  2026-01-02
  2026-01-03
```

#### Streak

Streak adalah jumlah periode berturut-turut quest diselesaikan.

```
Daily Quest
Jan 1 ✓
Jan 2 ✓
Jan 3 ✓
Jan 4 ✗

Streak = 3
```

### 3.4 MVP Features (still accurate)

1. Authentication: Register, Login, Logout
2. Quest CRUD: Create, Edit, Delete, Deactivate
3. Quest Completion: Centang, Uncheck, Note opsional, recorded per period
4. Dashboard: today's quest list, completion status, streak per quest, category filter
5. History View: completion history, notes, uncheck previous
6. Category Management: create, rename, delete, reorder

---

## 4. Technical Requirements (TRD)

> **THIS ENTIRE SECTION IS SUPERSEDED.** The original tech stack was Supabase + React + Tailwind. Current stack is Next.js 16 App Router + React 19 + TypeScript + Tailwind 4 + shadcn/ui + Better Auth + Prisma 7 + PostgreSQL-compatible. See [TECHNICAL_PLAN.md Section 1](../TECHNICAL_PLAN.md#1-architecture).

Original architecture (for historical reference only):

```
Client (React PWA)
  |
  | REST / Supabase client
  |
Supabase Backend
  |
Postgres Database
```

PWA requirement (still accurate): installable, manifest, service worker for app shell. No offline sync at MVP.

---

## 5. Database Schema

> **PARTIALLY SUPERSEDED.** Field types changed from `uuid` to `cuid` strings. The schema concepts (categories, quests, quest_completions) and the unique/integrity constraints remain. See [TECHNICAL_PLAN.md Section 4](../TECHNICAL_PLAN.md#4-database-schema) for the canonical schema.

Original schema:

### categories
```
id           uuid
user_id      uuid
name         text
sort_order   int
created_at   timestamptz
unique(user_id, name)
```

### quests
```
id           uuid
user_id      uuid
category_id  uuid
title        text
description  text
quest_type   enum(DAILY, WEEKLY, MONTHLY, MAIN)
is_active    boolean
created_at   timestamptz
updated_at   timestamptz
```

### quest_completions
```
id            uuid
user_id       uuid
quest_id      uuid
period_type   text
period_key    text
completed_at  timestamptz
note          text
unique (user_id, quest_id, period_type, period_key)
```

---

## 6. Period System (still accurate)

Completion disimpan menggunakan `period_key`.

| Type | Format | Example |
|---|---|---|
| Daily | `YYYY-MM-DD` | `2026-01-01` |
| Weekly | `YYYY-Www` (ISO week) | `2026-W04` |
| Monthly | `YYYY-MM` | `2026-01` |
| Main Quest | constant | `ONE_TIME` |

---

## 7. Completion Flow (still accurate)

**Mark Complete.** User mencentang quest. System upserts `quest_completions` for `(user_id, quest_id, period_type, period_key)`. Sets `completed_at = now()`.

**Uncheck.** System deletes the row matching the active period.

---

## 8. Streak Algorithm (still accurate)

For recurring quest types only:

- **Daily:** ambil completion terakhir, iterasi mundur per hari, stop ketika gap ditemukan.
- **Weekly:** iterasi berdasarkan ISO week.
- **Monthly:** iterasi berdasarkan bulan.
- **Main Quest:** tidak memiliki streak.

See [TECHNICAL_PLAN.md Section 5](../TECHNICAL_PLAN.md#5-period-and-streak-rules) for the current canonical rule (handles "current period not yet completed" correctly).

---

## 9. Security

> **SUPERSEDED.** Original spec called for Supabase RLS. Current implementation is server-side authorization in route handlers, gated on Better Auth session. See [TECHNICAL_PLAN.md Sections 7–8](../TECHNICAL_PLAN.md#7-authentication-flow).

---

## 10. UI Structure

> **PARTIALLY SUPERSEDED.** Routes renamed: `/login` → `/sign-in`, `/register` → `/sign-up`. Sidebar labels updated to Tasks-first framing (Today / Lists / Habit Lists / Activity Log) — see [DESIGN_DIRECTION.md Section 2](../DESIGN_DIRECTION.md#section-2--information-architecture). The IA pivot is an unsettled strategic decision tracked in [PRODUCT_PLAN.md](../PRODUCT_PLAN.md#open-strategic-decisions).

Original pages:

- `/login`
- `/register`
- `/dashboard`
- `/quests`
- `/categories`
- `/history`

---

## 11. Non Goals (MVP) — still accurate

- Analytics charts
- XP system
- Level system
- Badges
- Social features
- Sub quests
- Team collaboration

---

## 12. Future Features (Post-MVP)

Potensi pengembangan (still potential, not committed):

- Habit analytics
- XP & gamification *(but see current product stance: explicitly out of scope, not just out of MVP)*
- AI habit insights
- Mobile native app
- Shared quests (couples / family)
- Sub quests
- Habit difficulty scaling

> **Note for current product direction:** the current product stance in [PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md) is more opinionated than this list — XP / gamification are positioned as deliberate non-goals, not deferred features.

---

## 13. Design Principles — partially accurate

Original principles (Rythm should be):

- Fast
- Minimal
- Focused
- Habit-first
- Low cognitive load

UI reference: closer to **Linear / Notion / Todoist** than to a game.

> **Current direction is more developed:** see [DESIGN_DIRECTION.md](../DESIGN_DIRECTION.md) for the canonical visual DNA, IA, tokens, and component rules. The "calm, structured, honest, premium-but-not-glossy" direction extends this original principle.

---

## 14. MVP Scope Summary — accurate

MVP must be able to:

- User login
- User membuat quest
- User mencentang quest
- Streak dihitung otomatis
- Dashboard menampilkan rutinitas
- Quest bisa di CRUD
- Completion tersimpan per periode

These are all currently shipped. See [PRODUCT_PLAN.md Feature Inventory](../PRODUCT_PLAN.md#feature-inventory).

---

## Source Material Provenance

This consolidated archive was derived from two original `.txt` files:

1. `docs/Rythm PRD + BRD + TRD .txt` — the longer formal document (most content above came from this)
2. `docs/RYTHM - PRD + BRD + TRD.txt` — a shorter prompt-style spec used to bootstrap the initial scaffolding

Both originals contained Supabase-era technical decisions that have since been superseded. They are preserved in git history if a deeper dive is ever needed.
