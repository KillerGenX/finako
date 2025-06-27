<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

onMounted(() => {
  // Panggil fetchUserProfile saat app pertama kali dimuat
  userStore.fetchUserProfile()
})
</script>

<template>
  <div v-if="!userStore.isReady" class="flex h-screen items-center justify-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
  <router-view v-else />
</template>