<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';

const userStore = useUserStoreRefactored();
const route = useRoute();

userStore.fetchUserSession();

const shouldUseAuthLayout = computed(() => {
  const needsAuth = route.meta?.requiresAuth;

  // ===============================================
  // === INI PERBAIKANNYA ===
  // ===============================================
  // Definisikan semua halaman yang harus menggunakan LAYOUT LAYAR PENUH (tanpa sidebar)
  const isFullScreenPage = [
    'Login', 
    'Register', 
    'RegisterSuccess',
    'PaymentInfo',      // <-- TAMBAHKAN INI
    'Onboarding'        // <-- TAMBAHKAN INI JUGA
  ].includes(route.name);
  // ===============================================

  // Layout otentikasi (dengan sidebar) digunakan jika:
  // - Route memerlukan otentikasi
  // - Pengguna sudah login
  // - DAN HALAMAN ITU BUKAN HALAMAN LAYAR PENUH
  return needsAuth && userStore.isLoggedIn && !isFullScreenPage;
});
</script>

<template>
  <!-- Template Anda tidak perlu diubah sama sekali -->
  <div v-if="!userStore.isReady" class="flex h-screen items-center justify-center bg-base-100">
    <span class="loading loading-spinner loading-lg"></span>
    <p class="ml-4 text-lg">Memuat Sesi Finako...</p>
  </div>
  
  <LayoutAuthenticated v-else-if="shouldUseAuthLayout">
    <router-view />
  </LayoutAuthenticated>
  
  <router-view v-else />
</template>