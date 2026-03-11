# Rythm Overview

Dokumen ini merangkum visi produk, scope MVP, dan alur utama aplikasi Rythm dalam bahasa yang mudah dipahami oleh pembaca non-teknis.

## Ringkasan Produk

Rythm adalah aplikasi web multi-user berbentuk Progressive Web App (PWA) untuk membantu pengguna menjaga ritme hidup melalui sistem quest sederhana. Fokus utamanya adalah membantu pengguna menjalankan rutinitas berulang dan milestone pribadi dengan cara yang ringan, cepat, dan konsisten.

Rythm tidak ingin menjadi habit tracker yang penuh gamification. Produk ini diarahkan menjadi alat yang tenang, rapi, dan mudah dipakai setiap hari.

## Masalah yang Ingin Diselesaikan

Banyak orang ingin hidup lebih disiplin, tetapi gagal menjaga konsistensi karena:

- tidak punya sistem tracking yang jelas
- rutinitas terasa berantakan
- aplikasi habit tracker yang ada sering terlalu kompleks atau terlalu mirip game

Rythm menjawab masalah itu dengan checklist yang sederhana, berbasis periode, dan dikelompokkan dalam kategori kehidupan yang mudah dipahami.

## Siapa Pengguna Rythm

Target utama Rythm adalah individu yang:

- menyukai rutinitas dan struktur
- ingin sistem disiplin yang jelas
- ingin melacak aktivitas seperti ibadah, olahraga, belajar, pekerjaan, atau milestone pribadi

Pengguna awal untuk MVP adalah founder dan pasangan founder, sehingga ruang lingkup produk dibuat sesederhana mungkin agar cepat dipakai dan divalidasi.

## Akses Publik

Rythm juga memiliki landing page publik di `/` untuk menjelaskan nilai produk sebelum pengguna masuk ke aplikasi. Pengguna yang sudah login tetap langsung diarahkan ke dashboard agar alur harian tidak terganggu.

## Konsep Inti

### Quest

Quest adalah aktivitas yang ingin dijalankan pengguna. Setiap quest punya judul, kategori, tipe quest, dan deskripsi opsional.

Jenis quest:

- `Daily`: diulang setiap hari
- `Weekly`: diulang setiap minggu
- `Monthly`: diulang setiap bulan
- `Main Quest`: milestone satu kali, tidak berulang

### Category

Quest dikelompokkan ke dalam kategori agar hidup pengguna terasa lebih terstruktur. Kategori default mengikuti konsep Wheel of Life dan tetap bisa diubah oleh pengguna.

Contoh kategori awal:

- Spiritual
- Finance
- Career
- Health
- Personal Growth
- Relationship

### Completion

Completion terjadi saat pengguna mencentang quest. Completion tidak disimpan sebagai status permanen untuk quest berulang, tetapi disimpan per periode.

Artinya:

- quest harian punya completion terpisah setiap hari
- quest mingguan punya completion terpisah setiap minggu
- quest bulanan punya completion terpisah setiap bulan
- main quest hanya punya satu status completion

### Streak

Streak menunjukkan berapa banyak periode berturut-turut sebuah quest berhasil diselesaikan.

Contoh:

- jika quest harian selesai 3 hari berturut-turut, streak = 3
- jika ada satu hari terlewat, streak terputus
- main quest tidak memakai streak

## Scope MVP

Fitur yang termasuk dalam MVP:

- registrasi, login, dan logout
- email verification sebelum first sign-in
- forgot password dan reset password
- dashboard untuk melihat quest pada periode berjalan
- checklist cepat untuk menyelesaikan atau membatalkan quest
- manajemen quest: buat, edit, nonaktifkan, hapus
- manajemen kategori: buat, ubah nama, hapus, urutkan
- riwayat completion sederhana
- note opsional pada completion
- tampilan streak per quest
- aplikasi dapat di-install sebagai PWA

## Alur Pengguna Utama

### 1. Masuk ke aplikasi

Pengguna biasanya masuk dari landing page publik, lalu membuat akun, memverifikasi email, dan login dengan email serta password. Jika lupa password, pengguna dapat meminta reset link dan membuat password baru. Setelah berhasil masuk, pengguna langsung diarahkan ke dashboard.

### 2. Menyiapkan struktur hidup

Pengguna membuat kategori dan quest sesuai ritme hidupnya. Jika disediakan seed awal, pengguna bisa mulai dari kategori default lalu menyesuaikannya.

### 3. Menjalankan rutinitas harian

Di dashboard, pengguna melihat daftar quest untuk periode saat ini. Tindakan utama aplikasi adalah mencentang atau membatalkan centang quest dengan cepat.

Setiap item quest menampilkan:

- judul quest
- checkbox status untuk periode berjalan
- streak saat ini
- akses cepat untuk menambah atau mengubah note

### 4. Mengelola quest

Jika rutinitas berubah, pengguna dapat membuka halaman manajemen quest untuk:

- menambah quest baru
- mengedit quest yang sudah ada
- menonaktifkan quest tanpa menghilangkan riwayat
- menghapus quest bila memang tidak diperlukan lagi

### 5. Melihat riwayat

Pengguna dapat membuka halaman history untuk melihat daftar completion berdasarkan tanggal, meninjau note, dan membatalkan completion tertentu bila perlu.

## Halaman Utama

### Authentication

- sign up
- sign in
- forgot password
- reset password

### Public Landing Page

Halaman publik untuk menjelaskan positioning Rythm, cara kerja produk, dan mengarahkan pengunjung ke sign up atau sign in.

### Dashboard

Halaman utama untuk penggunaan sehari-hari. Fokus utamanya adalah pengalaman "check current period" secepat mungkin.

### Manage Quests

Halaman CRUD quest dengan pencarian dan filter.

### Manage Categories

Halaman untuk mengelola kategori dan urutannya.

### History

Halaman untuk meninjau completion yang pernah dibuat.

## Prinsip Produk

Rythm harus terasa:

- cepat
- minimal
- fokus
- tidak melelahkan secara visual
- membantu membangun struktur hidup, bukan sekadar memberi statistik

UI diarahkan lebih dekat ke alat produktivitas seperti Notion, Todoist, atau Linear daripada aplikasi game.

## Yang Tidak Masuk MVP

Hal-hal berikut tidak dibangun pada MVP:

- analytics charts
- XP, level, badge, atau gamification lain
- sub-quest
- fitur sosial atau sharing
- team collaboration
- offline sync yang kompleks

## Indikator Keberhasilan MVP

MVP dianggap berhasil jika pengguna dapat:

- membuat quest sendiri
- mencentang quest setiap periode dengan mudah
- melihat streak yang dihitung otomatis
- memahami dashboard sebagai overview rutinitas mereka

## Catatan Implementasi Produk

- Aplikasi menggunakan UI berbahasa Inggris.
- Fokus MVP adalah pengalaman mobile-friendly dan installable sebagai PWA.
- Produk tetap dibatasi pada use case personal habit and life rhythm tracking, bukan task management umum.
