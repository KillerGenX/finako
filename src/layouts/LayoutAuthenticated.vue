<script setup>
// Impor komponen Sidebar yang baru kita buat
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-base-300">
    <Sidebar />

    <div class="flex-1 p-8 overflow-y-auto">
      <main>
        <router-view />
      </main>
    </div>
  </div>
</template>