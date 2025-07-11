Rencana Fitur Utama StokView
Master Bahan Baku (ingredients)

Tabel daftar bahan baku: nama, satuan, aksi edit/hapus.
Modal tambah/edit bahan baku.
Validasi input (nama dan satuan wajib).
Stok Bahan Baku per Outlet (ingredient_outlets)

Dropdown outlet untuk memilih outlet aktif.
Tabel stok bahan baku: nama, satuan, jumlah stok, min_stock, status aktif, aksi edit stok.
Modal tambah/edit stok bahan baku per outlet.
Indikator stok rendah (jika stok < min_stock).
Mutasi Stok Bahan Baku (ingredient_stock_movements)

Tabel riwayat mutasi stok: tanggal, jenis mutasi (masuk/keluar/penyesuaian/transfer), jumlah, keterangan.
Modal input mutasi stok.
Monitoring Stok Produk Jadi (product_outlets, product_variant_outlets)

Tabel monitoring stok produk jadi dan varian per outlet.
Indikator stok rendah produk.
Integrasi Supabase

Query, insert, update, delete data ke tabel ingredients, ingredient_outlets, product_outlets, product_variant_outlets, ingredient_stock_movements.
UI/UX Modern

Menggunakan Tailwind CSS & DaisyUI untuk semua komponen (tabel, modal, form, dropdown, tab).
Layout responsif, notifikasi aksi, filter dan pencarian bahan baku.
Langkah-Langkah Pembuatan StokView
Desain Struktur Halaman

Buat tab/section: Bahan Baku, Stok per Outlet, Mutasi Stok, Monitoring Produk Jadi.
Implementasi Master Bahan Baku

Buat tabel dan modal CRUD untuk ingredients.
Integrasi query dan aksi ke Supabase.
Implementasi Stok Bahan Baku per Outlet

Buat dropdown outlet.
Tabel stok bahan baku per outlet, modal tambah/edit stok.
Validasi dan indikator stok rendah.
Implementasi Mutasi Stok

Tabel riwayat mutasi stok bahan baku.
Modal input mutasi (masuk, keluar, penyesuaian, transfer).
Integrasi ke ingredient_stock_movements.
Monitoring Stok Produk Jadi

Tabel monitoring stok produk dan varian per outlet.
Indikator stok rendah produk.
Integrasi dan Validasi

Pastikan semua aksi CRUD dan mutasi terhubung ke Supabase.
Validasi input dan error handling.
UI/UX

Gunakan Tailwind CSS & DaisyUI untuk semua komponen.
Pastikan layout responsif dan user-friendly.
Catatan Integrasi
Data bahan baku dan stok dari StokView akan digunakan di ProdukView untuk input resep produk komposit.
Stok bahan baku otomatis berkurang saat transaksi produk komposit di TransaksiView.
---------------------------------------------------------------
Fitur yang Sudah Dibuat
StokView:

Tab Bahan Baku, Stok per Outlet, Mutasi Stok, Monitoring Produk Jadi.
CRUD bahan baku dan stok per outlet, filtering data sesuai business_id (multi-tenant).
Mutasi stok: masuk, keluar, penyesuaian, transfer antar outlet (update stok kedua outlet).
Integrasi Supabase, validasi, dan notifikasi.
Data yang tampil hanya milik bisnis/user aktif.
Perbaikan error Supabase 406 pada pengecekan stok.

Rencana Implementasi Produk Komposit/Bundling di ProdukView
Definisi Produk Komposit/Bundling:

Produk komposit adalah produk yang terdiri dari beberapa bahan baku (resep) atau gabungan beberapa produk/varian.
Stok produk komposit dipengaruhi oleh stok bahan baku dan proses produksi.
Langkah Implementasi:

Tabel Relasi Resep/Komposisi:
Gunakan tabel product_recipes untuk mendefinisikan bahan baku dan jumlah yang digunakan pada setiap produk/varian.
UI ProdukView:
Tambahkan fitur untuk melihat dan mengedit komposisi/resep produk.
Tampilkan detail bahan baku dan jumlah yang dibutuhkan untuk setiap produk/varian.
Monitoring Stok Produk Komposit:
Hitung stok produk komposit berdasarkan stok bahan baku dan jumlah yang tersedia.
Tampilkan peringatan jika stok bahan baku tidak cukup untuk produksi produk komposit.
Proses Produksi/Assembly:
Tambahkan fitur input produksi produk komposit: saat produksi, stok bahan baku otomatis berkurang sesuai resep.
Stok produk komposit bertambah sesuai jumlah produksi.
Validasi Multi-Outlet/Multi-Tenant:
Pastikan semua data dan proses hanya berlaku untuk bisnis dan outlet aktif.
Filtering dan update data sesuai skema di Dokumentasi Database.md.
Best Practice:

Gunakan query join dan filter business_id untuk semua fetch/update data.
Implementasikan notifikasi stok rendah dan monitoring mutasi lintas outlet.
Catatan
Semua pengembangan mengikuti skema dan relasi di Dokumentasi Database.md.
Dokumentasi dan penjelasan alur multi-tenant/multi-outlet sudah disiapkan untuk update internal.