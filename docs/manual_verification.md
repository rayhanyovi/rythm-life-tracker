# Manual Verification

Dokumen ini menyimpan workflow verifikasi manual untuk layout desktop/mobile dan baseline PWA Rythm.

## Goal

Checklist ini dipakai saat perubahan UI cukup besar sehingga automated tests saja belum cukup.

Fokusnya:

- membaca apakah layout masih nyaman di desktop dan mobile
- memastikan app shell tidak overflow
- memastikan halaman utama tetap bisa dipahami cepat
- memastikan PWA fallback tetap masuk akal

## Screenshot Workflow

Jalankan:

```bash
npm run qa:layout
```

Script ini akan:

- menyalakan dev server lokal pada port terpisah
- mengaktifkan auth bypass khusus QA
- memakai mock API untuk halaman authenticated
- menyimpan screenshot ke `.artifacts/manual-layout-review/<timestamp>/`

Route yang di-capture:

- `sign-in`
- `dashboard`
- `quests`
- `categories`
- `history`

Device yang di-capture:

- Desktop Chrome
- Pixel 7

## Review Checklist

### Public Auth

- sign-in card tetap terbaca dan tidak terlalu padat di mobile
- forgot-password dan reset-password tetap jelas walau card lebih tinggi
- verification pending, verified success, dan expired verification state tetap mudah dipahami
- auth panel hanya muncul di desktop
- tidak ada horizontal overflow

### Dashboard

- heading, filter, metric card, list, dan detail panel masih terbaca jelas
- quick action utama tetap terasa dominan
- mobile tidak memotong checkbox, button, atau note area

### Quests

- filter/search tetap nyaman dipakai
- sheet create/edit tidak kepotong di mobile
- list row dan detail panel masih rapi di desktop

### Categories

- create input dan action button tidak bertabrakan
- reorder controls masih nyaman disentuh di mobile
- starter pack panel masih terbaca jelas

### History

- filter grid tidak pecah terlalu buruk di mobile
- detail panel tetap bisa dipakai tanpa scroll aneh
- note area tetap cukup lega

### PWA

- install prompt atau Add to Home Screen tersedia bila browser mendukung
- icon dan app name benar
- offline navigation jatuh ke `/offline`
- offline page menjelaskan keterbatasan dengan jujur

## Current Status

Yang sudah diverifikasi lewat automation:

- auth layout responsive
- authenticated shell responsive
- service worker registration
- manifest + icon endpoints
- Chromium mobile installability audit tanpa blocking errors
- offline fallback page

Yang masih tetap butuh human check:

- rasa visual akhir di perangkat mobile nyata
- satu check install nyata di browser mobile/device nyata sebelum launch
