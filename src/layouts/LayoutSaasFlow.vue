<template>
    <div class="min-h-screen bg-gray-50">
      <!-- Di sini kita bisa menaruh header atau footer global untuk alur ini jika perlu -->
      <main>
        <slot />
      </main>
      
      <!-- Toast Notifikasi Global, kita letakkan juga di sini agar tetap berfungsi -->
      <div class="toast toast-top toast-end z-[9999]" :key="uiStore.notification.key">
        <div v-if="uiStore.notification.message" :class="`alert alert-${uiStore.notification.type} shadow-lg`">
          <span>{{ uiStore.notification.message }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // Kita butuh uiStore untuk menampilkan notifikasi
  import { useUIStore } from '@/stores/userStoreRefactored';
  const uiStore = useUIStore();
  </script>