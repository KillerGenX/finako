// File: src/components/Sidebar.vue (VERSI PERBAIKAN)

<script setup>
// --- Impor dari Library dan Komponen ---
import { RouterLink, useRouter } from 'vue-router';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';

// --- Impor Ikon ---
import {
  HomeIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ArchiveBoxIcon,
  TagIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/outline';


// --- Inisialisasi ---
const router = useRouter();
// Panggil store agar kita bisa mengakses state dan getter (misal: userStore.userRole)
const userStore = useUserStore();


// --- Fungsi ---

// Fungsi untuk menangani proses logout
async function handleLogout() {
  try {
    // Tampilkan pesan konfirmasi untuk pengalaman pengguna yang lebih baik
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      
      // Kirim perintah signOut ke Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error; // Jika gagal, hentikan proses

      // --- PERBAIKAN DI SINI ---
      // Panggil action dari store untuk membersihkan semua data pengguna (session, profile, role).
      // Ini penting agar tidak ada data lama yang tersisa.
      userStore.clearUserProfile();

      // Jika logout dan pembersihan state berhasil, arahkan pengguna ke halaman login.
      router.push("/login");
    }
  } catch (error) {
    // Tampilkan error di console jika proses logout gagal
    console.error("Error saat logout:", error.message);
  }
}
</script>

<template>
  <aside class="w-64 bg-base-200 p-4 flex flex-col">
    <div class="text-2xl font-bold text-primary mb-6 text-center">
      Finako
    </div>

    <ul class="menu text-base-content flex-grow">
      <li class="menu-title"><span>Menu Utama</span></li>
      <li>
        <RouterLink to="/">
          <HomeIcon class="h-5 w-5" /> Dasbor
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/penjualan">
          <CurrencyDollarIcon class="h-5 w-5" /> Transaksi Penjualan
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/operasional">
          <BuildingStorefrontIcon class="h-5 w-5" /> Biaya Operasional
        </RouterLink>
      </li>

      <template v-if="userStore.userRole === 'owner'">
        <li class="menu-title"><span>Manajemen Owner</span></li>
        <li>
          <RouterLink to="/produk">
            <ArchiveBoxIcon class="h-5 w-5" /> Manajemen Produk
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/kategori-biaya">
            <TagIcon class="h-5 w-5" /> Kategori Biaya
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/pengguna">
            <UserGroupIcon class="h-5 w-5" /> Manajemen Pengguna
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/pengaturan">
            <Cog6ToothIcon class="h-5 w-5" /> Pengaturan
          </RouterLink>
        </li>
      </template>
    </ul>

    <ul class="menu text-base-content">
      <li>
        <a @click="handleLogout" class="cursor-pointer">
          <ArrowLeftOnRectangleIcon class="h-5 w-5" />
          Logout
        </a>
      </li>
    </ul>
  </aside>
</template>