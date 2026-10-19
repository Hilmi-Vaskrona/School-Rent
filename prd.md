# SchoolRent

## Product Requirements Document

> **Sistem Peminjaman Barang & Fasilitas Sekolah**

------------------------------------------------------------------------

# 1. Informasi Proyek

  ---------------------------------------------------------------------
  Item                        Detail
  --------------------------- -----------------------------------------
  Nama Project                SchoolRent

  Jenis                       Web Application

  Tema                        Sistem Peminjaman Barang & Fasilitas
                              Sekolah

  Frontend                    Next.js

  Backend                     NestJS

  Deployment                  HostData.id

  Target Pengguna             Siswa, Petugas, Admin

  Jumlah Anggota              3 orang

  Minimum Fitur Utama         10 fitur

  Fitur Utama yang            **12 fitur**
  Direncanakan                
  ---------------------------------------------------------------------

> **Catatan:** Login, Register, dan Logout merupakan fitur pendukung
> sistem dan **tidak dihitung sebagai fitur utama**.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 2. Latar Belakang

Sekolah memiliki berbagai barang dan fasilitas yang dapat digunakan oleh
siswa untuk kegiatan belajar, organisasi, ekstrakurikuler, maupun
kegiatan sekolah lainnya.

Contoh barang yang dapat dipinjam:

-   Proyektor
-   Laptop
-   Kamera
-   Tripod
-   Speaker
-   Mikrofon
-   Kabel HDMI
-   Alat olahraga
-   Peralatan kelas
-   Peralatan acara

Pada proses manual, pencatatan peminjaman dapat menimbulkan beberapa
masalah, seperti:

-   Siswa tidak mengetahui barang yang sedang tersedia.
-   Petugas kesulitan mencatat peminjaman.
-   Riwayat peminjaman sulit dicari.
-   Pengembalian barang sulit dipantau.
-   Barang yang terlambat dikembalikan sulit diketahui.
-   Perhitungan denda dilakukan secara manual.
-   Data barang dan stok tidak terorganisir.
-   Pembuatan laporan membutuhkan waktu.

SchoolRent dibuat untuk mendigitalisasi proses tersebut sehingga
pengelolaan peminjaman barang sekolah menjadi lebih terstruktur.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 3. Deskripsi Produk

**SchoolRent** adalah aplikasi web yang digunakan untuk mengelola proses
peminjaman barang dan fasilitas sekolah.

Siswa dapat:

-   Mencari barang.
-   Melihat ketersediaan barang.
-   Mengajukan peminjaman.
-   Melihat status peminjaman.
-   Membatalkan pengajuan.
-   Melihat riwayat peminjaman.
-   Melihat denda.

Petugas bertanggung jawab terhadap proses operasional seperti:

-   Mengelola barang.
-   Mengelola kategori.
-   Memproses pengajuan.
-   Menyetujui atau menolak peminjaman.
-   Memproses pengembalian.
-   Mengelola denda.

Admin bertanggung jawab terhadap:

-   Pengelolaan pengguna.
-   Pengelolaan petugas.
-   Data sistem.
-   Laporan.
-   Statistik.
-   Konfigurasi sistem.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 4. Tujuan Produk

SchoolRent memiliki tujuan:

1.  Mendigitalisasi proses peminjaman barang sekolah.
2.  Memudahkan siswa mencari barang yang tersedia.
3.  Memudahkan siswa melakukan pengajuan peminjaman.
4.  Membantu petugas mengelola peminjaman.
5.  Membantu petugas mengelola pengembalian.
6.  Mengurangi kesalahan pencatatan manual.
7.  Menyediakan perhitungan keterlambatan dan denda.
8.  Menyimpan riwayat peminjaman.
9.  Membantu admin mengelola data pengguna.
10. Menyediakan laporan dan statistik peminjaman.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 5. Target Pengguna

SchoolRent memiliki tiga role utama.

## 5.1 Siswa

Siswa merupakan pengguna yang menggunakan sistem untuk mencari dan
meminjam barang.

Siswa dapat:

-   Melihat barang.
-   Mencari barang.
-   Filter barang.
-   Melihat detail barang.
-   Mengajukan peminjaman.
-   Melihat status peminjaman.
-   Membatalkan pengajuan.
-   Melihat riwayat.
-   Melihat denda.
-   Mengelola profil.

------------------------------------------------------------------------

## 5.2 Petugas

Petugas bertanggung jawab mengelola aktivitas peminjaman.

Petugas dapat:

-   Melihat dashboard.
-   Mengelola barang.
-   Mengelola kategori.
-   Melihat pengajuan.
-   Menyetujui peminjaman.
-   Menolak peminjaman.
-   Memproses pengembalian.
-   Mengelola denda.
-   Melihat laporan.
-   Melihat data siswa.

------------------------------------------------------------------------

## 5.3 Admin

Admin bertanggung jawab terhadap administrasi sistem.

Admin dapat:

-   Melihat dashboard.
-   Mengelola user.
-   Mengelola petugas.
-   Mengelola barang.
-   Mengelola kategori.
-   Mengelola peminjaman.
-   Mengelola denda.
-   Melihat laporan.
-   Melihat statistik.
-   Mengatur konfigurasi sistem.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 6. Fitur Utama

SchoolRent memiliki **12 fitur utama**.

Login, Register, dan Logout **tidak termasuk** ke dalam 12 fitur utama.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 7. Fitur 1 --- Manajemen Barang

Petugas dan admin dapat mengelola data barang.

### Kemampuan:

-   Menambah barang.
-   Melihat barang.
-   Melihat detail barang.
-   Mengedit barang.
-   Menghapus barang.
-   Mengatur stok.
-   Mengatur kondisi.
-   Mengatur status.

### Informasi barang:

-   Nama.
-   Kategori.
-   Deskripsi.
-   Foto.
-   Stok.
-   Kondisi.
-   Status.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 8. Fitur 2 --- Manajemen Kategori

Petugas dan admin dapat mengelola kategori barang.

Contoh kategori:

-   Elektronik.
-   Multimedia.
-   Alat Olahraga.
-   Peralatan Kelas.
-   Peralatan Acara.
-   Lainnya.

### Kemampuan:

-   Tambah kategori.
-   Edit kategori.
-   Hapus kategori.
-   Melihat kategori.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 9. Fitur 3 --- Pencarian Barang

Siswa dapat mencari barang berdasarkan nama atau informasi yang relevan.

Contoh:

``` text
Input:
"proyektor"

Output:
- Proyektor Epson
- Proyektor BenQ
- Proyektor Aula
```

Search harus memberikan hasil yang relevan dan memiliki empty state jika
tidak ditemukan.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 10. Fitur 4 --- Filter Barang

Siswa dapat memfilter barang berdasarkan:

-   Kategori.
-   Kondisi.
-   Status.
-   Ketersediaan.

Contoh:

``` text
Kategori:
[ Multimedia ]

Status:
[ Tersedia ]
```

Sistem kemudian menampilkan barang yang sesuai.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 11. Fitur 5 --- Pengajuan Peminjaman

Siswa dapat membuat pengajuan peminjaman.

### Form:

-   Barang.
-   Jumlah.
-   Tanggal peminjaman.
-   Tanggal jatuh tempo.
-   Keperluan.
-   Catatan.

### Validasi:

-   User harus login.
-   Barang harus tersedia.
-   Jumlah tidak boleh melebihi stok.
-   Tanggal harus valid.
-   Data wajib harus diisi.

Setelah dikirim:

``` text
PENDING
```

------------------------------------------------------------------------

------------------------------------------------------------------------

# 12. Fitur 6 --- Persetujuan / Penolakan Peminjaman

Petugas dapat memproses pengajuan.

Status awal:

``` text
PENDING
```

Petugas dapat mengubah menjadi:

``` text
PENDING
   │
   ├── APPROVED
   │
   └── REJECTED
```

Petugas dapat memberikan alasan ketika menolak pengajuan.

Jika disetujui, peminjaman dapat dilanjutkan ke proses peminjaman
barang.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 13. Fitur 7 --- Pembatalan Peminjaman

Siswa dapat membatalkan pengajuan selama masih memenuhi aturan
pembatalan.

Contoh:

``` text
PENDING
   ↓
CANCELLED
```

Peminjaman yang sudah selesai tidak dapat dibatalkan.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 14. Fitur 8 --- Pengembalian Barang

Petugas memproses barang yang dikembalikan.

Proses:

``` text
BORROWED
    ↓
Barang dikembalikan
    ↓
Petugas melakukan pemeriksaan
    ↓
RETURNED
```

Petugas dapat mencatat:

-   Tanggal pengembalian.
-   Kondisi barang.
-   Catatan.
-   Kerusakan jika ada.

Setelah berhasil:

-   Stok diperbarui.
-   Status peminjaman diperbarui.
-   Sistem memeriksa keterlambatan.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 15. Fitur 9 --- Perhitungan Denda

Sistem menghitung denda apabila barang terlambat dikembalikan.

Contoh:

``` text
Tanggal jatuh tempo : 10 Oktober
Tanggal kembali     : 13 Oktober

Terlambat            : 3 hari
Denda per hari       : Rp5.000

Total denda:
3 × Rp5.000
= Rp15.000
```

Nominal denda tidak boleh hanya ditulis langsung di frontend.

Nilai denda sebaiknya disimpan sebagai konfigurasi sistem sehingga dapat
diubah sesuai kebijakan sekolah.

Status denda:

``` text
UNPAID
PAID
WAIVED
```

------------------------------------------------------------------------

------------------------------------------------------------------------

# 16. Fitur 10 --- Riwayat Peminjaman

Siswa dapat melihat seluruh riwayat peminjaman miliknya.

Informasi:

-   Barang.
-   Jumlah.
-   Tanggal peminjaman.
-   Tanggal jatuh tempo.
-   Tanggal pengembalian.
-   Status.
-   Denda.
-   Keperluan.

Petugas dan admin dapat melihat riwayat sesuai hak akses mereka.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 17. Fitur 11 --- Manajemen Pengguna

Admin dapat mengelola pengguna sistem.

Data pengguna:

-   Nama.
-   Email.
-   Role.
-   Kelas.
-   Jurusan.
-   Nomor HP.
-   Status akun.

Admin dapat:

-   Melihat pengguna.
-   Mengedit pengguna.
-   Mengaktifkan pengguna.
-   Menonaktifkan pengguna.
-   Mengubah role sesuai kewenangan.

User tidak diperbolehkan mengubah role dirinya sendiri.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 18. Fitur 12 --- Laporan & Statistik

Petugas dan admin dapat melihat data statistik dan laporan.

### Statistik:

-   Total barang.
-   Barang tersedia.
-   Barang sedang dipinjam.
-   Total peminjaman.
-   Peminjaman aktif.
-   Peminjaman selesai.
-   Peminjaman terlambat.
-   Total denda.

### Laporan:

-   Peminjaman per periode.
-   Pengembalian per periode.
-   Barang paling sering dipinjam.
-   Peminjaman terlambat.
-   Data denda.

### Filter:

-   Hari.
-   Minggu.
-   Bulan.
-   Tahun.
-   Kategori.
-   Status.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 19. Fitur Pendukung

Fitur berikut tidak dihitung sebagai 12 fitur utama, tetapi dibutuhkan
agar aplikasi dapat digunakan.

## Authentication

Fitur:

-   Register.
-   Login.
-   Logout.
-   Session/token management.
-   Password management.

------------------------------------------------------------------------

## Dashboard

Dashboard menampilkan ringkasan informasi sesuai role.

Contoh:

### Siswa

-   Peminjaman aktif.
-   Peminjaman pending.
-   Denda.

### Petugas

-   Pengajuan baru.
-   Peminjaman aktif.
-   Pengembalian.
-   Peminjaman terlambat.

### Admin

-   Total user.
-   Total barang.
-   Total peminjaman.
-   Statistik sistem.

------------------------------------------------------------------------

## Profil

User dapat:

-   Melihat profil.
-   Mengubah informasi yang diperbolehkan.
-   Mengubah foto profil jika tersedia.

------------------------------------------------------------------------

## Notification

Sistem dapat memberikan informasi ketika terjadi aktivitas penting.

Contoh:

-   Pengajuan berhasil.
-   Peminjaman disetujui.
-   Peminjaman ditolak.
-   Barang harus dikembalikan.
-   Peminjaman terlambat.
-   Denda dibuat.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 20. Status Sistem

## Status Barang

``` text
AVAILABLE
BORROWED
MAINTENANCE
INACTIVE
```

### AVAILABLE

Barang tersedia untuk dipinjam.

### BORROWED

Barang sedang dipinjam.

### MAINTENANCE

Barang sedang diperbaiki atau tidak dapat digunakan.

### INACTIVE

Barang tidak digunakan dalam sistem.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 21. Status Peminjaman

``` text
PENDING
APPROVED
REJECTED
BORROWED
RETURNED
CANCELLED
OVERDUE
```

### PENDING

Menunggu persetujuan.

### APPROVED

Disetujui petugas.

### REJECTED

Ditolak petugas.

### BORROWED

Barang sedang dipinjam.

### RETURNED

Barang sudah dikembalikan.

### CANCELLED

Pengajuan dibatalkan.

### OVERDUE

Peminjaman melewati tanggal jatuh tempo.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 22. Business Rules

Aturan bisnis utama:

1.  User harus login untuk menggunakan fitur peminjaman.
2.  User hanya dapat membuat peminjaman untuk dirinya sendiri.
3.  Barang harus tersedia untuk dapat dipinjam.
4.  Jumlah yang dipinjam tidak boleh melebihi stok.
5.  Pengajuan harus melalui proses persetujuan.
6.  Hanya petugas/admin yang dapat menyetujui pengajuan.
7.  Siswa tidak dapat mengubah status peminjaman secara manual.
8.  Pengembalian diproses oleh petugas.
9.  Sistem menghitung keterlambatan berdasarkan tanggal jatuh tempo.
10. Sistem menghitung denda berdasarkan konfigurasi.
11. Stok diperbarui ketika terjadi peminjaman.
12. Stok dikembalikan ketika barang dikembalikan.
13. User tidak dapat mengakses data yang bukan haknya.
14. User tidak dapat mengubah role dirinya sendiri.
15. Barang dalam status `MAINTENANCE` tidak dapat dipinjam.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 23. Arsitektur Sistem

SchoolRent dibagi menjadi dua bagian utama yang saling terhubung:

``` text
Pengguna
   │
   ▼
Frontend — Next.js
   │ HTTP / REST API
   ▼
Backend — NestJS
   │
   ├── Validasi dan hak akses
   ├── Aturan bisnis peminjaman
   ├── Pengelolaan data barang dan pengguna
   ├── Pengembalian dan perhitungan denda
   ├── Notifikasi, dashboard, laporan
   └── Pengelolaan data dan berkas aplikasi
```

Frontend bertanggung jawab atas tampilan, navigasi, formulir, dan
interaksi pengguna. Backend menjadi pusat validasi, hak akses,
pengolahan data, dan aturan bisnis. Detail layanan infrastruktur dan
konfigurasi implementasi tidak termasuk dalam PRD ini.

# 24. Frontend

Frontend menggunakan Next.js untuk membangun antarmuka dan mengonsumsi
REST API dari backend. Frontend menangani routing, layout, formulir,
tampilan berdasarkan role, validasi dasar untuk kenyamanan pengguna,
loading state, error state, empty state, dan feedback setelah aksi.

Frontend tidak menentukan hak akses final dan tidak menjalankan aturan
bisnis kritis secara mandiri.

# 25. Struktur Halaman Frontend

Struktur awal:

``` text
/
├── login
├── register
│
├── dashboard
│
├── items
│   └── [id]
│
├── loans
│   ├── create
│   └── [id]
│
├── history
├── fines
├── profile
│
└── admin
    ├── users
    ├── staff
    ├── items
    ├── categories
    ├── loans
    ├── returns
    ├── fines
    └── reports
```

Struktur dapat disesuaikan selama development tanpa mengubah requirement
utama.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 26. Frontend Responsibilities

Developer Frontend bertanggung jawab terhadap:

-   Setup Next.js.
-   UI/UX.
-   Routing.
-   Layout.
-   Responsive design.
-   Form.
-   Client-side validation.
-   State management.
-   Data fetching.
-   Authentication state.
-   Role-based UI.
-   Loading state.
-   Error state.
-   Empty state.
-   Integrasi REST API NestJS.
-   Menampilkan data dari backend.
-   Handling response API.

Frontend **tidak melakukan akses langsung ke database untuk business
logic utama**.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 27. Backend

Backend menggunakan NestJS sebagai REST API untuk melayani frontend dan
menjalankan aturan bisnis SchoolRent.

Modul utama:

``` text
Backend
├── Auth dan sesi pengguna
├── Users dan Profile
├── Dashboard
├── Categories
├── Items
├── Loans
├── Returns
├── Fines
├── Notifications
└── Reports
```

Modul dapat dipecah atau digabung selama tanggung jawabnya jelas dan
semua kebutuhan fitur terpenuhi.

# 28. Backend Responsibilities

Backend bertanggung jawab terhadap:

-   Menyediakan REST API yang dipakai frontend.
-   Memvalidasi input dan memastikan data sesuai aturan bisnis.
-   Memeriksa role dan kepemilikan data pada setiap operasi yang
    dilindungi.
-   Mengelola data pengguna, profil, barang, dan kategori.
-   Menjalankan alur pengajuan, persetujuan, penolakan, pembatalan, dan
    penyerahan barang.
-   Menjaga konsistensi stok dan status peminjaman.
-   Memproses pengembalian dan kondisi barang.
-   Menghitung keterlambatan dan denda.
-   Menyediakan riwayat, dashboard, notifikasi, laporan, dan statistik.
-   Mengelola foto barang/profil sesuai kewenangan.
-   Mengembalikan respons dan pesan kesalahan yang konsisten.
-   Menyediakan dokumentasi kontrak API untuk frontend.

Frontend tidak boleh menjadi sumber kebenaran untuk role, identitas
peminjam, status peminjaman, stok, atau nominal denda.

# 33. API Structure

Struktur endpoint awal:

``` text
/api/auth
/api/users
/api/categories
/api/items
/api/loans
/api/returns
/api/fines
/api/reports
/api/notifications
```

Contoh endpoint:

``` text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/items
GET    /api/items/:id
POST   /api/items
PATCH  /api/items/:id
DELETE /api/items/:id

GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id

POST   /api/loans
GET    /api/loans
GET    /api/loans/:id
PATCH  /api/loans/:id/approve
PATCH  /api/loans/:id/reject
PATCH  /api/loans/:id/cancel

POST   /api/returns
GET    /api/returns

GET    /api/fines
PATCH  /api/fines/:id/pay

GET    /api/reports
```

Endpoint final dapat berubah sesuai implementasi backend.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 34. Validation

Validasi dilakukan pada:

-   Frontend.
-   Backend.
-   Database jika diperlukan.

Frontend validation bertujuan memberikan feedback cepat kepada user.

Backend validation bertujuan menjaga integritas dan keamanan data.

Contoh:

``` text
Next.js Validation
        ↓
NestJS Validation
        ↓
Business Logic
        ↓

NestJS dapat menggunakan validation pipe dan DTO untuk memastikan data
request sesuai format.

------------------------------------------------------------------------

---

# 35. Error Handling

Backend harus memberikan response error yang jelas.

Contoh:

``` json
{
  "statusCode": 400,
  "message": "Stok tidak mencukupi"
}
```

Frontend kemudian menampilkan pesan yang mudah dipahami user.

Contoh:

``` text
Stok barang tidak mencukupi.
```

Error tidak boleh hanya muncul di browser console.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 36. Loading State

Setiap proses asynchronous harus memiliki loading state.

Contoh:

``` text
Loading barang...
Mengirim pengajuan...
Memproses pengembalian...
Menyimpan data...
```

Skeleton UI dapat digunakan jika diperlukan.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 37. Empty State

Jika tidak terdapat data, tampilkan informasi yang jelas.

Contoh:

``` text
Belum ada riwayat peminjaman.
```

``` text
Barang tidak ditemukan.
```

``` text
Belum ada pengajuan peminjaman.
```

------------------------------------------------------------------------

------------------------------------------------------------------------

# 39. Data Utama

Struktur database final akan dibahas dalam dokumen **ERD.md** terpisah.

Secara konseptual sistem membutuhkan:

-   User/Profile.
-   Category.
-   Item.
-   Loan.
-   Loan Detail.
-   Return.
-   Fine.
-   Notification.
-   Activity/Log jika diperlukan.
-   System Settings.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 40. Responsive Design

Website harus dapat digunakan pada:

-   Desktop.
-   Laptop.
-   Tablet.
-   Mobile.

Prioritas utama:

1.  Desktop.
2.  Laptop.
3.  Mobile.

Namun halaman siswa harus tetap nyaman digunakan melalui perangkat
mobile.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 41. Pembagian Tugas Tim

Project dikerjakan oleh **3 orang**.

Pembagian utama:

``` text
Anggota 1
Frontend
   ↓
Next.js

Anggota 2
Backend
   ↓
NestJS + REST API dan business logic

Anggota 3
Deployment & Integration
   ↓
HostData.id + Integrasi
```

Testing dilakukan oleh seluruh anggota sesuai bagian masing-masing.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 42. Anggota 1 --- Frontend Developer

## Fokus

**Next.js**

### Tugas

-   Membuat dan mengembangkan halaman frontend sesuai kebutuhan produk.
-   Struktur frontend.
-   UI/UX.
-   Landing page.
-   Login/register UI.
-   Dashboard.
-   Manajemen barang UI.
-   Kategori UI.
-   Search.
-   Filter.
-   Detail barang.
-   Form peminjaman.
-   Status peminjaman.
-   Pembatalan.
-   Pengembalian UI.
-   Denda UI.
-   Riwayat.
-   User management UI.
-   Laporan.
-   Responsive design.
-   Integrasi REST API NestJS.
-   Handling response API.
-   Loading state.
-   Error state.
-   Empty state.

### Output

Frontend SchoolRent yang lengkap dan terhubung dengan API NestJS.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 43. Anggota 2 --- Backend Developer

## Fokus

**NestJS + REST API dan business logic**

### Tugas

-   Mengembangkan modul backend sesuai kebutuhan produk.
-   Setup struktur module.
-   Setup API.
-   Authentication.
-   Authorization.
-   Pengelolaan data aplikasi.
-   data aplikasi.
-   Relationship.
-   CRUD.
-   Validation.
-   Business logic.
-   Loan system.
-   Approval system.
-   Return system.
-   Fine system.
-   Stock management.
-   User management.
-   Report query.
-   Security.
-   API documentation.
-   Pengelolaan berkas gambar sesuai kebutuhan fitur.

### Output

Backend SchoolRent berupa REST API NestJS yang menjalankan validasi, hak
akses, dan business logic aplikasi.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 44. Anggota 3 --- Integrasi & Deployment

## Fokus

**Integrasi frontend-backend dan kesiapan aplikasi**

### Tugas Integrasi

-   Menjaga kesesuaian kontrak API dan kebutuhan frontend.
-   Menguji alur utama dari frontend hingga backend.
-   Memastikan respons dan pesan kesalahan dapat ditangani frontend.
-   Membantu debugging masalah yang melibatkan lebih dari satu bagian.
-   Memastikan fitur utama terintegrasi sebelum rilis.

### Tugas Deployment

-   Mengatur proses deployment ke HostData.id setelah aplikasi siap.
-   Memastikan frontend dan backend dapat saling berkomunikasi di
    environment tujuan.
-   Melakukan smoke test setelah deployment.
-   Mencatat hasil pengujian dan kendala yang ditemukan.

### Output

SchoolRent yang terintegrasi, dapat diakses pada environment tujuan, dan
telah melalui pengujian akhir.

# 45. Pembagian Testing

Testing tidak hanya dilakukan oleh Anggota 3.

### Anggota 1

Bertanggung jawab melakukan testing:

-   UI.
-   Responsive.
-   Form.
-   Frontend validation.
-   API response pada frontend.
-   Loading.
-   Error.
-   Empty state.

### Anggota 2

Bertanggung jawab melakukan testing:

-   API.
-   Database.
-   Authentication.
-   Authorization.
-   Validation.
-   Business logic.
-   Query.
-   Security.

### Anggota 3

Bertanggung jawab melakukan testing:

-   Integration.
-   Production environment.
-   API connection.
-   Deployment.
-   Build.
-   konfigurasi environment.
-   End-to-end flow.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 62. Use Case & ERD

Use Case Diagram dan ERD belum dibuat dalam dokumen PRD ini. Keduanya
akan disusun setelah kebutuhan fitur dan alur bisnis disepakati.

Dokumen lanjutan:

-   `USECASE.md` --- aktor, use case, dan alur interaksi.
-   `ERD.md` --- rancangan entitas serta hubungan data.

PRD ini hanya memuat kebutuhan informasi secara konseptual, bukan
rancangan database final.

# 64. Scope yang Tidak Termasuk

Fitur berikut tidak termasuk dalam scope utama versi pertama:

-   Sistem pembayaran online.
-   Marketplace publik.
-   Chat antar pengguna.
-   Integrasi WhatsApp.
-   Integrasi payment gateway.
-   Sistem multi-sekolah.
-   Mobile application native.
-   AI recommendation.
-   Integrasi hardware/IoT.

Fitur tambahan hanya dapat ditambahkan jika fitur utama sudah selesai.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 65. Success Criteria

SchoolRent dianggap berhasil apabila:

## Core

-   [ ] Siswa dapat melihat barang.
-   [ ] Siswa dapat mencari barang.
-   [ ] Siswa dapat melakukan filter.
-   [ ] Siswa dapat mengajukan peminjaman.
-   [ ] Petugas dapat menyetujui/menolak.
-   [ ] Siswa dapat membatalkan pengajuan.
-   [ ] Petugas dapat memproses pengembalian.
-   [ ] Sistem dapat menghitung keterlambatan.
-   [ ] Sistem dapat menghitung denda.
-   [ ] Siswa dapat melihat riwayat.
-   [ ] Admin dapat mengelola pengguna.
-   [ ] Petugas/admin dapat melihat laporan.

## Backend

-   [ ] NestJS API berjalan.
-   [ ] Data aplikasi terhubung dan dapat digunakan.
-   [ ] Sesi pengguna dan hak akses berjalan.
-   [ ] Sesi pengguna dan hak akses berjalan.
-   [ ] Authorization berjalan.
-   [ ] Validation berjalan.
-   [ ] Business logic berjalan.

## Security

-   [ ] Password di-hash.
-   [ ] Sesi pengguna dikelola dengan aman.
-   [ ] Role berjalan.
-   [ ] User tidak dapat mengakses data yang tidak diperbolehkan.
-   [ ] Secret key tidak berada di source code publik.

## UI/UX

-   [ ] Responsive.
-   [ ] Loading state.
-   [ ] Empty state.
-   [ ] Error state.
-   [ ] Feedback setelah aksi.

## Deployment

-   [ ] Frontend berhasil di-deploy.
-   [ ] Backend berhasil di-deploy.
-   [ ] data aplikasi production terhubung.
-   [ ] API production dapat digunakan.
-   [ ] Konfigurasi production sesuai kebutuhan aplikasi.
-   [ ] Domain dapat diakses.
-   [ ] HTTPS aktif jika tersedia.

## Quality

-   [ ] Tidak ada bug kritis.
-   [ ] Semua fitur utama sudah diuji.
-   [ ] FE dan BE terintegrasi.
-   [ ] Data konsisten.
-   [ ] Production testing berhasil.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 66. Deliverables

Hasil utama proyek:

-   Frontend SchoolRent.
-   Backend REST API SchoolRent.
-   Integrasi frontend dan backend.
-   Dokumentasi kebutuhan produk dan kontrak API.
-   Hasil pengujian fitur.
-   Aplikasi yang siap digunakan setelah deployment.

# 67. Ringkasan Fitur Utama

**SchoolRent memiliki 12 fitur utama:**

    No Fitur                   Role
  ---- ----------------------- -----------------------
     1 Manajemen Barang        Petugas, Admin
     2 Manajemen Kategori      Petugas, Admin
     3 Pencarian Barang        Siswa
     4 Filter Barang           Siswa
     5 Pengajuan Peminjaman    Siswa
     6 Persetujuan/Penolakan   Petugas
     7 Pembatalan Peminjaman   Siswa
     8 Pengembalian Barang     Petugas
     9 Perhitungan Denda       Sistem, Petugas
    10 Riwayat Peminjaman      Siswa, Petugas, Admin
    11 Manajemen Pengguna      Admin
    12 Laporan & Statistik     Petugas, Admin

### Fitur pendukung yang tidak dihitung:

-   Register.
-   Login.
-   Logout.
-   Dashboard.
-   Profil.
-   Notification.
-   Session/token management.

Dengan demikian, requirement **minimal 10 fitur utama** telah terpenuhi
dengan **12 fitur utama**.

------------------------------------------------------------------------
