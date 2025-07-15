<script setup>
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
// Store yang kita butuhkan untuk UI (toggle) dan data user (logout)
import { useUserStoreRefactored, useUIStore } from '@/stores/userStoreRefactored'; 
import { useSidebarMenu } from '@/composables/useSidebarMenu';

// Impor semua ikon yang kita butuhkan
import { ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/outline';
import { ChevronDoubleLeftIcon } from '@heroicons/vue/24/solid';


const emit = defineEmits(['show-tooltip', 'hide-tooltip']);

// 1. Inisialisasi store yang BENAR
const userStore = useUserStoreRefactored();
const uiStore = useUIStore(); // Gunakan UI store untuk sidebar collapse

// 2. Ambil state `isSidebarCollapsed` yang REAKTIF dari uiStore
const { isSidebarCollapsed } = storeToRefs(uiStore);

// 3. Panggil composable baru kita. Ia akan memberikan menu yang sudah reaktif.
const { filteredMenu } = useSidebarMenu();

// 4. Fungsi handleLogout sekarang cukup memanggil fungsi dari store.
// Store akan menangani pembersihan data dan redirect.
function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    userStore.logout();
  }
}

// Fungsi tooltip tidak berubah
function showTooltip(event, text) {
  if (isSidebarCollapsed.value) { // Gunakan state reaktif
    emit('show-tooltip', { event, text });
  }
}
function hideTooltip() {
  if (isSidebarCollapsed.value) { // Gunakan state reaktif
    emit('hide-tooltip');
  }
}
</script>

<template>
  <aside 
    class="bg-base-100 text-base-content flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shadow-lg"
    :class="isSidebarCollapsed ? 'w-20' : 'w-64'"
  >
    <div class="h-16 flex items-center justify-center p-4">
      <RouterLink to="/" class="min-w-max flex items-center gap-2">
        <img src="/finako.svg" alt="Finako Logo" class="h-20 w-15" />
      </RouterLink>
    </div>

    <div class="flex-grow overflow-y-auto overflow-x-hidden">
      <!-- 5. Loop langsung ke `filteredMenu` -->
      <ul class="menu p-2 space-y-1">
        <li v-for="menu in filteredMenu" :key="menu.route">
          <RouterLink :to="menu.route" @mouseenter="showTooltip($event, menu.name)" @mouseleave="hideTooltip" class="items-center">
            <component :is="menu.icon" class="h-6 w-6 shrink-0" />
            <span v-if="!isSidebarCollapsed">{{ menu.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
    
    <ul class="menu p-2 sticky bottom-0 bg-base-100">
      <li>
        <a @click="handleLogout" @mouseenter="showTooltip($event, 'Logout')" @mouseleave="hideTooltip" class="items-center">
          <ArrowLeftOnRectangleIcon class="h-6 w-6 shrink-0" />
          <span v-if="!isSidebarCollapsed">Logout</span>
        </a>
      </li>
      <li>
        <!-- 6. Panggil fungsi toggle dari `uiStore` -->
        <a @click="uiStore.toggleSidebar" class="items-center" @mouseenter="showTooltip($event, isSidebarCollapsed ? 'Perbesar' : 'Kecilkan')" @mouseleave="hideTooltip">
          <ChevronDoubleLeftIcon 
            class="h-6 w-6 shrink-0 transition-transform duration-300"
            :class="{ 'rotate-180': isSidebarCollapsed }"
          />
          <span v-if="!isSidebarCollapsed">Kecilkan</span>
        </a>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
/* Style ini tidak berubah dan sudah benar */
.menu li > a.router-link-active, .menu li > a.router-link-exact-active {
  background-color: hsl(var(--p));
  color: hsl(var(--pc));
  font-weight: 600;
}
</style>