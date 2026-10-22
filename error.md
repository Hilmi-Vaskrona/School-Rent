# 📋 Laporan Audit & Bug Report Backend API SchoolRent

| Metadata | Keterangan |
| :--- | :--- |
| **Project** | SchoolRent (Sistem Peminjaman Barang & Fasilitas Sekolah) |
| **Target Host** | `https://school-rent.vercel.app` |
| **API Docs (Swagger)** | `https://school-rent.vercel.app/api/docs` |
| **Tanggal Audit** | 22 Oktober 2026 |
| **Metode Pengujian** | Live End-to-End HTTP Testing & Swagger Schema Analysis |
| **Tingkat Urgensi** | 🔴 **CRITICAL (Blocker Utama Alur Peminjaman, Pengembalian, Denda, dan Laporan)** |

---

## 1. Ringkasan Eksekutif (Executive Summary)

Berdasarkan audit dan pengujian integrasi antara Frontend (Next.js) dan Backend (NestJS + Supabase), ditemukan **2 kendala teknis kritis di sisi Backend** yang menyebabkan fitur-fitur operasional utama tidak dapat berjalan:

1. **Error Ambiguous Relationship pada PostgREST (PGRST200)**:
   Query Supabase di backend gagal karena tabel `loans` dan `fines` memiliki lebih dari satu relasi *foreign key* ke tabel `users`. Karena nama relasi tidak didefinisikan secara eksplisit pada query `.select(...)`, PostgREST mengembalikan HTTP `400 Bad Request`. Ini melumpuhkan endpoint daftar peminjaman, pengembalian, denda, dan laporan.
2. **Validasi `@IsUUID('4')` yang Terlalu Ketat pada DTO**:
   Decorator validasi di NestJS DTO mengunci format hanya untuk UUID versi 4 (`@IsUUID('4')`), sedangkan seluruh data *seed* awal di database Supabase (dan bahkan contoh data di dokumentasi Swagger backend sendiri) menggunakan format ID kustom seperti `e0000000-0000-0000-0000-000000000001` (bukan UUIDv4). Akibatnya, barang-barang bawaan sekolah tidak bisa dipinjam sama sekali oleh siswa.

---

## 2. Tabel Rekapitulasi Error Endpoint

| Endpoint | Method | Status | Kode / Pesan Error | Kategori Masalah |
| :--- | :---: | :---: | :--- | :--- |
| `/api/loans` | `GET` | 🔴 **400** | `Could not embed because more than one relationship was found for 'loans' and 'users'` | Ambiguous FK Embedding |
| `/api/loans` | `POST` | 🔴 **400** | `["ID Barang harus UUID yang valid"]` (jika memilih barang seed)<br>`Could not embed...` (jika UUID valid) | Validasi DTO & Ambiguous FK |
| `/api/returns` | `GET` | 🔴 **400** | `Could not embed because more than one relationship was found for 'loans' and 'users'` | Ambiguous FK Embedding |
| `/api/returns` | `POST` | 🔴 **400** | `["ID peminjaman harus berupa UUID valid"]` | Validasi DTO `@IsUUID('4')` |
| `/api/fines` | `GET` | 🔴 **400** | `Could not embed because more than one relationship was found for 'fines' and 'users'` | Ambiguous FK Embedding |
| `/api/items` | `POST` | 🔴 **400** | `["ID Kategori harus UUID yang valid"]` | Validasi DTO `@IsUUID('4')` |
| `/api/reports/loans` | `GET` | 🔴 **400** | `Could not embed because more than one relationship was found for 'loans' and 'users'` | Ambiguous FK Embedding |
| `/api/reports/returns` | `GET` | 🔴 **400** | `Could not embed because more than one relationship was found for 'loans' and 'users'` | Ambiguous FK Embedding |
| `/api/reports/overdue` | `GET` | 🔴 **400** | `Could not embed because more than one relationship was found for 'loans' and 'users'` | Ambiguous FK Embedding |

---

## 3. Rincian Masalah & Rekomendasi Solusi

### 🔴 MASALAH 1: PostgREST Ambiguous Foreign Key (PGRST200)

#### Gejala
Permintaan HTTP `GET /api/loans`, `GET /api/returns`, `GET /api/fines`, dan `GET /api/reports/*` selalu mengembalikan status 400:

```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "statusCode": 400,
  "message": "Could not embed because more than one relationship was found for 'loans' and 'users'",
  "error": "Bad Request",
  "timestamp": "2026-10-22T08:30:25.097Z",
  "path": "/api/loans"
}
```

Dan untuk endpoint `/api/fines`:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Could not embed because more than one relationship was found for 'fines' and 'users'",
  "error": "Bad Request",
  "path": "/api/fines"
}
```

#### Analisis Penyebab (Root Cause)
Di skema database PostgreSQL Supabase, tabel `loans` memiliki lebih dari 1 kolom foreign key yang merujuk ke tabel `users`, misalnya:
- `user_id` / `borrower_id` $\rightarrow$ `users(id)`
- `approved_by` / `officer_id` $\rightarrow$ `users(id)`

Pada kode NestJS service, query Supabase dituliskan tanpa menspesifikasikan kolom/constraint foreign key:
```typescript
// ❌ KODE SAAT INI (Bermasalah)
supabase.from('loans').select('*, users(*)')
```
Karena PostgREST menemukan lebih dari 1 relasi antara `loans` dan `users`, query ditolak dengan error `PGRST200`.

Hal yang sama terjadi pada:
- `fines` $\rightarrow$ Terdapat relasi peminjam (`user_id`) dan petugas pembuat/penerima (`created_by`/`collected_by`).
- `POST /api/loans` $\rightarrow$ Setelah row peminjaman di-insert, query pemanggilan data balikan (`.insert(...).select('..., users(*)')`) mengalami error yang sama sehingga transaksi gagal.

#### Solusi Kode Perbaikan (NestJS Service)
Gunakan sintaks eksplisit relasi foreign key PostgREST menggunakan tanda seru (`!nama_kolom_fk`) atau alias:

```typescript
// ✅ PERBAIKAN 1: Pada Loans Service (GET /api/loans & POST /api/loans)
const { data, error } = await supabase
  .from('loans')
  .select(`
    *,
    borrower:users!user_id(*),
    approver:users!approved_by(*),
    items(*)
  `);

// ✅ PERBAIKAN 2: Pada Fines Service (GET /api/fines)
const { data, error } = await supabase
  .from('fines')
  .select(`
    *,
    borrower:users!user_id(*),
    loans(*)
  `);

// ✅ PERBAIKAN 3: Pada Reports Service (GET /api/reports/loans, /returns, /overdue)
// Tambahkan penentu FK eksplisit pada seluruh query relasi loans -> users.
```

---

### 🔴 MASALAH 2: Validasi `@IsUUID('4')` Menolak Data Seed & Contoh Swagger

#### Gejala
Ketika melakukan peminjaman barang bawaan (seperti Proyektor Epson EB-X500 dengan ID `e0000000-0000-0000-0000-000000000001`):

```json
POST /api/loans
Body: {
  "item_id": "e0000000-0000-0000-0000-000000000001",
  "quantity": 1,
  "borrow_date": "2026-10-23",
  "due_date": "2026-10-25",
  "purpose": "Presentasi tugas kelompok"
}

HTTP/1.1 400 Bad Request
{
  "success": false,
  "statusCode": 400,
  "message": [
    "ID Barang harus UUID yang valid"
  ],
  "error": "Bad Request",
  "path": "/api/loans"
}
```

Ketika menambahkan barang baru dengan memilih kategori bawaan (`d0000000-0000-0000-0000-000000000001`):
```json
POST /api/items
HTTP/1.1 400 Bad Request
{
  "success": false,
  "statusCode": 400,
  "message": [
    "ID Kategori harus UUID yang valid"
  ],
  "error": "Bad Request",
  "path": "/api/items"
}
```

#### Analisis Penyebab (Root Cause)
Pada DTO NestJS (`CreateLoanDto`, `CreateItemDto`, `ProcessReturnDto`), decorator validasi menggunakan:
```typescript
@IsUUID('4', { message: 'ID Barang harus UUID yang valid' })
item_id: string;
```
Validator `'4'` secara ketat mewajibkan digit ke-13 bernilai `4` (RFC 4122 v4). Namun data awal di database diset dengan format *mock/seed*:
- Items: `e0000000-0000-0000-0000-000000000001` s/d `0007` (digit ke-13 bernilai `0`)
- Categories: `d0000000-0000-0000-0000-000000000001` s/d `0005` (digit ke-13 bernilai `0`)
- Users: `a000...`, `b000...`, `c000...`

Bahkan di Swagger Docs (`/api/docs`), contoh DTO bawaan backend adalah:
`"category_id": "d0000000-0000-0000-0000-000000000001"` $\rightarrow$ **contoh dari Swagger backend sendiri langsung gagal divalidasi.**

#### Solusi Kode Perbaikan (NestJS DTOs)
Ubah parameter validasi dari `'4'` menjadi `'all'` atau tanpa parameter di semua DTO terkait:

```typescript
// ❌ SEBELUM:
@IsUUID('4', { message: 'ID Barang harus UUID yang valid' })
item_id: string;

// ✅ SESUDAH:
@IsUUID('all', { message: 'ID Barang harus UUID yang valid' })
item_id: string;
```
Terapkan perubahan ini pada:
1. `CreateLoanDto` $\rightarrow$ properti `item_id`
2. `CreateItemDto` & `UpdateItemDto` $\rightarrow$ properti `category_id`
3. `ProcessReturnDto` $\rightarrow$ properti `loan_id`

---

### 🟡 MASALAH 3: Response Label Exception Filter

#### Gejala
Ketika request tidak valid atau sesi berakhir (misalnya token tidak disertakan atau expired pada `GET /api/auth/me`), respon JSON menghasilkan:
```json
HTTP/1.1 401 Unauthorized
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Internal Server Error",
  "path": "/api/auth/me"
}
```
Field `error` tertulis `"Internal Server Error"` padahal `statusCode` adalah `401`.

#### Solusi
Periksa file `all-exceptions.filter.ts` atau `http-exception.filter.ts`. Pastikan field `error` mengambil nama exception asli (misal `exception.name` atau `UnauthorizedException`) dan bukan nilai default yang di-hardcode.

---

## 4. Dampak Langsung ke Frontend (User Experience)

| Modul Frontend | Status Saat Ini | Dampak Pengguna |
| :--- | :---: | :--- |
| **Siswa — Form Pinjam (`/loans/create`)** | ❌ **Lumpuh** | Siswa tidak bisa meminjam proyektor, laptop, kamera, dan barang lainnya. Form selalu gagal submit dengan error validasi. |
| **Siswa — Daftar Pinjaman (`/loans`)** | ❌ **Error State** | Muncul pesan error dan daftar peminjaman tidak bisa dimuat. |
| **Siswa — Riwayat (`/history`)** | ❌ **Error State** | Riwayat peminjaman siswa tidak bisa diakses. |
| **Siswa & Petugas — Denda (`/fines`)** | ❌ **Error State** | Informasi denda tidak dapat ditampilkan. |
| **Petugas — Approval (`/admin/loans`)** | ❌ **Error State** | Petugas tidak bisa melihat permohonan peminjaman yang masuk untuk disetujui/ditolak. |
| **Petugas — Pengembalian (`/admin/returns`)** | ❌ **Error State** | Daftar pengembalian tidak dapat dimuat dan proses return barang tertahan. |
| **Admin — Rekap Laporan (`/admin/reports`)** | ⚠️ **Parsial** | Ringkasan angka bisa dimuat, namun tabel rekapitulasi peminjaman, pengembalian, dan keterlambatan kosong. |
| **Admin — Tambah Barang (`/admin/items`)** | ⚠️ **Terganggu** | Tidak bisa menambahkan barang baru jika memilih kategori bawaan sistem. |

---

## 5. Cara Mereproduksi Masalah (Reproduction Scripts)

Tim backend dapat langsung menguji dan mereproduksi temuan ini melalui terminal / Postman dengan perintah curl berikut:

### 1. Reproduksi Error PGRST200 pada Loans
```bash
# Login untuk mendapatkan token
curl -X POST https://school-rent.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@schoolrent.com","password":"Password123!"}'

# Panggil endpoint loans dengan Bearer Token:
curl -i https://school-rent.vercel.app/api/loans \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
# HASIL: HTTP 400 "Could not embed because more than one relationship was found for 'loans' and 'users'"
```

### 2. Reproduksi Error Validasi UUID Seed pada Create Loan
```bash
curl -i -X POST https://school-rent.vercel.app/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "item_id": "e0000000-0000-0000-0000-000000000001",
    "quantity": 1,
    "borrow_date": "2026-10-23",
    "due_date": "2026-10-25",
    "purpose": "Test peminjaman barang seed"
  }'
# HASIL: HTTP 400 "ID Barang harus UUID yang valid"
```

---

## 6. Action Items Checklist untuk Tim Backend

- [ ] **1. Perbaiki Query Ambiguous FK di PostgREST:**
  - Tambahkan penentu relasi foreign key eksplisit (`users!user_id` atau `users!loans_user_id_fkey`) di:
    - `loans.service.ts` (query find/list dan insert)
    - `returns.service.ts`
    - `fines.service.ts`
    - `reports.service.ts`
- [ ] **2. Longgarkan Validasi UUID pada DTOs:**
  - Ganti `@IsUUID('4')` menjadi `@IsUUID('all')` atau `@IsUUID()` pada:
    - `CreateLoanDto` (`item_id`)
    - `CreateItemDto` & `UpdateItemDto` (`category_id`)
    - `ProcessReturnDto` (`loan_id`)
- [ ] **3. Uji Coba Mandiri (Smoke Testing):**
  - Pastikan `GET /api/loans` menghasilkan `200 OK`.
  - Pastikan `POST /api/loans` berhasil meminjam barang dengan ID `e0000000-0000-0000-0000-000000000001` (`201 Created`).
  - Pastikan `GET /api/returns` menghasilkan `200 OK`.
  - Pastikan `GET /api/fines` menghasilkan `200 OK`.
  - Pastikan `GET /api/reports/loans` menghasilkan `200 OK`.
- [ ] **4. Deploy ke Vercel:**
  - Push commit perbaikan ke repository backend dan verifikasi deployment di Vercel.