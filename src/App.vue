<script setup>
import { onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRoute } from 'vue-router'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'

const userStore = useUserStore()
const route = useRoute()

// Determine if current route needs authenticated layout
const needsAuthLayout = computed(() => {
  return route.meta?.requiresAuth && userStore.isLoggedIn
})

// Routes that should not use authenticated layout even if requiresAuth is true
const publicRoutes = ['Login', 'Register', 'RegisterSuccess', 'PaymentInfo', 'Onboarding']
const isPublicRoute = computed(() => {
  return publicRoutes.includes(route.name)
})

const shouldUseAuthLayout = computed(() => {
  const result = needsAuthLayout.value && !isPublicRoute.value
  console.log('Layout decision:', {
    routeName: route.name,
    needsAuthLayout: needsAuthLayout.value,
    isPublicRoute: isPublicRoute.value,
    shouldUseAuthLayout: result,
    isLoggedIn: userStore.isLoggedIn
  })
  return result
})

onMounted(() => {
  // Panggil fetchUserProfile saat app pertama kali dimuat
  userStore.fetchUserProfile()
})
</script>

<template>
  <div v-if="!userStore.isReady" class="flex h-screen items-center justify-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
  
  <!-- Use authenticated layout for protected routes -->
  <LayoutAuthenticated v-else-if="shouldUseAuthLayout">
    <router-view />
  </LayoutAuthenticated>
  
  <!-- Use simple layout for public routes -->
  <router-view v-else />
</template>