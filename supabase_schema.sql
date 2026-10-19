-- ============================================================================
-- SchoolRent - Database Schema for Supabase (PostgreSQL)
-- Sistem Peminjaman Barang & Fasilitas Sekolah
-- Sesuai PRD (Product Requirements Document)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. Trigger Function for Updated At Timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. System Settings Table
-- Konfigurasi sistem dinamis (misal tarif denda per hari, max durasi pinjam)
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_system_settings_updated_at ON system_settings;
CREATE TRIGGER trg_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. Users Table
-- Aktor: SISWA, PETUGAS, ADMIN
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'SISWA' CHECK (role IN ('SISWA', 'PETUGAS', 'ADMIN')),
    class_name VARCHAR(50), -- Kelas untuk siswa, misal: 'XII RPL 1'
    major VARCHAR(100),      -- Jurusan, misal: 'Rekayasa Perangkat Lunak'
    phone VARCHAR(25),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Categories Table
-- Kategori barang (Elektronik, Multimedia, Alat Olahraga, Peralatan Kelas, dsb)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Items Table (Data Barang & Fasilitas)
-- Status: AVAILABLE, BORROWED, MAINTENANCE, INACTIVE
-- Kondisi: BAIK, RUSAK_RINGAN, RUSAK_BERAT
-- ============================================================================
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    code VARCHAR(50) UNIQUE NOT NULL, -- Kode inventaris barang, misal: 'BRG-001'
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    total_stock INT NOT NULL DEFAULT 0 CHECK (total_stock >= 0),
    available_stock INT NOT NULL DEFAULT 0 CHECK (available_stock >= 0 AND available_stock <= total_stock),
    condition VARCHAR(50) NOT NULL DEFAULT 'BAIK' CHECK (condition IN ('BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT')),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BORROWED', 'MAINTENANCE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_condition ON items(condition);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);

DROP TRIGGER IF EXISTS trg_items_updated_at ON items;
CREATE TRIGGER trg_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. Loans Table (Peminjaman)
-- Status: PENDING, APPROVED, REJECTED, BORROWED, RETURNED, CANCELLED, OVERDUE
-- ============================================================================
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_code VARCHAR(50) UNIQUE NOT NULL, -- Kode unik pinjaman, misal: 'LOAN-20261019-001'
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    purpose TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'BORROWED', 'RETURNED', 'CANCELLED', 'OVERDUE')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    cancellation_reason TEXT,
    borrowed_at TIMESTAMPTZ, -- Waktu saat barang diambil/diserahkan oleh petugas
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_loan_dates CHECK (due_date >= borrow_date)
);

CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_item_id ON loans(item_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_due_date ON loans(due_date);
CREATE INDEX IF NOT EXISTS idx_loans_borrow_date ON loans(borrow_date);

DROP TRIGGER IF EXISTS trg_loans_updated_at ON loans;
CREATE TRIGGER trg_loans_updated_at
BEFORE UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. Returns Table (Pengembalian Barang)
-- Kondisi saat kembali: BAIK, RUSAK_RINGAN, RUSAK_BERAT, HILANG
-- ============================================================================
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID UNIQUE NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
    processed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    return_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    item_condition VARCHAR(50) NOT NULL DEFAULT 'BAIK' CHECK (item_condition IN ('BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'HILANG')),
    damage_notes TEXT,
    notes TEXT,
    days_overdue INT NOT NULL DEFAULT 0 CHECK (days_overdue >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_returns_loan_id ON returns(loan_id);
CREATE INDEX IF NOT EXISTS idx_returns_processed_by ON returns(processed_by);
CREATE INDEX IF NOT EXISTS idx_returns_return_date ON returns(return_date);

DROP TRIGGER IF EXISTS trg_returns_updated_at ON returns;
CREATE TRIGGER trg_returns_updated_at
BEFORE UPDATE ON returns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. Fines Table (Denda Keterlambatan)
-- Status: UNPAID, PAID, WAIVED
-- ============================================================================
CREATE TABLE IF NOT EXISTS fines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID UNIQUE NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    days_overdue INT NOT NULL DEFAULT 0 CHECK (days_overdue >= 0),
    fine_per_day NUMERIC(12, 2) NOT NULL DEFAULT 5000.00 CHECK (fine_per_day >= 0),
    total_fine NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_fine >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'WAIVED')),
    paid_at TIMESTAMPTZ,
    handled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fines_loan_id ON fines(loan_id);
CREATE INDEX IF NOT EXISTS idx_fines_user_id ON fines(user_id);
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);

DROP TRIGGER IF EXISTS trg_fines_updated_at ON fines;
CREATE TRIGGER trg_fines_updated_at
BEFORE UPDATE ON fines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. Notifications Table (Notifikasi Sistem)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT false,
    reference_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- 11. Initial Data / Seeds
-- Password default: 'Password123!' (dihash dengan bcrypt)
-- Hash bcrypt '$2a$10$wT3WfE90zNsqrBq9r0L/EecrB4gVqTzM9qWn.mUqE1N9cQc79J72e' atau fungsi crypt()
-- ============================================================================

-- A. Default System Settings
INSERT INTO system_settings (key, value, description)
VALUES 
    ('fine_per_day', '5000', 'Nominal denda keterlambatan pengembalian per hari (dalam Rupiah)'),
    ('max_loan_days', '7', 'Maksimal durasi peminjaman standar dalam hari'),
    ('school_name', 'SchoolRent High School', 'Nama instansi / sekolah'),
    ('allow_student_cancel_approved', 'false', 'Apakah siswa boleh membatalkan jika status sudah APPROVED sebelum dipinjam')
ON CONFLICT (key) DO NOTHING;

-- B. Default Users (Admin, Petugas, Siswa)
-- Password untuk ketiga akun default: Password123!
-- (Bcrypt hash: $2a$10$k16j33Gj5YfD4d71Vv14eeoI7LpYtC6g/y5qW8iX2nJ/N6hF3P8gW)
-- Anda dapat langsung login dengan akun di bawah ini setelah menjalankan SQL.
INSERT INTO users (id, email, password_hash, name, role, class_name, major, phone, is_active)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        'admin@schoolrent.com',
        crypt('Password123!', gen_salt('bf', 10)),
        'Administrator Sekolah',
        'ADMIN',
        NULL,
        NULL,
        '081234567890',
        true
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'petugas@schoolrent.com',
        crypt('Password123!', gen_salt('bf', 10)),
        'Petugas Sarpras',
        'PETUGAS',
        NULL,
        NULL,
        '081234567891',
        true
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        'siswa@schoolrent.com',
        crypt('Password123!', gen_salt('bf', 10)),
        'Budi Santoso (Siswa)',
        'SISWA',
        'XII RPL 1',
        'Rekayasa Perangkat Lunak',
        '081234567892',
        true
    )
ON CONFLICT (email) DO NOTHING;

-- C. Default Categories
INSERT INTO categories (id, name, description)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'Elektronik & Multimedia', 'Proyektor, laptop, TV monitor, dan aksesoris multimedia'),
    ('d0000000-0000-0000-0000-000000000002', 'Audio & Dokumentasi', 'Speaker portable, mikrofon, kamera, dan tripod'),
    ('d0000000-0000-0000-0000-000000000003', 'Alat Olahraga', 'Bola basket, bola voli, raket bulutangkis, dan peralatan penjas'),
    ('d0000000-0000-0000-0000-000000000004', 'Peralatan Kelas & Event', 'Kabel roll, kabel HDMI, pointer presenter, dan papan display'),
    ('d0000000-0000-0000-0000-000000000005', 'Laboratorium & Praktik', 'Peralatan lab sains, toolbox elektronika, dan alat ukur')
ON CONFLICT (name) DO NOTHING;

-- D. Default Items
INSERT INTO items (id, category_id, code, name, description, total_stock, available_stock, condition, status)
VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'BRG-ELK-001',
        'Proyektor Epson EB-X500',
        'Proyektor 3600 ANSI lumens, resolusi XGA, port HDMI dan VGA, lengkap kabel power & tas.',
        5,
        5,
        'BAIK',
        'AVAILABLE'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000001',
        'BRG-ELK-002',
        'Laptop Lenovo ThinkPad L14',
        'Laptop Intel Core i5 11th Gen, RAM 16GB, SSD 512GB untuk kebutuhan presentasi & lomba.',
        4,
        4,
        'BAIK',
        'AVAILABLE'
    ),
    (
        'e0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000002',
        'BRG-AUD-001',
        'Kamera DSLR Canon EOS 3000D',
        'Kamera DSLR lensa kit 18-55mm, baterai cadangan, memory 32GB, dan strap.',
        3,
        3,
        'BAIK',
        'AVAILABLE'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000002',
        'BRG-AUD-002',
        'Speaker Portable Fleco Wireless',
        'Speaker aktif bluetooth 12 inch dengan 2 wireless mic untuk acara aula atau lapangan.',
        2,
        2,
        'BAIK',
        'AVAILABLE'
    ),
    (
        'e0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000003',
        'BRG-OLR-001',
        'Bola Basket Molten GG7X',
        'Bola basket resmi kulit sintetis ukuran 7 standar kompetisi.',
        8,
        8,
        'BAIK',
        'AVAILABLE'
    ),
    (
        'e0000000-0000-0000-0000-000000000004',
        'd0000000-0000-0000-0000-000000000004',
        'BRG-KLS-001',
        'Kabel HDMI Vention 10 Meter',
        'Kabel HDMI versi 2.0 panjang 10 meter gold plated support 4K 60Hz.',
        10,
        10,
        'BAIK',
        'AVAILABLE'
    ),
    (
        'e0000000-0000-0000-0000-000000000004',
        'd0000000-0000-0000-0000-000000000004',
        'BRG-KLS-002',
        'Wireless Laser Presenter Pointer',
        'Pointer presentasi USB wireless 2.4GHz dengan sinar laser merah jangkauan 15m.',
        6,
        6,
        'BAIK',
        'AVAILABLE'
    )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 12. Row Level Security (RLS) Settings
-- Supabase secara default mengaktifkan RLS jika diinginkan.
-- Backend NestJS menggunakan SERVICE_ROLE_KEY untuk akses penuh.
-- RLS diaktifkan agar aman saat diakses dari client public.
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy untuk public / authenticated read pada categories dan items yang aktif:
DROP POLICY IF EXISTS "Public can view active items" ON items;
CREATE POLICY "Public can view active items" ON items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view categories" ON categories;
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);

-- Policy Service Role (Bypass RLS untuk Backend NestJS):
-- Catatan: Supabase service_role key secara otomatis mem-bypass RLS di PostgreSQL!
