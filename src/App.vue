<!-- File: src/App.vue (VERSI FINAL YANG DIPERBAIKI) -->
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';

// ===================================
// === BAGIAN UTAMA YANG DIPERBAIKI ===
// ===================================

// 1. Impor HANYA store baru yang sudah di-refactor.
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';

// 2. Inisialisasi store baru.
const userStore = useUserStoreRefactored();

// 3. Panggil fungsi untuk mengambil data user dari store BARU kita.
// Ini adalah satu-satunya pemicu yang kita butuhkan untuk seluruh aplikasi.
// Panggilan ini akan mengisi `isReady`, `businessId`, `profile`, dll.
// di `userStoreRefactored`.
userStore.fetchUserSession();

// ===================================

// Sisa kode di bawah ini TIDAK BERUBAH, tapi sekarang ia menggunakan `userStoreRefactored`
const route = useRoute();

const shouldUseAuthLayout = computed(() => {
    // Logika layout Anda sudah bagus, kita hanya perlu pastikan ia
    // menggunakan `userStore` yang benar. Karena kita sudah menimpa
    // variabel `userStore` di atas, kode di bawah ini akan
    // secara otomatis menggunakan store yang baru.

    const needsAuth = route.meta?.requiresAuth;
    const isPublic = ['Login', 'Register', 'RegisterSuccess'].includes(route.name);

    // Layout otentikasi digunakan jika:
    // - Route memerlukan auth (true)
    // - Pengguna sudah login (true)
    // - Route tersebut BUKAN halaman publik seperti Login/Register (false)
    return needsAuth && userStore.isLoggedIn && !isPublic;
})
</script>

<template>
  <!-- Tampilkan spinner loading HANYA jika store baru kita chưa siap -->
  <div v-if="!userStore.isReady" class="flex h-screen items-center justify-center bg-base-100">
    <span class="loading loading-spinner loading-lg"></span>
    <p class="ml-4 text-lg">Memuat Sesi Finako...</p>
  </div>
  
  <!-- Setelah siap, gunakan logika layout seperti sebelumnya -->
  <LayoutAuthenticated v-else-if="shouldUseAuthLayout">
    <router-view />
  </LayoutAuthenticated>
  
  <router-view v-else />
</template>