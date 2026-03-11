# Local Docker

Dokumen ini menjelaskan stack Docker lokal untuk Rythm. Setup ini hanya untuk development lokal, bukan artefak deploy production.

## File Yang Dipakai

- [Dockerfile](/c:/Projects/rhythm/Dockerfile)
- [compose.yaml](/c:/Projects/rhythm/compose.yaml)
- [.dockerignore](/c:/Projects/rhythm/.dockerignore)
- [.env.docker.example](/c:/Projects/rhythm/.env.docker.example)

## Full Stack Di Docker

Quickstart:

1. Jalankan `npm run docker:up`
2. Buka app di `http://localhost:3000`

Kalau ingin override env secara eksplisit:

1. Copy [.env.docker.example](/c:/Projects/rhythm/.env.docker.example) menjadi `.env.docker`
2. Ubah secret atau credential bila perlu
3. Jalankan `docker compose --env-file .env.docker up --build`

Catatan:

- app container akan menjalankan `npm run prisma:generate` lalu `npm run prisma:migrate:deploy` sebelum `next dev`
- source code di-bind mount ke container, sedangkan `node_modules` dan `.next` disimpan di named volume supaya hot reload lebih stabil di Docker Desktop
- Postgres lokal diekspos ke host di `localhost:5432`
- `npm run docker:up` tetap punya default local-safe values walau `.env.docker` belum dibuat

## Database Saja Di Docker

Kalau kamu ingin Next.js tetap jalan di host, cukup nyalakan database:

- jalankan `npm run docker:db`
- pakai [`.env.example`](/c:/Projects/rhythm/.env.example) atau `.env.local` dengan `DATABASE_URL` yang tetap menunjuk ke `localhost:5432`

## Command Yang Berguna

- `npm run docker:up`
- `npm run docker:db`
- `npm run docker:down`
- `docker compose logs -f app`
- `docker compose exec app npm run prisma:studio`
- `docker compose --env-file .env.docker up --build`

## Scope Dan Batasan

- Compose stack ini diposisikan sebagai local convenience layer, bukan deployment strategy
- Vercel tetap menjadi target deploy canonical
- provider database production tetap sengaja belum diputuskan; container Postgres lokal hanya untuk development
