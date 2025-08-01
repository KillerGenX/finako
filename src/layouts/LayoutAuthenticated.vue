<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Sidebar from '@/components/Sidebar.vue';
import CustomTooltip from '@/components/CustomTooltip.vue';
import MobileBottomNav from '@/components/MobileBottomNav.vue';

// Impor KEDUA store yang diekspor dari file userStoreRefactored.js
import { useUserStoreRefactored, useUIStore } from '@/stores/userStoreRefactored';

// Inisialisasi KEDUANYA dengan nama variabel yang berbeda dan jelas
const userStore = useUserStoreRefactored();
const uiStore = useUIStore();
const { isSidebarCollapsed } = storeToRefs(uiStore);

// Auto-collapse sidebar on mobile devices on first load
onMounted(() => {
  if (window.innerWidth < 768) {
    uiStore.setSidebarCollapsed(true);
  }
});

// --- Logika Tooltip Anda (Tidak Berubah) ---
const tooltipVisible = ref(false);
const tooltipText = ref('');
const tooltipPosition = ref({ top: 0, left: 0 });
let tooltipTimeout = null;

function handleShowTooltip({ event, text }) {
  const rect = event.currentTarget.getBoundingClientRect();
  clearTimeout(tooltipTimeout);
  tooltipText.value = text;
  tooltipPosition.value = {
    top: rect.top + rect.height / 2 - 18,
    left: rect.right + 12
  };
  tooltipVisible.value = true;
}

function handleHideTooltip() {
  tooltipTimeout = setTimeout(() => {
    tooltipVisible.value = false;
  }, 100);
}
</script>
<template>
  <div class="bg-base-300 min-h-screen">
    <!-- Mobile Header with Hamburger -->
    <header class="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-30">
      <button 
        @click="uiStore.toggleSidebar"
        class="touch-target flex items-center justify-center text-gray-600 hover:text-gray-800"
        :aria-label="isSidebarCollapsed ? 'Buka menu' : 'Tutup menu'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            :d="isSidebarCollapsed ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'"
          />
        </svg>
      </button>
      
      <!-- Enhanced Finako Logo for Mobile -->
      <div class="flex items-center space-x-2">
        <img src="/finako.svg" alt="Finako" class="h-10 w-14 object-contain" />
        <span class="font-bold text-lg text-teal-700 tracking-wide"></span>
      </div>
      
      <div class="w-10"></div> <!-- Spacer for centering logo -->
    </header>

    <div class="flex">
      <Sidebar @show-tooltip="handleShowTooltip" @hide-tooltip="handleHideTooltip" />

      <main class="flex-1 overflow-y-auto mobile-padding md:p-4 lg:p-8 pb-20 md:pb-4">
        <slot />
      </main>
    </div>
    
    <!-- Mobile Bottom Navigation -->
    <MobileBottomNav />
    
    <CustomTooltip 
      :visible="tooltipVisible" 
      :text="tooltipText" 
      :position="tooltipPosition"
    />

    <div class="toast toast-top toast-end z-[9999]" :key="uiStore.notification.key">
  <div v-if="uiStore.notification.message" :class="`alert alert-${uiStore.notification.type} shadow-lg`">
    <span>{{ uiStore.notification.message }}</span>
  </div>
</div>
  </div>
</template>