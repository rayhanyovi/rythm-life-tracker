# Rythm To-Dos

Dokumen ini adalah tracker utama progress development Rythm. Semua task yang benar-benar mulai dikerjakan, selesai, dipecah, atau berubah prioritas harus diperbarui di sini.

Gunakan checklist berikut:

- `[x]` selesai
- `[ ]` belum selesai

## Snapshot Saat Ini

- [x] `docs/overview.md` dibuat sebagai ringkasan produk non-teknis
- [x] `docs/techplan.md` dibuat sebagai rencana implementasi teknis
- [x] `quest-companion` diaudit terhadap dokumen canonical saat ini
- [x] Batas implementasi dikunci ke root Next.js app
- [x] Keputusan auth diganti dari Supabase Auth ke Better Auth
- [x] Target deployment dikunci ke fullstack Next.js di Vercel
- [x] ORM default distandardisasi ke Prisma
- [x] Root app sudah selaras dengan scope MVP Rythm

## Hasil Audit Singkat

Temuan utama dari `quest-companion`:

- Layout dan flow dasarnya kuat dan layak dijadikan referensi: sidebar app shell, dashboard list density, detail panel, auth card, history filter, dan category management.
- Theme token dan branding saat ini belum cocok untuk Rythm. Layout boleh dipertahankan arahnya, tetapi style system perlu diganti.
- Prototype masih memakai stack `Vite + React Router + Lovable`, sedangkan project canonical sekarang harus dibangun di root `Next.js App Router`.
- Prototype membawa scope tambahan yang tidak masuk MVP Rythm: `projects`, `project_tasks`, `completion_mode`, `target_count`, `deadline`, dan completion `count`.
- Prototype masih campur istilah `Task`, `Quest`, dan brand `Quest2`. Semua copy dan route perlu dinormalisasi ke Rythm.
- Root app saat ini masih boilerplate Next.js default dan belum punya struktur produk, auth, data layer, atau PWA yang dibutuhkan.
- Dokumen lama yang mengarah ke Supabase Auth dan RLS sudah tidak lagi menjadi baseline implementasi.

## Prinsip Migrasi

- `quest-companion` dipakai sebagai referensi UI dan interaction pattern, bukan sebagai app yang dilanjutkan apa adanya.
- Implementasi real harus masuk ke root app.
- Layout umum boleh dibuat mirip, tetapi theme token, branding, dan copy harus diarahkan ulang ke Rythm.
- Scope MVP harus tetap mengikuti `docs/overview.md` dan `docs/techplan.md`.

## 1. Alignment Dokumen Dan Scope

- [x] Buat `docs/overview.md`
- [x] Buat `docs/techplan.md`
- [x] Audit `quest-companion` terhadap dokumen canonical
- [x] Buat `docs/to_dos.md` sebagai tracker utama
- [x] Selaraskan `docs/workflow_contract.md` dengan pembagian tanggung jawab `overview.md` dan `techplan.md`
- [ ] Pastikan setiap perubahan scope besar dicatat di dokumen canonical sebelum implementasi lanjut

## 2. Foundation Root App

- [x] Ganti halaman default root app dengan shell awal Rythm
- [x] Tambahkan struktur route group App Router untuk area auth dan app utama
- [x] Siapkan folder dasar root app untuk `components`, `lib`, `types`, dan `app/api`
- [x] Install dependency yang memang dibutuhkan root app untuk Better Auth, Prisma, form handling, validation, icons, dan UI primitives
- [x] Setup `shadcn/ui` di root app sebagai library komponen standar
- [x] Rapikan metadata root app agar memakai nama dan deskripsi Rythm
- [x] Tambahkan loading, empty state, dan error state dasar yang konsisten

## 3. Design System Dan UI Migration

- [x] Port app shell utama dari `quest-companion` ke root app
- [x] Buat folder `components/ui` untuk primitive `shadcn/ui` di root app
- [x] Port pola sidebar, top bar, list item, form shell, dialog, dan detail panel ke komponen root
- [x] Standardisasi form, dialog, sheet, select, checkbox, toast, dan alert lewat `shadcn/ui`
- [x] Ganti style token/theme saat ini dengan token baru yang lebih cocok untuk Rythm
- [x] Jadikan `app/globals.css` sebagai source of truth token warna, radius, shadow, dan font
- [x] Audit sisa style hardcoded dan pindahkan ke token atau utility berbasis token
- [x] Ganti tipografi default root app dengan tipografi produk yang lebih intentional
- [x] Hapus branding `Quest2` dari icon, label, title, dan manifest
- [x] Normalisasi semua copy UI ke istilah `Quest` dan brand `Rythm`
- [x] Kompakkan filter dashboard, quests, dan history dengan `Select` dan `Checkbox` berbasis token
- [x] Taruh `page intro`, `metric card`, `interactive list card`, dan `detail panel` shared di `components/app`
- [x] Rapikan titik overflow mobile pada `PageShell`, `SignOutButton`, dan sidebar account card
- [x] Pastikan dashboard, form, sidebar, dan history tetap nyaman di mobile dan desktop

## 4. Cleanup Scope Dari Prototype

- [x] Jangan port fitur `projects`
- [x] Jangan port fitur `project_tasks`
- [x] Jangan port `completion_mode`
- [x] Jangan port `target_count`
- [x] Jangan port `deadline` pada quest MVP
- [x] Jangan port completion `count`
- [x] Jangan port route atau copy berbasis `/tasks`; gunakan `/quests`
- [x] Hindari membawa dependency atau pola khusus `Lovable` yang tidak dibutuhkan di root app

## 5. Better Auth, Prisma, Dan Environment Setup

- [x] Setup Better Auth server config di root app
- [x] Setup Better Auth client helper di root app
- [x] Buat route handler `app/api/auth/[...all]/route.ts`
- [x] Siapkan session handling Better Auth untuk Next.js App Router
- [x] Setup Prisma di root app
- [x] Buat Prisma client singleton yang aman untuk development dan Vercel
- [x] Tambahkan environment variable yang dibutuhkan di root app
- [x] Konfigurasi Better Auth `allowedHosts` untuk `localhost:3000` dan `*.vercel.app`
- [x] Buat `docs/environment.md` saat runtime configuration mulai dipakai
- [x] Tentukan flow bootstrap kategori default setelah first login

## 6. Database Dan Security

- [x] Selesaikan core auth schema Better Auth di Prisma schema
- [x] Buat migration canonical untuk tabel `categories`
- [x] Buat migration canonical untuk tabel `quests`
- [x] Buat migration canonical untuk tabel `quest_completions`
- [x] Tambahkan trigger `updated_at` untuk `quests`
- [x] Tambahkan index yang dibutuhkan untuk query dashboard, history, dan management page
- [x] Pastikan authorization server-side menggantikan kebutuhan RLS
- [x] Pastikan ownership `category -> quest -> completion` tervalidasi dengan benar
- [x] Siapkan Prisma schema dan migration workflow untuk root app
- [x] Pastikan schema tetap berada di jalur `postgresql` agar provider database masih fleksibel

## 7. Domain Logic

- [x] Buat helper period tunggal untuk `DAILY`, `WEEKLY`, `MONTHLY`, dan `MAIN`
- [x] Pastikan period key dihitung konsisten dengan timezone `Asia/Jakarta`
- [x] Buat helper streak yang mengikuti aturan di `docs/techplan.md`
- [x] Buat mapper data dashboard yang mengelompokkan quest berdasarkan kategori
- [x] Buat validasi payload untuk category
- [x] Buat validasi payload untuk quest dan current completion
- [x] Buat validasi payload untuk history filter
- [x] Buat flow bootstrap kategori default yang idempotent

## 8. API Dan Server Boundaries

- [x] Implement `GET /api/dashboard`
- [x] Implement `GET /api/categories`
- [x] Implement `POST /api/categories`
- [x] Implement `PATCH /api/categories/:id`
- [x] Implement `DELETE /api/categories/:id`
- [x] Implement `POST /api/categories/reorder`
- [x] Implement `GET /api/quests`
- [x] Implement `POST /api/quests`
- [x] Implement `GET /api/quests/:id`
- [x] Implement `PATCH /api/quests/:id`
- [x] Implement `DELETE /api/quests/:id`
- [x] Implement `PUT /api/quests/:id/current-completion`
- [x] Implement `DELETE /api/quests/:id/current-completion`
- [x] Implement `PATCH /api/completions/:id`
- [x] Implement `GET /api/history`
- [x] Implement `POST /api/bootstrap/default-categories`

## 9. Authentication Flow

- [x] Implement halaman `sign-in`
- [x] Implement halaman `sign-up`
- [x] Tambahkan proteksi route untuk area app utama
- [x] Tambahkan redirect dari `/` ke `/dashboard` atau `/sign-in` sesuai status auth
- [x] Hubungkan auth flow ke Better Auth session di Next.js
- [x] Implement forgot password hanya jika memang masuk cut MVP
- [x] Putuskan apakah email verification wajib di MVP pertama atau tidak

## 10. Product Pages

- [x] Implement halaman dashboard
- [x] Dashboard menampilkan tanggal saat ini
- [x] Dashboard mendukung filter kategori
- [x] Dashboard mendukung toggle `show inactive`
- [x] Dashboard mendukung quick check/uncheck untuk periode aktif
- [x] Dashboard mendukung akses cepat untuk note completion
- [x] Implement halaman manage quests
- [x] Implement search dan filter di manage quests
- [x] Implement create quest form
- [x] Implement edit quest form
- [x] Implement deactivate quest flow
- [x] Implement delete quest flow
- [x] Implement halaman categories
- [x] Implement create category flow
- [x] Implement rename category flow
- [x] Implement delete category flow dengan constraint yang benar
- [x] Implement reorder category flow
- [x] Implement halaman history
- [x] History mendukung filter quest, category, dan type
- [x] History mendukung edit note completion
- [x] History mendukung remove completion

## 11. PWA Dan Branding Assets

- [x] Tambahkan manifest untuk Rythm di root app
- [x] Tambahkan app icons yang benar untuk Rythm
- [x] Tambahkan installability metadata
- [x] Tambahkan service worker atau strategi app shell caching yang sesuai untuk Next.js
- [x] Validasi bahwa app bisa di-install di mobile
- [x] Pastikan offline support tetap minimal dan tidak melebar ke sync kompleks

## 12. Deployment Readiness

- [x] Siapkan root app agar deployment-ready di Vercel
- [x] Pastikan route yang memakai Prisma tetap berjalan di Node.js runtime
- [x] Pastikan Prisma client generation masuk ke build/install flow
- [x] Tambahkan `prisma.config.ts` di root repo untuk Prisma CLI
- [x] Tambahkan `.env.example` sebagai baseline local dan deployment env
- [x] Tambahkan script Prisma untuk `validate`, `migrate deploy`, dan status check
- [x] Tambahkan canonical env resolver dan deployment env checker
- [x] Pastikan deployment env checker ikut memvalidasi auth email delivery saat verification dan reset flow aktif
- [x] Siapkan environment mapping untuk Vercel preview dan production
- [x] Tambahkan dokumentasi deployment saat arah deployment mulai konkret
- [x] Bandingkan opsi database hosting: Prisma Postgres, Neon, Supabase Postgres, dan PostgreSQL biasa
- [ ] Putuskan provider database setelah kebutuhan operasional lebih jelas, tanpa mengubah schema app

## 13. Quality, Test, Dan Verification

- [x] Setup test runner ringan untuk root app unit test
- [x] Tambahkan unit test untuk helper period
- [x] Tambahkan unit test untuk perhitungan streak
- [x] Tambahkan test untuk validasi payload penting
- [x] Tambahkan smoke test untuk alur auth -> create category -> create quest -> complete quest -> lihat history
- [x] Tambahkan browser smoke test untuk auth layout responsive dan entry point PWA
- [x] Tambahkan browser smoke test untuk authenticated app shell, dashboard, quest form, categories, dan history
- [x] Ganti test placeholder dari prototype dengan test yang relevan di root app
- [x] Tambahkan canonical verify script dan CI workflow untuk env check, Prisma validate, test, lint, build, dan browser smoke
- [ ] Jalankan `npm run lint` untuk setiap vertical slice yang selesai
- [x] Tambahkan verifikasi manual untuk mobile layout dan desktop layout

## 14. Documentation Dan Delivery Discipline

- [ ] Update `docs/overview.md` jika flow produk berubah
- [ ] Update `docs/techplan.md` jika schema, endpoint, atau boundary teknis berubah
- [ ] Update `docs/to_dos.md` setiap ada task selesai, dipecah, atau diubah prioritas
- [ ] Simpan implementasi hanya di root app, bukan di `quest-companion`
- [ ] Buat commit terpisah untuk task yang benar-benar selesai

## 15. Guardrails MVP

Task berikut jangan dikerjakan sebelum MVP inti selesai:

- [ ] analytics charts
- [ ] XP, levels, badges, atau gamification lain
- [ ] sub-quests
- [ ] social or sharing features
- [ ] team collaboration
- [ ] offline sync lanjutan
- [ ] native mobile app
