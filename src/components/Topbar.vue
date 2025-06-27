<script setup>
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
</script>

<template>
  <header class="navbar bg-base-100 border-b border-base-300 shadow-sm">
    <!-- Kiri -->
    <div class="flex-1">
      <span class="text-xl font-bold text-primary">Finako</span>
    </div>

    <!-- Kanan -->
    <div class="flex-none space-x-3 flex items-center">
      <span class="text-sm text-gray-500">Hi, {{ userStore.profile?.full_name || 'User' }}</span>
      <div class="avatar">
        <div class="w-8 rounded-full">
          <img src="https://placehold.co/100x100?text=U" alt="Avatar" />
        </div>
      </div>
    </div>
  </header>
</template>
