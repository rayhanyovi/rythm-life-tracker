# Environment

Dokumen ini mencatat environment variable yang dipakai oleh root app Rythm saat ini.

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

## Local Development Baseline

Lihat [`.env.example`](/c:/Projects/rhythm/.env.example) untuk baseline local setup.

Prisma CLI membaca `DATABASE_URL` lewat [prisma.config.ts](/c:/Projects/rhythm/prisma.config.ts), jadi local development tetap perlu `.env.local` atau `.env` yang valid saat menjalankan migrate terhadap database nyata.

## Deployment Notes

- Vercel preview dan production harus punya `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, dan `DATABASE_URL`
- Better Auth dikonfigurasi untuk menerima `localhost:3000` dan `*.vercel.app`
- Prisma tetap distandardisasi ke database family `postgresql`
- `npm install` akan menjalankan `prisma generate` lewat script `postinstall`
