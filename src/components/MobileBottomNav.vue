<script setup>
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useSidebarMenu } from '@/composables/useSidebarMenu';

// WAJIB: Gunakan filteredMenu dari useSidebarMenu untuk konsistensi role & plan
const { filteredMenu } = useSidebarMenu();
const route = useRoute();

// Prioritas menu untuk bottom navigation (max 5 items)
const bottomNavMenu = computed(() => {
  const priorityRoutes = ['/', '/transaksi', '/produk', '/laporan', '/pengaturan'];
  
  // Filter menu berdasarkan prioritas dan yang tersedia untuk user
  return priorityRoutes
    .map(routePath => filteredMenu.value.find(menu => menu.route === routePath))
    .filter(Boolean) // Remove undefined items
    .slice(0, 5); // Max 5 items untuk bottom nav
});

// Helper untuk menentukan apakah menu item active
function isActiveRoute(menuRoute) {
  return route.path === menuRoute;
}
</script>

<template>
  <!-- Bottom Navigation - Only visible on mobile -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-40">
    <div class="flex justify-around items-center py-2">
      <RouterLink
        v-for="menu in bottomNavMenu"
        :key="menu.route"
        :to="menu.route"
        class="flex flex-col items-center touch-target px-1 py-2 min-w-0 flex-1"
        :class="[
          isActiveRoute(menu.route) 
            ? 'text-teal-600' 
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        <!-- Icon -->
        <component 
          :is="menu.icon" 
          class="w-6 h-6 mb-1 transition-colors"
          :class="[
            isActiveRoute(menu.route) 
              ? 'text-teal-600' 
              : 'text-gray-500'
          ]"
        />
        
        <!-- Label - Shortened for mobile -->
        <span 
          class="text-xs font-medium truncate w-full text-center transition-colors"
          :class="[
            isActiveRoute(menu.route) 
              ? 'text-teal-600' 
              : 'text-gray-500'
          ]"
        >
          {{ menu.name.replace('(POS)', '').replace('Kasir ', 'POS').trim() }}
        </span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
/* Ensure proper touch targets */
.touch-target {
  min-height: 48px;
  min-width: 48px;
}

/* Active state animation */
.router-link-active {
  @apply text-teal-600;
}

/* Smooth transitions */
.transition-colors {
  transition: color 0.2s ease-in-out;
}
</style>
