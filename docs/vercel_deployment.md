# Vercel Deployment

Dokumen ini menjelaskan baseline deploy Rythm ke Vercel untuk preview dan production.

## Target Runtime

- Root app dideploy sebagai satu aplikasi Next.js fullstack di Vercel.
- Route handler yang menyentuh Prisma harus tetap berjalan di `Node.js runtime`.
- Saat ini seluruh route API utama sudah eksplisit memakai `export const runtime = "nodejs"`.

Route yang sudah dikunci ke Node.js:

- `app/api/auth/[...all]/route.ts`
- `app/api/bootstrap/default-categories/route.ts`
- `app/api/categories/route.ts`
- `app/api/categories/[id]/route.ts`
- `app/api/categories/reorder/route.ts`
- `app/api/completions/[id]/route.ts`
- `app/api/dashboard/route.ts`
- `app/api/history/route.ts`
- `app/api/quests/route.ts`
- `app/api/quests/[id]/route.ts`
- `app/api/quests/[id]/current-completion/route.ts`

## Required Environment Variables

Set di Vercel untuk preview dan production:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- `AUTH_EMAIL_FROM`
- `RESEND_API_KEY`

Optional:

- `DIRECT_URL`
- `NEXT_PUBLIC_APP_TIMEZONE`

Catatan:

- repo saat ini hanya memberi fallback secret untuk local build non-Vercel
- Vercel preview dan production harus selalu mengisi `BETTER_AUTH_SECRET` eksplisit

## Preview Environment Mapping

Preview deployment tetap perlu auth dan database yang valid.

Recommended:

- `BETTER_AUTH_SECRET`: satu secret yang valid untuk seluruh environment non-local
- `BETTER_AUTH_URL`: gunakan preview URL utama bila ingin preview auth flow end-to-end, atau gunakan production domain hanya jika flow host handling memang diinginkan seperti itu
- `DATABASE_URL`: pakai database preview/shared yang memang aman untuk testing
- `AUTH_EMAIL_FROM`: sender yang valid untuk verification dan reset email
- `RESEND_API_KEY`: API key Resend untuk preview/production auth email delivery
- `NEXT_PUBLIC_APP_TIMEZONE`: `Asia/Jakarta`

Catatan:

- Better Auth sudah diizinkan untuk `localhost:3000` dan `*.vercel.app`
- preview tetap tidak boleh memakai secret default

## Production Environment Mapping

Production harus memakai environment terpisah yang stabil:

- `BETTER_AUTH_SECRET`: secret production yang kuat
- `BETTER_AUTH_URL`: domain production final, misalnya `https://app.example.com`
- `DATABASE_URL`: database production PostgreSQL-compatible
- `AUTH_EMAIL_FROM`: sender production yang valid
- `RESEND_API_KEY`: API key Resend production
- `DIRECT_URL`: isi hanya jika provider database memang memisahkan pooled dan direct connection

## Install And Build Notes

- `npm` adalah package manager canonical
- `postinstall` sudah menjalankan `prisma generate`
- `npm run env:check:deployment` sekarang tersedia untuk memblokir deploy dengan env yang belum lengkap
- auth email delivery sekarang termasuk bagian deploy gate karena verification dan reset flow sudah live
- `prisma.config.ts` sekarang dikunci di root repo supaya Prisma CLI selalu membaca schema dan migration dari path canonical
- build verification saat ini memakai `npm run build`
- jika `BETTER_AUTH_SECRET` kosong, Better Auth akan memunculkan warning yang harus dianggap blocker sebelum deploy nyata
- migration production sebaiknya dijalankan lewat `npm run prisma:migrate:deploy`

## Current Deployment Posture

Yang sudah siap:

- Next.js App Router fullstack structure
- Better Auth route handler
- canonical env resolver di `lib/env.ts`
- Prisma client generation pada install flow
- Prisma CLI config di [prisma.config.ts](/c:/Projects/rhythm/prisma.config.ts)
- env template di [`.env.example`](/c:/Projects/rhythm/.env.example)
- deployment env checker di `npm run env:check:deployment`
- API routes Prisma di Node.js runtime
- manifest, icons, dan minimal service worker

Yang masih terbuka:

- provider database final
- smoke test terhadap preview URL
- validasi installability di perangkat mobile nyata

Database provider comparison canonical:

- [docs/database_options.md](/c:/Projects/rhythm/docs/database_options.md)
