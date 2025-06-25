<script setup>
// --- Impor yang sudah ada ---
import { RouterLink } from "vue-router";
import {
  HomeIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ArchiveBoxIcon,
  TagIcon,
  UserGroupIcon, // <-- IKON BARU
} from "@heroicons/vue/24/outline";

// --- BAGIAN BARU UNTUK LOGOUT ---

// Impor fungsi-fungsi yang kita butuhkan untuk logout
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";
// Impor ikon baru untuk tombol logout
import { ArrowLeftOnRectangleIcon } from "@heroicons/vue/24/solid";
import { useUserStore } from "@/stores/userStore";

// Panggil store agar bisa kita gunakan
const userStore = useUserStore();

// Inisialisasi router agar kita bisa mengarahkan pengguna setelah logout
const router = useRouter();

// Fungsi untuk menangani proses logout
async function handleLogout() {
  try {
    // Tampilkan pesan konfirmasi dulu
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      // Kirim perintah signOut ke Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Jika berhasil, arahkan pengguna ke halaman login
      router.push("/login");
    }
  } catch (error) {
    console.error("Error logging out:", error.message);
  }
}
// --- AKHIR BAGIAN BARU ---
</script>

<template>
  <aside class="w-64 bg-base-200 p-4 flex flex-col">
    <div class="text-2xl font-bold text-primary mb-6 text-center">Finako</div>

    <ul class="menu text-base-content flex-grow">
      <li class="menu-title"><span>Menu Utama</span></li>
      <li>
        <RouterLink to="/">
          <HomeIcon class="h-5 w-5" />
          Dasbor
        </RouterLink>
      </li>

      <li class="menu-title"><span>Input Data</span></li>
      <li>
        <RouterLink to="/penjualan">
          <CurrencyDollarIcon class="h-5 w-5" />
          Transaksi Penjualan
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/operasional">
          <BuildingStorefrontIcon class="h-5 w-5" />
          Biaya Operasional
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/produk">
          <ArchiveBoxIcon class="h-5 w-5" />
          Manajemen Produk
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/kategori-biaya">
          <TagIcon class="h-5 w-5" />
          Kategori Biaya
        </RouterLink>
      </li>

      <li class="menu-title"><span>Lainnya</span></li>
      <li v-if="userStore.role === 'owner'">
        <RouterLink to="/pengguna">
          <UserGroupIcon class="h-5 w-5" />
          Manajemen Pengguna
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/pengaturan">
          <Cog6ToothIcon class="h-5 w-5" />
          Pengaturan
        </RouterLink>
      </li>
    </ul>

    <ul class="menu text-base-content">
      <li>
        <a @click="handleLogout">
          <ArrowLeftOnRectangleIcon class="h-5 w-5" />
          Logout
        </a>
      </li>
    </ul>
  </aside>
</template>
