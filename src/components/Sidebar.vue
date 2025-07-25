<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUserStoreRefactored, useUIStore } from '@/stores/userStoreRefactored'; 
import { useSidebarMenu } from '@/composables/useSidebarMenu';
import { ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/outline';
import { ChevronDoubleLeftIcon } from '@heroicons/vue/24/solid';

const emit = defineEmits(['show-tooltip', 'hide-tooltip']);

const userStore = useUserStoreRefactored();
const uiStore = useUIStore();
const { isSidebarCollapsed } = storeToRefs(uiStore);
const { filteredMenu } = useSidebarMenu();

function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    userStore.logout();
  }
}

function showTooltip(event, text) {
  if (isSidebarCollapsed.value) {
    emit('show-tooltip', { event, text });
  }
}
function hideTooltip() {
  if (isSidebarCollapsed.value) {
    emit('hide-tooltip');
  }
}
</script>

<template>
  <aside 
    class="bg-white text-gray-700 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-gray-200"
    :class="isSidebarCollapsed ? 'w-20' : 'w-64'"
  >
    <!-- Area Logo dengan Separator -->
    <div class="h-16 flex items-center justify-center p-4 border-b border-gray-200">
      <RouterLink to="/" class="min-w-max flex items-center gap-3">
        <img src="/finako.svg" alt="Finako Logo" class="h-20 w-12" />
        <span v-if="!isSidebarCollapsed" class="text-xl font-bold text-gray-800 tracking-wider"></span>
      </RouterLink>
    </div>

    <!-- Daftar Menu Utama -->
    <div class="flex-grow overflow-y-auto overflow-x-hidden">
      <ul class="menu p-2 space-y-1">
        <li v-for="menu in filteredMenu" :key="menu.route">
          <RouterLink 
            :to="menu.route" 
            @mouseenter="showTooltip($event, menu.name)" 
            @mouseleave="hideTooltip" 
            class="flex items-center"
          >
            <component :is="menu.icon" class="h-6 w-6 shrink-0" />
            <span v-if="!isSidebarCollapsed" class="ml-3">{{ menu.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
    
    <!-- Area Kontrol Bawah dengan Separator -->
    <div class="p-2 border-t border-gray-200">
        <ul class="menu space-y-1">
            <li>
                <a @click="handleLogout" @mouseenter="showTooltip($event, 'Logout')" @mouseleave="hideTooltip" class="flex items-center">
                <ArrowLeftOnRectangleIcon class="h-6 w-6 shrink-0" />
                <span v-if="!isSidebarCollapsed" class="ml-3">Logout</span>
                </a>
            </li>
            <li>
                <a @click="uiStore.toggleSidebar" class="flex items-center" @mouseenter="showTooltip($event, isSidebarCollapsed ? 'Perbesar' : 'Kecilkan')" @mouseleave="hideTooltip">
                <ChevronDoubleLeftIcon 
                    class="h-6 w-6 shrink-0 transition-transform duration-300"
                    :class="{ 'rotate-180': isSidebarCollapsed }"
                />
                <span v-if="!isSidebarCollapsed" class="ml-3">Kecilkan</span>
                </a>
            </li>
        </ul>
    </div>
  </aside>
</template>

<style scoped>
/* Gaya kustom untuk tema terang */
.menu li > a {
  border-radius: 0.375rem; /* rounded-md */
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

.menu li > a:hover {
  background-color: #f3f4f6; /* gray-100 */
  color: #1f2937; /* gray-800 */
}

/* Gaya untuk item menu yang aktif */
.menu li > a.router-link-active,
.menu li > a.router-link-exact-active {
  background-color: #f0fdfa; /* teal-50 */
  color: #0d9488; /* teal-600 */
  font-weight: 600;
}

/* Menyesuaikan posisi ikon saat sidebar diperkecil */
.menu li > a {
    justify-content: flex-start;
}
:is(aside.w-20 .menu li > a) {
    justify-content: center;
}
</style>
