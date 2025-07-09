Blueprint Database Finako v1.0
Berikut adalah draf awal skema database komprehensif yang dirancang berdasarkan semua kebutuhan yang telah kita identifikasi. Skema ini sudah mencakup dukungan untuk:

Multi-Tenancy (setiap data terikat pada business_id)

Manajemen Langganan (Basic/Pro)

Produk dengan Varian

Manajemen Stok (Produk Jadi & Bahan Baku/Resep)

Transaksi dengan Diskon

Peran Pengguna (Owner, Kasir, Manajer)

Multi-Cabang

Absensi Pegawai

-- DRAFT SKEMA DATABASE FINAKO v1.0 (REVISI PERMISSION)

-- =================================================================
-- Tabel Inti & Bisnis
-- =================================================================

CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone_number TEXT,
    onboarding_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.businesses
ADD COLUMN tax_percent NUMERIC(5, 2) DEFAULT 0,
ADD COLUMN service_charge_percent NUMERIC(5, 2) DEFAULT 0;

CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    price INTEGER NOT NULL,
    outlet_limit INTEGER NOT NULL,
    user_limit INTEGER NOT NULL,
    product_limit INTEGER NOT NULL
);

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status VARCHAR(20) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- =================================================================
-- Tabel Pengguna & Akses (Auth & Roles)
-- =================================================================

CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id),
    full_name TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- =================================================================
-- Tabel Produk & Inventaris
-- =================================================================

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE public.ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stock_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    has_variants BOOLEAN NOT NULL DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    is_composite BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    sku VARCHAR(100)
);

CREATE TABLE public.product_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    quantity_used NUMERIC(10, 2) NOT NULL
);


-- =================================================================
-- Tabel Transaksi
-- =================================================================

CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    outlet_id UUID NOT NULL REFERENCES public.outlets(id),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    total_amount INTEGER NOT NULL,
    discount_amount INTEGER DEFAULT 0,
    tax_amount INTEGER DEFAULT 0,
    final_amount INTEGER NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.transactions
ADD COLUMN service_charge_amount INTEGER DEFAULT 0;

CREATE TABLE public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL,
    price_per_item INTEGER NOT NULL,
    total_price INTEGER NOT NULL
);


-- =================================================================
-- Tabel Manajemen Pegawai (Fitur Pro)
-- =================================================================

CREATE TABLE public.employee_attendances (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ DEFAULT now() NOT NULL,
    clock_out TIMESTAMPTZ,
    notes TEXT
);

-- Tabel untuk menyimpan program promosi/diskon
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'percentage' atau 'fixed_amount'
    value NUMERIC NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Tabel jembatan untuk menentukan produk mana yang kena diskon
CREATE TABLE public.promotion_products (
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, product_id)
);
-- =================================================================
-- Fungsi Pembantu untuk RLS (Row Level Security) - DIPINDAHKAN KE PUBLIC
-- =================================================================

CREATE OR REPLACE FUNCTION public.get_current_business_id()
RETURNS UUID AS $$
DECLARE
  business_id UUID;
BEGIN
  SELECT p.business_id INTO business_id
  FROM public.profiles p
  WHERE p.id = auth.uid();
  RETURN business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.get_current_business_id() IS 'Mengambil ID bisnis dari pengguna yang sedang login. Penting untuk RLS.';

-- 1. Buat fungsi yang akan dijalankan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_business_id UUID;
  owner_role_id UUID;
BEGIN
  -- Buat bisnis baru untuk pengguna ini
  INSERT INTO public.businesses (name) VALUES (NEW.raw_user_meta_data->>'full_name' || '''s Store') RETURNING id INTO new_business_id;

  -- Ambil ID untuk peran 'Owner'
  SELECT id INTO owner_role_id FROM public.roles WHERE name = 'Owner';

  -- Buat profil untuk pengguna baru dan hubungkan ke bisnis & peran
  INSERT INTO public.profiles (id, business_id, role_id, full_name)
  VALUES (NEW.id, new_business_id, owner_role_id, NEW.raw_user_meta_data->>'full_name');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Buat trigger yang memanggil fungsi di atas setelah user baru dibuat di Supabase Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


Aplikasi ini menggunakan Supabase auto-generated API
Supabase secara otomatis membuat RESTful API untuk setiap tabel yang Anda buat di database 

Alur Autentikasi Finako (Versi Baru)
Register

User mendaftar dengan email, password, dan nama pemilik (full_name).
Data dikirim ke Supabase Auth.
Trigger Supabase otomatis membuat bisnis dan profil user.
Register Success

User diarahkan ke halaman sukses.
Instruksi: cek email untuk verifikasi dan lanjut login.
Login

User login menggunakan email & password.
Setelah login, aplikasi fetch profil user dan data bisnis.
Payment Info (Pilih Paket & Pembayaran)

Jika bisnis belum punya langganan aktif (subscriptions.status !== 'active'), user diarahkan ke halaman Payment Info.
Jika belum memilih paket: tampilkan form pemilihan paket.
Jika sudah memilih paket tapi status masih pending: tampilkan instruksi pembayaran dan status langganan.
Setelah pembayaran dikonfirmasi (oleh admin atau otomatis), status langganan diubah menjadi active.
Onboarding

Jika langganan sudah aktif, user diarahkan ke halaman onboarding untuk melengkapi data bisnis (alamat, cabang, dsb).
Setelah data onboarding lengkap, field onboarding_status di tabel businesses diubah menjadi completed.
Dashboard

Jika langganan aktif dan onboarding selesai, user bisa mengakses dashboard dan seluruh fitur aplikasi.
Ringkasan: Register → Register Success → Login → Payment Info (pilih paket & bayar) → [status pending] → [status active] → Onboarding → Dashboard

Catatan:

Selama status langganan masih pending, user hanya bisa mengakses halaman pembayaran.
Setelah status langganan active dan onboarding selesai, user bisa mengakses dashboard.
Semua proses backend langsung ke Supabase, tanpa backend custom.

# 1. Supabase Client (untuk berinteraksi dengan database dan auth)
npm install @supabase/supabase-js

# 2. Vue Router (untuk navigasi antar halaman)
npm install vue-router@4

# 3. Pinia (untuk state management global, menyimpan info user & plan)
npm install pinia

# 4. Tailwind CSS & DaisyUI (untuk styling)
npm install -D tailwindcss postcss autoprefixer daisyui