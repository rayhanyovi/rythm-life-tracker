# Rythm Tech Plan

Dokumen ini merapikan kebutuhan teknis MVP Rythm agar implementasi tidak ambigu. Semua keputusan di bawah adalah hasil penggabungan dua dokumen sumber dan konteks repo saat ini.

## 1. Technical Direction

### Primary Decision

MVP dibangun sebagai aplikasi fullstack Next.js di root app yang sama, dengan deployment target utama di Vercel.

### Standardized Decisions

- Frontend + backend: Next.js App Router, Route Handlers, Server Actions, React, TypeScript, Tailwind CSS
- Component library: `shadcn/ui` sebagai basis komponen UI reusable
- Authentication: Better Auth
- Data access layer: Prisma ORM
- Database family: PostgreSQL-compatible database, dengan provider hosting yang boleh diputuskan belakangan
- Hosting target: Vercel untuk FE dan BE
- Delivery target: installable PWA
- UI language: English
- Default timezone logic MVP: `Asia/Jakarta`

### Technology Resolution

Dokumen awal sempat mengarah ke stack Supabase-native. Keputusan final untuk MVP sekarang adalah:

- gunakan Better Auth untuk session, sign-in, sign-up, dan auth endpoints
- gunakan Prisma ORM sebagai data access layer utama
- pertahankan database di level `PostgreSQL-compatible`, tanpa mengunci provider hosting dari sekarang
- jangan mengandalkan Supabase Auth atau RLS dalam desain inti aplikasi

Alasan:

- lebih cocok dengan target fullstack Next.js di Vercel
- Better Auth punya integrasi resmi untuk Next.js dan mendukung preview deployment host patterns seperti `*.vercel.app`
- Prisma punya panduan resmi untuk Next.js + Vercel dan menjaga opsi database tetap luas
- Better Auth secara resmi mendukung adapter Prisma dan schema generation untuk Prisma

### Alternative Kept Open

Drizzle tetap merupakan alternatif yang valid, terutama jika nanti tim ingin query layer yang lebih SQL-first. Namun untuk baseline MVP, pilihan default adalah Prisma karena tooling, ecosystem, dan fleksibilitas deployment-nya lebih mudah untuk fase sekarang.

## 2. Current Base Stack

Stack yang sudah ada di repo root:

- Next.js `16.1.6`
- React `19.2.3`
- TypeScript `5`
- Tailwind CSS `4`
- ESLint `9`

Stack layanan yang dibutuhkan untuk MVP:

- `shadcn/ui` untuk primitive dan application components
- `@radix-ui/react-select` dan `@radix-ui/react-checkbox` sebagai primitive control yang dibungkus via `shadcn/ui`
- `sonner` sebagai baseline toast yang dipasang lewat wrapper `shadcn/ui`
- Better Auth untuk email/password authentication dan session management
- Prisma ORM untuk schema, migrations, dan query layer
- `@prisma/adapter-pg` + `pg` untuk Prisma runtime pada jalur PostgreSQL-compatible saat ini
- PostgreSQL-compatible database sebagai persistence layer
- Vercel sebagai hosting target untuk Next.js app
- basic PWA manifest dan service worker caching
- `node:test` + `tsx` untuk unit test helper domain dan validator
- `@playwright/test` + `npm run qa:layout` untuk screenshot-based manual layout review workflow

## 3. System Architecture

```text
Browser / PWA
  -> Next.js App Router UI
  -> Route Handlers / Server Actions / Server Components
  -> Better Auth + Prisma
  -> PostgreSQL-compatible database
```

### Architecture Notes

- Browser client dipakai untuk session-aware UI dan interaksi ringan.
- Operasi data utama dilakukan lewat server boundary, bukan direct client-to-database pattern.
- Better Auth menangani session cookie dan auth lifecycle.
- Prisma menjadi source of truth untuk data model aplikasi dan query execution.
- Prisma runtime saat ini diasumsikan berjalan melalui driver adapter PostgreSQL, sementara provider hosting database tetap bisa diputuskan belakangan selama kompatibel dengan jalur itu.
- Ownership dan authorization di-enforce di layer aplikasi server, bukan melalui RLS.
- UI primitives dan form building blocks distandardisasi lewat `shadcn/ui`, lalu dikomposisikan menjadi komponen produk milik Rythm.
- Default runtime target untuk route handler yang menyentuh Prisma adalah Node.js runtime di Vercel, bukan Edge.

## 4. Recommended App Structure

Struktur ini bukan aturan mutlak, tetapi cukup masuk akal untuk MVP:

```text
app/
  (auth)/
    sign-in/page.tsx
    sign-up/page.tsx
  (app)/
    dashboard/page.tsx
    quests/page.tsx
    categories/page.tsx
    history/page.tsx
  offline/page.tsx
  api/
    auth/[...all]/route.ts
    dashboard/route.ts
    categories/route.ts
    categories/reorder/route.ts
    categories/[id]/route.ts
    quests/route.ts
    quests/[id]/route.ts
    quests/[id]/current-completion/route.ts
    completions/[id]/route.ts
    history/route.ts
    bootstrap/default-categories/route.ts
  manifest.ts

lib/
  auth.ts
  auth-client.ts
  db.ts
  periods/
  streaks/
  validators/

components/
  ui/
  app/
    page-intro.tsx
    metric-card.tsx
    detail-panel.tsx
    detail-stat.tsx
    interactive-list-card.tsx
  quests/
  categories/
  history/

prisma/
  schema.prisma
  migrations/

types/
  domain.ts
```

### UI Library Rule

- gunakan `shadcn/ui` sebagai library komponen utama
- simpan primitive hasil generate di `components/ui`
- buat komponen produk Rythm di luar `components/ui`
- simpan pattern layout lintas halaman di `components/app` agar `page intro`, `metric card`, `list item shell`, dan `detail panel` tidak diulang di setiap screen
- hindari mencampur banyak UI kit agar styling token dan behavior tetap konsisten
- gunakan token dari `app/globals.css` sebagai source of truth untuk warna, radius, shadow, font, dan surface treatment
- jangan hardcode nilai visual seperti `hsl(...)`, `oklch(...)`, `rgba(...)`, gradient literal, atau shadow literal langsung di komponen jika bisa direpresentasikan sebagai token
- jika butuh surface atau treatment baru yang belum ada, tambahkan token atau utility berbasis token di `app/globals.css` lebih dulu
- untuk filter dan form yang padat, prioritaskan `Select`, `Checkbox`, `Sheet`, `AlertDialog`, `Alert`, dan `Toast` dari jalur `shadcn/ui` agar behavior mobile dan desktop tetap konsisten

## 5. Product Routes

User-facing routes:

- `/sign-in`
- `/sign-up`
- `/dashboard`
- `/quests`
- `/categories`
- `/history`

Optional redirects:

- `/` -> redirect ke `/dashboard` jika authenticated
- `/` -> redirect ke `/sign-in` jika belum authenticated

## 6. Domain Model

### 6.1 Enums

```ts
type QuestType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MAIN'
type PeriodType = QuestType
```

### 6.2 Category

```ts
type Category = {
  id: string
  userId: string
  name: string
  sortOrder: number
  createdAt: string
}
```

### 6.3 Quest

```ts
type Quest = {
  id: string
  userId: string
  categoryId: string
  title: string
  description: string | null
  questType: QuestType
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

### 6.4 QuestCompletion

```ts
type QuestCompletion = {
  id: string
  userId: string
  questId: string
  periodType: PeriodType
  periodKey: string
  completedAt: string
  note: string | null
  createdAt: string
}
```

### 6.5 DashboardQuestItem

Derived type untuk kebutuhan dashboard:

```ts
type DashboardQuestItem = {
  questId: string
  categoryId: string
  categoryName: string
  title: string
  description: string | null
  questType: QuestType
  isActive: boolean
  isCompletedNow: boolean
  currentPeriodKey: string
  streak: number | null
  completionId: string | null
  note: string | null
}
```

`streak` bernilai `null` untuk `MAIN`, lalu ditampilkan sebagai `-` di UI.

## 7. Database Plan

### 7.1 Auth Schema

Better Auth membutuhkan core auth tables sendiri. Dengan baseline Prisma, schema auth ini sebaiknya digenerate dan dipelihara lewat Better Auth CLI + Prisma schema.

Core entities yang harus diasumsikan ada:

- `user`
- `session`
- `account`
- `verification`

Catatan:

- nama tabel bisa tetap default Better Auth atau dikustomisasi jika benar-benar diperlukan
- tabel aplikasi Rythm harus mereferensikan Better Auth user id
- jangan mendesain schema app yang bergantung ke Supabase `auth.users`

### 7.2 `categories`

```sql
id string primary key
user_id string not null references Better Auth user.id
name text not null
sort_order int not null default 0
created_at datetime not null default now()

unique (user_id, name)
```

### 7.3 `quests`

```sql
id string primary key
user_id string not null references Better Auth user.id
category_id string not null references categories(id) on delete restrict
title text not null
description text null
quest_type text not null check (quest_type in ('DAILY','WEEKLY','MONTHLY','MAIN'))
is_active boolean not null default true
created_at datetime not null default now()
updated_at datetime not null default now()
```

### 7.4 `quest_completions`

```sql
id string primary key
user_id string not null references Better Auth user.id
quest_id string not null references quests(id) on delete cascade
period_type text not null check (period_type in ('DAILY','WEEKLY','MONTHLY','MAIN'))
period_key text not null
completed_at datetime not null default now()
note text null
created_at datetime not null default now()

unique (user_id, quest_id, period_type, period_key)
```

### 7.5 Recommended Indexes

```sql
create index idx_categories_user_sort on categories(user_id, sort_order);
create index idx_quests_user_category on quests(user_id, category_id);
create index idx_quests_user_type_active on quests(user_id, quest_type, is_active);
create index idx_completions_user_quest_period on quest_completions(user_id, quest_id, period_type, period_key);
create index idx_completions_user_completed_at on quest_completions(user_id, completed_at desc);
```

### 7.5.1 Canonical Migration Baseline

- simpan baseline SQL pertama di `prisma/migrations` sebagai migration canonical
- migration awal harus mencakup auth tables Better Auth dan tabel aplikasi Rythm
- `quests.updated_at` harus dijaga oleh trigger database di migration canonical agar timestamp tetap konsisten walau ada write di luar Prisma
- `updated_at` columns yang dipakai auth dan quest sebaiknya punya `default now()` sekaligus tetap di-update oleh Prisma pada write normal

### 7.6 Integrity Rules

- `quests.user_id` harus sama dengan owner category yang dipakai
- `quest_completions.user_id` harus sama dengan `quests.user_id`
- `quest_completions.period_type` harus sama dengan `quests.quest_type`
- `MAIN` selalu memakai `period_key = 'ONE_TIME'`
- schema Prisma harus menjaga foreign key dan unique constraint ini tetap eksplisit

## 8. Period System

Period key harus dihitung berdasarkan waktu lokal pengguna, dengan asumsi default MVP `Asia/Jakarta`.

Format:

- `DAILY`: `YYYY-MM-DD`
- `WEEKLY`: `YYYY-Www` menggunakan ISO week
- `MONTHLY`: `YYYY-MM`
- `MAIN`: `ONE_TIME`

Contoh:

- daily: `2026-01-25`
- weekly: `2026-W04`
- monthly: `2026-01`
- main: `ONE_TIME`

### Important Rule

Gunakan helper period tunggal di seluruh aplikasi. Jangan hitung `period_key` di banyak tempat dengan logika berbeda, karena ini mudah menimbulkan bug timezone dan mismatch streak.

## 9. Completion Rules

### Mark Complete

Saat user mencentang quest:

1. hitung `currentPeriodKey`
2. validasi bahwa `period_type` sama dengan `quest_type`
3. upsert completion berdasarkan kombinasi unik
4. set `completed_at = now()`
5. simpan `note` jika diberikan

### Uncheck

Saat user membatalkan centang quest:

1. hitung `currentPeriodKey`
2. hapus row completion yang cocok untuk quest dan periode itu

### Edit Note

Note dapat diubah pada completion yang sudah ada tanpa mengubah `period_key`.

## 10. Streak Rules

Streak hanya berlaku untuk `DAILY`, `WEEKLY`, dan `MONTHLY`.

### Standardized Rule

`Current streak` dihitung sebagai jumlah completion beruntun yang berakhir pada periode saat ini jika quest sudah selesai untuk periode sekarang. Jika belum selesai pada periode sekarang, streak dihitung dari periode sebelumnya yang berurutan.

Konsekuensinya:

- streak bisa tetap terlihat walau quest hari ini belum dicentang
- tetapi streak akan menjadi 0 jika ada gap sebelum periode sebelumnya

### Suggested MVP Strategy

MVP boleh menghitung streak di application layer dengan mengambil riwayat completion terbatas:

- daily: 90 periode terakhir
- weekly: 52 periode terakhir
- monthly: 24 periode terakhir

Jika nanti performa tidak cukup, pindahkan ke database function atau materialized strategy.

## 11. API Contract

Endpoint di bawah adalah kontrak internal aplikasi. Implementasi bisa memakai Route Handlers.

### 11.1 Auth

Autentikasi utama memakai Better Auth.

Route utama yang perlu dipasang:

- `GET /api/auth/[...all]`
- `POST /api/auth/[...all]`

Implementation notes:

- handler sebaiknya dipasang di `app/api/auth/[...all]/route.ts`
- gunakan Better Auth Next.js handler (`toNextJsHandler`)
- gunakan Better Auth client untuk client-side sign-in/sign-up flows
- gunakan `auth.api.getSession({ headers: await headers() })` untuk server-side session checks
- konfigurasi `baseURL.allowedHosts` harus mencakup `localhost:3000`, host aktif dari `BETTER_AUTH_URL`, dan `*.vercel.app` agar preview deployment aman dan local smoke test dengan port terpisah tetap valid

### 11.2 Dashboard

`GET /api/dashboard`

Query params:

- `date` optional, format `YYYY-MM-DD`
- `categoryId` optional
- `includeInactive` optional boolean

Response ringkas:

```ts
type DashboardResponse = {
  date: string
  categories: Array<{
    categoryId: string
    categoryName: string
    items: DashboardQuestItem[]
  }>
}
```

### 11.3 Categories

`GET /api/categories`

- mengambil semua category milik user, urut `sort_order asc`

`POST /api/categories`

```ts
type CreateCategoryBody = {
  name: string
}
```

`PATCH /api/categories/:id`

```ts
type UpdateCategoryBody = {
  name?: string
}
```

`POST /api/categories/reorder`

```ts
type ReorderCategoriesBody = {
  categoryIds: string[]
}
```

`DELETE /api/categories/:id`

MVP decision:

- tolak penghapusan jika masih ada quest aktif atau historis yang memakai category tersebut
- pesan error harus meminta user memindahkan atau menghapus quest terlebih dahulu

### 11.4 Quests

`GET /api/quests`

Query params:

- `search` optional
- `categoryId` optional
- `questType` optional
- `includeInactive` optional boolean

`POST /api/quests`

```ts
type CreateQuestBody = {
  categoryId: string
  title: string
  description?: string | null
  questType: QuestType
  isActive?: boolean
}
```

`GET /api/quests/:id`

`PATCH /api/quests/:id`

```ts
type UpdateQuestBody = {
  categoryId?: string
  title?: string
  description?: string | null
  questType?: QuestType
  isActive?: boolean
}
```

`DELETE /api/quests/:id`

MVP decision:

- hard delete diizinkan
- deactivation tetap disediakan sebagai opsi yang lebih aman untuk menjaga history

### 11.5 Current Completion

`PUT /api/quests/:id/current-completion`

```ts
type UpsertCurrentCompletionBody = {
  note?: string | null
}
```

Server menghitung `period_key` sendiri berdasarkan quest type dan timezone default aplikasi.

`DELETE /api/quests/:id/current-completion`

- menghapus completion quest untuk periode aktif saat ini

### 11.6 Completion Note Update

`PATCH /api/completions/:id`

```ts
type UpdateCompletionBody = {
  note: string | null
}
```

`DELETE /api/completions/:id`

- menghapus satu row completion berdasarkan `completionId`
- dipakai oleh history page untuk correction flow tanpa menghapus quest

### 11.7 History

`GET /api/history`

Query params:

- `from` optional
- `to` optional
- `questId` optional
- `categoryId` optional
- `questType` optional
- `cursor` optional

Response ringkas:

```ts
type HistoryResponse = {
  items: Array<{
    completionId: string
    completedAt: string
    note: string | null
    questId: string
    questTitle: string
    questType: QuestType
    categoryId: string
    categoryName: string
    periodKey: string
  }>
  nextCursor: string | null
}
```

### 11.8 Default Categories Bootstrap

`POST /api/bootstrap/default-categories`

Tujuan:

- membuat seed kategori awal secara idempotent setelah first login
- hanya membuat category yang belum ada

Default category candidates:

- Spiritual
- Finance
- Career
- Health
- Personal Growth
- Relationship

## 12. Validation Rules

### Category

- `name` wajib
- `name` unik per user
- trimming whitespace wajib

### Quest

- `title` wajib
- `categoryId` wajib
- `questType` wajib
- `description` opsional

### Completion

- note opsional
- completion tidak boleh dibuat untuk quest milik user lain
- completion tidak boleh dibuat jika `period_type` berbeda dari `quest_type`

## 13. Security Plan

Security model MVP tidak menggunakan RLS. Authorization dilakukan di server layer.

### Session And Auth Checks

- semua route handler, server action, dan protected page harus mengambil session dari Better Auth
- semua request tanpa session valid harus ditolak atau diarahkan ke sign-in
- proxy atau middleware boleh dipakai untuk redirect optimistis, tetapi validasi final tetap harus dilakukan di page atau route handler
- akses session sebaiknya tetap dipusatkan di `lib/session.ts` melalui `sessionApi` agar route/page tests bisa mengganti auth source tanpa menduplikasi logic handler

### Data Authorization Rules

- client tidak boleh mengirim `userId` sebagai source of truth
- server selalu mengambil user id dari session Better Auth
- query category, quest, dan completion harus selalu difilter dengan session user id
- mutation harus memastikan relasi ownership valid sebelum write

### Data Integrity Rules

- foreign key dan unique constraint tetap dijaga di database
- Prisma schema dan migration harus menjaga constraint ownership tetap eksplisit
- destructive actions harus tetap melewati validasi bisnis aplikasi

## 14. PWA Plan

MVP PWA requirement:

- app installable
- manifest tersedia
- icon dasar tersedia
- service worker untuk cache app shell
- offline fallback page tersedia untuk navigation request yang gagal

MVP non-goal:

- offline-first mutation queue
- background sync
- conflict resolution lintas perangkat

## 15. Environment Plan

Runtime environment minimal:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`

Optional:

- `DIRECT_URL` untuk provider Postgres serverless yang memisahkan direct dan pooled connection
- `NEXT_PUBLIC_APP_TIMEZONE=Asia/Jakarta`

Build-time and tooling note:

- root app perlu konfigurasi `shadcn/ui` yang kompatibel dengan Next.js App Router dan Tailwind CSS 4
- Better Auth perlu konfigurasi host yang kompatibel dengan localhost dan preview deployment Vercel
- env access sebaiknya dipusatkan di `lib/env.ts`, bukan tersebar langsung di `process.env`
- Prisma 7 memakai `prisma.config.ts` untuk datasource CLI
- simpan `prisma.config.ts` di root repo dan arahkan ke `prisma/schema.prisma` + `prisma/migrations`
- sediakan `.env.example` sebagai baseline local dan Vercel environment mapping
- Prisma client generation harus masuk ke alur install atau build agar deployment Vercel konsisten
- sediakan `npm run env:check` dan `npm run env:check:deployment` untuk memvalidasi local fallback vs readiness deploy

## 16. Deployment And Database Options

### Hosting Baseline

- frontend dan backend dijalankan sebagai satu Next.js app di Vercel
- route handler yang memakai Prisma sebaiknya memakai Node.js runtime default
- preview deployment harus dianggap first-class karena Better Auth perlu host allowlist yang benar

### Recommended Database Strategy

Rekomendasi default untuk MVP adalah:

- ORM: Prisma
- database family: PostgreSQL-compatible
- keputusan provider hosting: ditunda sampai kebutuhan operasional lebih jelas

Alasan:

- Prisma punya panduan resmi Next.js + Vercel
- Prisma menjaga opsi provider tetap luas
- Better Auth secara resmi mendukung adapter Prisma
- PostgreSQL-compatible target paling aman untuk constraint, relation, dan history-heavy workload seperti Rythm

### Database Provider Options To Keep Open

- Prisma Postgres
- Neon
- Supabase Postgres sebagai database-only provider
- self-hosted atau managed PostgreSQL biasa
- CockroachDB hanya jika nanti benar-benar dibutuhkan, bukan default MVP

### Recommendation For Now

- standardisasi schema di Prisma dengan `provider = "postgresql"`
- hindari mengunci desain ke fitur vendor-specific terlalu awal
- hindari pindah ke SQLite atau MySQL bila target produksi kemungkinan besar tetap serverless Postgres
- lihat [docs/database_options.md](/c:/Projects/rhythm/docs/database_options.md) untuk comparison canonical antar provider yang masih dipertimbangkan

## 17. Open Product Decisions Already Resolved for MVP

Agar implementasi tidak mandek, keputusan berikut dianggap final untuk MVP:

- UI memakai bahasa Inggris
- default timezone logic memakai `Asia/Jakarta`
- category deletion diblokir jika masih dipakai quest
- main quest tidak memiliki streak
- dashboard memprioritaskan kecepatan check/uncheck, bukan analytics
- offline support hanya sebatas installability dan shell caching
- auth memakai Better Auth
- FE dan BE dideploy di Vercel sebagai satu app Next.js
- ORM default memakai Prisma

## 18. Delivery Checklist

MVP technical completion berarti:

- auth berjalan
- Better Auth route dan session handling berjalan
- category CRUD berjalan
- quest CRUD berjalan
- dashboard current-period berjalan
- completion check/uncheck berjalan
- streak tampil konsisten
- history dasar berjalan
- authorization server-side berjalan konsisten
- Prisma schema dan migrations berjalan
- app installable sebagai PWA
- app siap dideploy ke Vercel

## 19. Testing Baseline

- unit test root app dijalankan dengan `node:test` menggunakan `tsx` untuk file TypeScript
- simpan unit test pure domain logic di `tests/unit`
- prioritas coverage awal adalah helper `period`, helper `streak`, dan payload validator
- smoke test route-level boleh memakai in-memory DB stub + `sessionApi` seam agar flow kategori, quest, completion, dan history bisa diverifikasi tanpa database eksternal
- browser smoke test dijalankan dengan Playwright untuk auth layout responsive, root redirect, manifest/icon endpoint, dan service worker registration baseline
- browser smoke PWA juga harus memverifikasi offline navigation fallback tetap jatuh ke offline page, bukan mencoba cache API atau write flow
- browser smoke untuk halaman authenticated boleh memakai env-gated auth bypass (`RYTHM_E2E_AUTH_BYPASS=true`) plus mocked `/api/*` responses agar dashboard, quest form, sidebar, categories, dan history bisa diverifikasi tanpa database eksternal
- manual verification workflow tersedia lewat `npm run qa:layout` untuk menghasilkan screenshot desktop/mobile yang kemudian direview manusia
- smoke test end-to-end tetap boleh menyusul setelah flow auth dan data foundation stabil
