# Database Options

Dokumen ini membandingkan opsi database hosting yang masih masuk akal untuk MVP Rythm. Tujuannya bukan memilih vendor secara prematur, tetapi memperjelas tradeoff supaya keputusan nanti tidak diambil dari nol.

## Constraints Saat Ini

- App canonical adalah fullstack Next.js di Vercel.
- Auth memakai Better Auth, bukan Supabase Auth.
- ORM canonical adalah Prisma.
- Family database tetap `PostgreSQL-compatible`.
- Target MVP lebih butuh stabilitas CRUD, migrations, dan deploy flow yang sederhana daripada fitur data platform yang luas.

## Shortlist

### 1. Prisma Postgres

Kapan cocok:

- kalau ingin setup paling lurus untuk `Next.js + Prisma + Vercel`
- kalau ingin environment preview dan production lebih otomatis dari dashboard Vercel
- kalau tim ingin workflow yang dekat dengan ekosistem Prisma

Kelebihan utama:

- integrasi Vercel resmi bisa mengisi `DATABASE_URL` otomatis
- preview dan production environment didukung langsung di flow integrasi Prisma Postgres via Vercel
- paling dekat dengan tooling Prisma yang sekarang sudah jadi baseline repo

Kekurangan utama:

- locking ke pengalaman Prisma lebih tinggi dibanding opsi Postgres generik
- kalau nanti tim ingin banyak workflow database di luar ekosistem Prisma, fleksibilitas operasional terasa lebih sempit dibanding Postgres provider yang lebih netral

Risiko untuk Rythm:

- rendah untuk MVP
- perlu validasi nyata nanti soal ergonomi backup, observability, dan pricing saat usage mulai stabil

### 2. Neon

Kapan cocok:

- kalau preview database per branch penting
- kalau tim ingin Postgres serverless yang tetap terasa cukup netral di luar ekosistem Prisma
- kalau ingin path CI/CD preview database yang kuat sejak awal

Kelebihan utama:

- preview branching dan branch cleanup adalah fitur inti
- Vercel integration resmi mendukung preview branches
- tetap berada di jalur Postgres yang nyaman untuk Prisma

Kekurangan utama:

- untuk Prisma CLI biasanya perlu disiplin membedakan pooled URL dan direct URL
- ada lebih banyak keputusan operasional dibanding Prisma Postgres jika hanya ingin jalur termudah

Risiko untuk Rythm:

- rendah sampai sedang
- bagus jika workflow preview environment benar-benar dipakai, berlebihan jika tim hanya butuh satu database kecil dulu

### 3. Supabase Postgres

Kapan cocok:

- kalau ingin Postgres managed dengan dashboard database yang matang
- kalau tim mungkin ingin memanfaatkan fitur Supabase lain di masa depan, meskipun bukan untuk MVP inti
- kalau tim nyaman mengelola direct connection dan pooler secara eksplisit

Kelebihan utama:

- Postgres penuh dengan backup, extensions, dashboard, dan ekosistem Supabase
- Prisma mendukung Supabase sebagai PostgreSQL-compatible provider
- tetap membuka pintu ke fitur Supabase lain jika nanti dibutuhkan

Kekurangan utama:

- repo ini sengaja tidak memakai Supabase Auth atau RLS sebagai baseline, jadi banyak keunggulan Supabase tidak langsung terpakai di MVP
- Prisma + Supabase butuh perhatian lebih untuk pooler, `DIRECT_URL`, dan drift bila menyentuh schema yang dikelola Supabase

Risiko untuk Rythm:

- sedang
- masuk akal jika tim memang melihat kemungkinan memakai Supabase ecosystem nanti, kurang efisien jika yang dibutuhkan hanya database saja

### 4. Managed PostgreSQL Biasa

Kapan cocok:

- kalau ingin vendor lock-in serendah mungkin
- kalau tim ingin kontrol operasional lebih besar
- kalau nanti ada kebutuhan compliance atau networking yang spesifik

Contoh bentuk:

- managed PostgreSQL umum
- self-hosted PostgreSQL yang dikelola tim sendiri

Kelebihan utama:

- paling netral terhadap vendor
- Prisma mendukung jalur ini secara langsung
- mudah dipahami secara arsitektur karena tidak ada layer produk tambahan

Kekurangan utama:

- preview environment, pooling, branching, dan DX biasanya harus diurus sendiri atau lewat tool terpisah
- effort operasional paling tinggi dibanding shortlist lain

Risiko untuk Rythm:

- sedang sampai tinggi untuk fase MVP kecil
- paling masuk akal jika nanti kebutuhan operasional dan compliance benar-benar mengharuskannya

## Comparison Ringkas

| Opsi | Cocok untuk MVP cepat | Preview DB workflow | Vendor lock-in | Kompleksitas operasional | Catatan utama |
| --- | --- | --- | --- | --- | --- |
| Prisma Postgres | Tinggi | Baik | Sedang | Rendah | Jalur paling lurus untuk Prisma + Vercel |
| Neon | Tinggi | Sangat baik | Sedang | Rendah-menengah | Kuat jika preview branching penting |
| Supabase Postgres | Menengah | Cukup | Sedang | Menengah | Baik bila mungkin pakai ekosistem Supabase nanti |
| Managed PostgreSQL biasa | Menengah | Lemah default | Rendah | Tinggi | Paling netral, tapi effort lebih besar |

## Recommendation For Rythm

Shortlist final untuk Rythm saat ini:

1. `Prisma Postgres`
2. `Neon`

Kenapa dua ini paling masuk akal:

- paling selaras dengan stack `Next.js + Prisma + Vercel`
- paling minim friksi untuk preview/production deployment
- tidak menambah kompleksitas auth atau policy model yang tidak dipakai oleh MVP

## Decision Rule

Pilih `Prisma Postgres` jika:

- tim ingin jalur setup paling cepat
- preview env ingin sesedikit mungkin diurus manual
- database dianggap bagian dari workflow Prisma/Vercel end-to-end

Pilih `Neon` jika:

- preview database per branch dianggap penting
- tim ingin branching database yang lebih eksplisit
- ingin tetap di Postgres serverless yang terasa lebih netral dari sisi provider

Tahan dulu keputusan ke `Supabase Postgres` atau `managed PostgreSQL biasa` kecuali ada alasan operasional nyata.

## Reference Basis

Dokumen ini dirangkum dari dokumentasi resmi berikut:

- Prisma PostgreSQL connector: https://docs.prisma.io/docs/orm/core-concepts/supported-databases/postgresql
- Prisma Postgres on Vercel: https://docs.prisma.io/docs/guides/postgres/vercel
- Prisma Postgres overview: https://www.prisma.io/postgres
- Neon Vercel overview: https://neon.com/docs/guides/vercel-overview
- Supabase database overview: https://supabase.com/docs/guides/database/overview
- Supabase Prisma troubleshooting: https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting
