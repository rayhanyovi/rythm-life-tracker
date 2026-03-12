# Environment

Dokumen ini mencatat environment variable yang dipakai oleh root app Rythm saat ini.

Runtime code sekarang membaca env lewat [lib/env.ts](/c:/Projects/rhythm/lib/env.ts) agar fallback local, guard Vercel, dan default timezone tidak tersebar di banyak file.

## Required

### `BETTER_AUTH_SECRET`

Secret utama untuk Better Auth.

Catatan:

- wajib diisi pada environment nyata
- gunakan secret acak yang kuat
- wajib tersedia pada runtime production dan preview

### `BETTER_AUTH_URL`

Base URL utama untuk Better Auth.

Contoh:

- local: `http://localhost:3000`
- production: `https://your-domain.com`

Catatan:

- dipakai sebagai fallback URL saat host request tidak cocok dengan allowlist dinamis
- preview deployment Vercel tetap diizinkan lewat konfigurasi `allowedHosts`

### `DATABASE_URL`

Connection string utama untuk database PostgreSQL-compatible yang dipakai Prisma.

Contoh format:

```txt
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

## Optional

### `DIRECT_URL`

Connection string direct untuk provider Postgres serverless yang memisahkan pooled connection dan direct connection.

Gunakan hanya jika provider database memang membutuhkannya.

Catatan:

- belum dipakai oleh konfigurasi Prisma saat ini
- disimpan sebagai opsi terbuka jika provider database nanti memerlukan pooled URL dan direct URL terpisah

### `NEXT_PUBLIC_APP_TIMEZONE`

Timezone default aplikasi.

Nilai MVP saat ini:

```txt
Asia/Jakarta
```

### `AUTH_EMAIL_FROM`

Alamat sender opsional untuk email auth jika flow reset password dan verification ingin benar-benar mengirim email.

Contoh:

```txt
AUTH_EMAIL_FROM=Rythm <auth@your-domain.com>
```

### `RESEND_API_KEY`

API key opsional untuk delivery email auth via Resend.

Catatan:

- jika `AUTH_EMAIL_FROM` dan `RESEND_API_KEY` sama-sama tersedia, reset password dan verification email akan dikirim lewat Resend
- jika salah satu tidak tersedia, local dan preview fallback ke structured server log
- fallback log ini berguna untuk development, tetapi bukan posture yang layak untuk launch publik
- `npm run env:check:deployment` sekarang menganggap keduanya wajib karena verification dan password reset sudah menjadi bagian auth MVP

### `RYTHM_DEV_SKIP_EMAIL_VERIFICATION`

Flag opsional local-only untuk mematikan requirement email verification pada auth email/password saat development.

Contoh:

```txt
RYTHM_DEV_SKIP_EMAIL_VERIFICATION=true
```

Catatan:

- hanya aktif di local runtime non-Vercel
- saat aktif, sign-up email/password langsung membuat session dan masuk ke dashboard
- email verification otomatis pada sign-up dan sign-in juga dimatikan
- jangan aktifkan untuk preview atau production

### `NEXT_PUBLIC_PWA_DEV_ENABLED`

Flag opsional untuk menyalakan registrasi service worker di local development.

Gunakan hanya untuk smoke test atau debugging PWA lokal.

Contoh:

```txt
NEXT_PUBLIC_PWA_DEV_ENABLED=true
```

### `RYTHM_E2E_AUTH_BYPASS`

Flag opsional khusus local browser smoke untuk melewati auth server-side saat Playwright membuka halaman protected.

Gunakan hanya untuk automated testing lokal atau CI. Jangan dipakai sebagai konfigurasi runtime normal.

Contoh:

```txt
RYTHM_E2E_AUTH_BYPASS=true
```

Catatan:

- bypass ini hanya aktif jika env diset ke `true`
- request juga tetap harus mengirim header `x-rythm-e2e-user-id`
- `npm run test:e2e` sudah mengaktifkan flag ini otomatis
- `npm run test:e2e` juga memakai port lokal terpisah (`3100`), dist dir Next terpisah (`.next-e2e`), dan memaksa Playwright menjalankan fresh dev server agar tidak salah menempel ke server lokal lama tanpa bypass
- jangan menyalakan flag ini di Vercel preview atau production

## Local Development Baseline

Lihat [`.env.example`](/c:/Projects/rhythm/.env.example) untuk baseline local setup.

Jika app ikut dijalankan di Docker container, gunakan [.env.docker.example](/c:/Projects/rhythm/.env.docker.example) sebagai baseline karena `DATABASE_URL` di mode itu harus menunjuk ke host service `db`, bukan `localhost`.

Prisma CLI membaca `DATABASE_URL` lewat [prisma.config.ts](/c:/Projects/rhythm/prisma.config.ts), jadi local development tetap perlu `.env.local` atau `.env` yang valid saat menjalankan migrate terhadap database nyata.

Catatan tambahan:

- auth config saat ini memberi local-only fallback secret bila `BETTER_AUTH_SECRET` belum diisi dan app tidak berjalan di Vercel
- fallback ini hanya untuk menghindari default secret bawaan Better Auth saat build lokal
- tetap lebih baik isi `BETTER_AUTH_SECRET` secara eksplisit bahkan untuk local development
- `prisma.config.ts` juga memberi fallback localhost Postgres untuk menjaga `prisma generate` dan `prisma validate` tetap bisa dijalankan sebelum local env lengkap
- fallback Prisma ini bukan sinyal bahwa local database otomatis tersedia; command migrate tetap butuh database yang benar-benar hidup
- forgot password dan email verification saat ini punya fallback email delivery ke server log jika provider email belum diisi
- `NEXT_PUBLIC_PWA_DEV_ENABLED` sengaja optional dan default-nya nonaktif agar service worker tidak mengganggu development harian
- `RYTHM_E2E_AUTH_BYPASS` sengaja optional dan default-nya nonaktif agar auth bypass tidak pernah aktif di runtime normal
- local Docker stack canonical didokumentasikan di [docs/local_docker.md](/c:/Projects/rhythm/docs/local_docker.md)

## Compose-Only Local Overrides

Variable di bawah bukan dibaca runtime code secara langsung, tetapi dipakai oleh [compose.yaml](/c:/Projects/rhythm/compose.yaml) untuk local infrastructure:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

Nilai default-nya sudah aman untuk local development dan tersedia di [.env.docker.example](/c:/Projects/rhythm/.env.docker.example).

## Environment Check Commands

Script yang tersedia sekarang:

- `npm run env:check`
- `npm run env:check:deployment`

Perilaku:

- `env:check` aman untuk local development dan akan melaporkan fallback yang masih aktif
- `env:check:deployment` akan gagal jika `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, atau `DATABASE_URL` belum diisi eksplisit
- `env:check:deployment` juga akan gagal jika `AUTH_EMAIL_FROM` atau `RESEND_API_KEY` belum lengkap
- `env:check:deployment` juga akan gagal jika `RYTHM_DEV_SKIP_EMAIL_VERIFICATION=true`
- `env:check:deployment` juga menolak `BETTER_AUTH_URL` yang masih mengarah ke `localhost`

## Deployment Notes

- Vercel preview dan production harus punya `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, dan `DATABASE_URL`
- Better Auth dikonfigurasi untuk menerima `localhost:3000` dan `*.vercel.app`
- Better Auth juga menambahkan host dari `BETTER_AUTH_URL` ke allowlist lokal agar smoke test dengan port non-standar tetap aman
- flow reset password dan verification akan benar-benar mengirim email jika `AUTH_EMAIL_FROM` dan `RESEND_API_KEY` diisi
- Prisma tetap distandardisasi ke database family `postgresql`
- `npm install` akan menjalankan `prisma generate` lewat script `postinstall`
- jalankan `npm run env:check:deployment` sebelum menganggap preview atau production environment siap
- script Prisma yang tersedia sekarang:
  - `npm run prisma:validate`
  - `npm run prisma:migrate:dev`
  - `npm run prisma:migrate:deploy`
  - `npm run prisma:migrate:status`
