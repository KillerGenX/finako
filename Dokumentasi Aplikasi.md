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


Aplikasi ini menggunakan Supabase auto-generated API
Supabase secara otomatis membuat RESTful API untuk setiap tabel yang Anda buat di database 
Menggunakan Vue Router untuk navigasi antar halaman
Menggunakan Pinia untuk state management global (menyimpan info user & plan)
Menggunakan Tailwind CSS & DaisyUI untuk styling
Menggunakan Supabase Auth untuk autentikasi pengguna

# Alur Penggunaan Aplikasi Finako (Versi Baru)

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

Onboarding hanya meminta data usaha minimal (misal: nama bisnis, alamat, cabang utama) agar user bisa mulai menggunakan aplikasi dengan cepat.
Setelah onboarding selesai, user bisa langsung mengakses dashboard dan fitur utama.

# Melengkapi Data Usaha di Pengaturan

Untuk melengkapi atau mengedit data usaha secara detail (misal: NPWP, logo, detail pajak, multi-cabang, dsb), user dapat membuka menu Pengaturan > Data Usaha kapan saja.

Menu Pengaturan Usaha dapat mencakup:
- Profil bisnis (nama, alamat, logo, NPWP, dsb)
- Cabang/outlet tambahan
- Pengaturan pajak & service charge
- Info kontak bisnis
- Pengaturan lain terkait bisnis

Catatan:
- Onboarding hanya meminta data minimal.
- Data usaha yang lebih lengkap bisa diisi/diubah di menu Pengaturan Usaha.
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

## Membangun Halaman Produk Finako (Rangkuman Fitur & Alur)
Mulai 10/07/2025 : Selesai pada 11/07/25 -> Rangkuman Update ada di Update Halaman Produk Dibawah
### Fitur Utama:
1. **Daftar Produk**
   - Menampilkan list produk milik bisnis (berdasarkan business_id user).
   - Kolom: foto produk (thumbnail), nama, kategori, stok, varian, status komposit.
   - Filter berdasarkan kategori dan outlet.

2. **Pemilihan Outlet**
   - Tersedia dropdown pemilihan outlet di halaman produk.
   - User dapat memilih/mengganti outlet aktif kapan saja di halaman produk.
   - Data produk yang ditampilkan dapat difilter sesuai outlet yang dipilih.

3. **CRUD Produk**
   - Owner: tambah, edit, hapus produk.
   - Role lain (Admin/Kasir/Manajer): hanya bisa melihat daftar produk (read-only).

4. **Foto Produk**
   - Setiap produk dapat memiliki foto (disimpan di Supabase Storage).
   - URL foto disimpan di kolom photo_url pada tabel products.
   - Foto tampil di daftar produk, menu POS, dan transaksi.

5. **Varian Produk**
   - Mendukung produk dengan varian (misal: ukuran, rasa).
   - Setiap varian punya harga dan SKU sendiri.

6. **Kategori Produk**
   - Produk dapat dikelompokkan berdasarkan kategori.
   - Dropdown/filter kategori.

7. **Pencarian Produk (Search)**
   - Kolom search untuk mencari produk berdasarkan nama, SKU, atau kategori.

8. **Paginasi Produk**
   - Daftar produk dipaginasi jika data banyak (misal: 10-20 produk per halaman).
   - Navigasi halaman di bawah tabel produk.

9. **Integrasi Supabase**
   - Semua data produk, kategori, varian, outlet, dan foto diambil/diupdate langsung ke Supabase (Database & Storage).

10. **Hak Akses**
    - Hak akses diatur berdasarkan role user (Owner: full CRUD, role lain: read-only).
    - Dicek di frontend dan backend (Supabase RLS).

### Alur Frontend:
1. User login → fetch profil user (role, business_id).
2. User memilih outlet aktif di halaman produk (dropdown outlet selalu tersedia).
3. Fetch daftar produk, kategori, varian, dan foto dari Supabase sesuai outlet yang dipilih.
4. Tabel produk tampil dengan filter, search, dan paginasi.
5. Owner bisa tambah/edit/hapus produk (termasuk upload foto).
6. Role lain hanya bisa melihat produk.
7. Semua aksi CRUD dan upload foto langsung terhubung ke Supabase.

### UI/UX:
- Menggunakan Tailwind CSS & DaisyUI.
- Tabel produk responsif dengan thumbnail foto.
- Modal/form tambah/edit produk dengan upload foto (preview sebelum simpan).
- Dropdown outlet dan kategori di atas tabel.
- Kolom search di atas tabel, paginasi di bawah tabel.
- Notifikasi sukses/gagal untuk setiap aksi.

---

-- CATATAN ANALISIS TAMBAHAN:
-- 1. Tabel product_variant_outlets sangat penting untuk POS modern, agar stok & harga varian bisa diatur per outlet.
-- 2. Tabel product_outlets tetap dipakai untuk produk tanpa varian.
-- 3. Jika ingin tracking mutasi stok (masuk/keluar, penyesuaian, transfer antar outlet), perlu tabel tambahan:
--    a. product_stock_movements (id, product_id/variant_id, outlet_id, type, qty, ref, created_at)
--    b. ingredient_stock_movements (id, ingredient_id, outlet_id, type, qty, ref, created_at)
-- 4. Untuk audit log perubahan harga/stok, bisa tambahkan tabel audit_log atau product_price_history.
-- 5. Untuk bundle/komposit, product_recipes sudah cukup, tapi jika ingin tracking hasil produksi (produk jadi dari bahan baku), bisa tambahkan tabel production_batches.

Rangkuman Update 
- Halaman Produk View
Berikut analisis dan penjelasan fitur yang sudah berjalan di seluruh isi file ProdukView.vue (Finako POS SaaS):

1. Tampilan & Filter Produk
Terdapat dropdown untuk memilih Outlet dan Kategori.
Fitur pencarian produk berdasarkan nama/SKU.
Tabel produk menampilkan foto, nama, kategori, stok, harga, status varian, outlet, dan aksi (edit/hapus).
2. Manajemen Produk
Modal tambah/edit/hapus produk.
Form input: nama produk, kategori (dropdown + tambah kategori baru), foto produk (upload & preview), deskripsi, status varian, status komposit.
Fitur kelola varian produk (tambah/edit/hapus varian pada modal nested).
Validasi form: nama dan kategori wajib diisi, minimal 1 varian jika produk punya varian.
3. Manajemen Kategori
Dropdown kategori di filter dan form produk.
Fitur tambah kategori baru langsung dari modal produk.
Fitur hapus kategori (tombol delete di dropdown dan modal produk).
Konfirmasi sebelum hapus kategori.
Cek jika kategori sedang dipakai produk lain, maka tidak bisa dihapus.
4. Manajemen Stok & Harga
Modal atur stok produk per outlet (produk tanpa varian).
Modal atur stok varian per outlet (produk dengan varian).
Input stok, harga, dan status aktif untuk produk/varian per outlet.
Data stok dan harga diambil dari tabel product_outlets dan product_variant_outlets.
Total stok varian otomatis ditampilkan di tabel utama produk.
5. Manajemen Varian
Modal kelola varian: tambah, edit, hapus varian.
Modal view varian (read-only): menampilkan daftar varian, harga, SKU, stok, dan status aktif.
6. Integrasi Supabase
Query data produk, kategori, outlet, varian, stok, dan harga menggunakan Supabase.
Insert, update, delete produk, kategori, varian, dan stok langsung ke database.
7. Reaktivitas & Validasi
Semua data (produk, kategori, outlet, varian, stok) menggunakan reaktif ref.
Watcher pada outlet untuk update stok/harga otomatis.
Validasi form dan error handling pada semua aksi CRUD.
8. UX & UI
Modal konfirmasi hapus produk dan kategori.
Preview foto produk sebelum upload.
Loading spinner pada tombol simpan stok varian.
Paginasi produk.
Kesimpulan:
Semua fitur utama manajemen produk, kategori, varian, stok, dan harga sudah berjalan dan terintegrasi dengan database Supabase.
Fitur tambah dan hapus kategori sudah lengkap, termasuk validasi jika kategori sedang dipakai produk lain.
UI sudah responsif dan user-friendly, dengan modal, konfirmasi, dan error handling yang baik.