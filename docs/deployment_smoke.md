# Deployment Smoke

Gunakan checklist ini setelah preview atau production URL tersedia.

## Precondition

- Environment variable di Vercel sudah terisi
- `BETTER_AUTH_SECRET` bukan default/empty
- `BETTER_AUTH_URL` sesuai URL environment yang diuji
- `DATABASE_URL` mengarah ke database yang valid

## Smoke Flow

1. Buka halaman `/sign-up`
2. Buat akun baru
3. Pastikan redirect masuk ke area app
4. Buka `/categories`
5. Buat satu category
6. Buka `/quests`
7. Buat satu quest `DAILY`
8. Buka `/dashboard`
9. Check quest tersebut untuk periode aktif
10. Tambahkan note pada completion aktif
11. Buka `/history`
12. Pastikan completion muncul dengan category, quest type, period key, dan note
13. Ubah note dari history
14. Hapus completion dari history
15. Pastikan completion hilang dari history dan dashboard kembali unchecked
16. Sign out
17. Pastikan protected route kembali redirect ke `/sign-in`

## PWA Smoke

1. Buka app di browser mobile atau devtools mobile emulation
2. Pastikan manifest dan icon terbaca
3. Pastikan prompt install atau Add to Home Screen tersedia bila browser mendukung
4. Install app
5. Buka app hasil install
6. Pastikan shell utama tetap tampil normal
7. Aktifkan airplane mode atau offline simulation
8. Buka route yang belum aktif menulis data
9. Pastikan app jatuh ke halaman offline fallback, bukan error browser kosong

## Notes

- Dokumen ini sengaja fokus ke smoke flow, bukan test automation
- Jika preview deploy gagal karena env atau host mismatch, perbaiki di `docs/vercel_deployment.md` dan `docs/environment.md`
- Browser smoke lokal yang sudah tersedia sekarang bisa dijalankan lewat `npm run test:e2e`
