# Environment Reference

Dokumen ini adalah quick reference untuk environment variable yang dipakai di repo `Rythm`.

Dokumen canonical yang lebih lengkap tetap ada di [docs/environment.md](/c:/Projects/rhythm/docs/environment.md).

## Minimal Local Setup

Kalau kamu ingin app jalan di local tanpa email provider sungguhan, baseline paling sederhana:

```env
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rythm?schema=public
NEXT_PUBLIC_APP_TIMEZONE=Asia/Jakarta
RYTHM_DEV_SKIP_EMAIL_VERIFICATION=true
```

Kalau app dijalankan di Docker container penuh, `DATABASE_URL` biasanya berubah menjadi:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/rythm?schema=public
```

## Required

### `BETTER_AUTH_SECRET`

Secret utama untuk Better Auth.

Dipakai untuk signing token dan mekanisme auth internal. Nilainya harus panjang, acak, dan tidak dibagikan.

Contoh:

```env
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
```

Catatan:

- wajib untuk preview dan production
- sebaiknya tetap diisi juga di local meski repo punya fallback local

### `BETTER_AUTH_URL`

Base URL aplikasi yang dipakai Better Auth.

Contoh:

```env
BETTER_AUTH_URL=http://localhost:3000
```

Catatan:

- untuk local biasanya `http://localhost:3000`
- untuk deploy harus diisi dengan domain asli aplikasi
- kalau port local berubah, nilai ini juga harus ikut berubah

### `DATABASE_URL`

Connection string database utama untuk Prisma dan runtime app.

Contoh local host:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rythm?schema=public
```

Contoh saat app jalan di Docker Compose:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/rythm?schema=public
```

Catatan:

- kalau Next.js jalan di host dan Postgres di Docker, pakai `localhost`
- kalau Next.js dan Postgres sama-sama jalan di Compose, pakai host service `db`

## Optional

### `DIRECT_URL`

Connection string direct ke database.

Biasanya dipakai kalau provider database memisahkan pooled connection dan direct connection. Saat ini repo belum memakainya secara aktif.

Contoh:

```env
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/rythm?schema=public
```

### `NEXT_PUBLIC_APP_TIMEZONE`

Timezone default aplikasi.

Contoh:

```env
NEXT_PUBLIC_APP_TIMEZONE=Asia/Jakarta
```

Catatan:

- default repo saat ini adalah `Asia/Jakarta`
- karena dia `NEXT_PUBLIC_*`, nilainya terekspos ke client

### `AUTH_EMAIL_FROM`

Alamat pengirim untuk email auth.

Dipakai untuk verification email dan reset password kalau delivery email nyata diaktifkan.

Contoh:

```env
AUTH_EMAIL_FROM=Rythm <auth@your-domain.com>
```

Catatan:

- harus dipasangkan dengan `RESEND_API_KEY`
- kalau tidak diisi, local dev akan fallback ke server log

### `RESEND_API_KEY`

API key untuk mengirim email auth lewat Resend.

Contoh:

```env
RESEND_API_KEY=re_xxx
```

Catatan:

- harus dipasangkan dengan `AUTH_EMAIL_FROM`
- kalau salah satu tidak ada, verification/reset email tidak dikirim ke inbox dan akan fallback ke log server

### `RYTHM_DEV_SKIP_EMAIL_VERIFICATION`

Bypass local-only untuk mematikan keharusan verifikasi email pada auth email/password.

Contoh:

```env
RYTHM_DEV_SKIP_EMAIL_VERIFICATION=true
```

Catatan:

- aman dipakai untuk local development
- jangan diaktifkan untuk preview atau production
- saat aktif, sign-up email/password bisa langsung membuat session tanpa buka link verifikasi

### `NEXT_PUBLIC_PWA_DEV_ENABLED`

Flag untuk menyalakan behavior PWA di development.

Contoh:

```env
NEXT_PUBLIC_PWA_DEV_ENABLED=true
```

Catatan:

- pakai hanya kalau sedang smoke test atau debug PWA
- biarkan kosong kalau tidak sedang butuh fitur itu

### `RYTHM_E2E_AUTH_BYPASS`

Flag khusus automated testing untuk bypass auth server-side pada e2e browser test.

Contoh:

```env
RYTHM_E2E_AUTH_BYPASS=true
```

Catatan:

- ini bukan bypass auth umum untuk development harian
- dipakai oleh flow e2e dan butuh header request khusus
- jangan diaktifkan di preview atau production

## Docker Compose Overrides

Variable berikut dipakai oleh `compose.yaml` untuk service Postgres lokal:

### `POSTGRES_DB`

Nama database default di container Postgres.

Contoh:

```env
POSTGRES_DB=rythm
```

### `POSTGRES_USER`

Username Postgres lokal.

Contoh:

```env
POSTGRES_USER=postgres
```

### `POSTGRES_PASSWORD`

Password Postgres lokal.

Contoh:

```env
POSTGRES_PASSWORD=postgres
```

## File Yang Biasanya Dipakai

- local host app: `.env.local` atau `.env`
- Docker Compose full app: `.env.docker`
- contoh baseline: [`.env.example`](/c:/Projects/rhythm/.env.example)
- contoh baseline Docker: [`.env.docker.example`](/c:/Projects/rhythm/.env.docker.example)

## Quick Checks

Setelah env diisi, command yang relevan:

- `npm run env:check`
- `npm run prisma:migrate:dev`
- `npm run dev`

Kalau mau validasi env untuk deploy:

- `npm run env:check:deployment`
