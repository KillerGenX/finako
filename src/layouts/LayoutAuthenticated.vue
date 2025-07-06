<script setup>
// --- Impor dari Vue dan komponen lain ---
import { ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import CustomTooltip from '@/components/CustomTooltip.vue';

// --- Impor Pinia Store untuk mengakses state global ---
import { useUserStore } from '@/stores/userStore';

// Inisialisasi store
const userStore = useUserStore();

// --- Logika untuk Tooltip (Tidak ada perubahan, sudah benar) ---
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
    <div class="flex">
      <Sidebar @show-tooltip="handleShowTooltip" @hide-tooltip="handleHideTooltip" />

      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
    
    <CustomTooltip 
      :visible="tooltipVisible" 
      :text="tooltipText" 
      :position="tooltipPosition"
    />

    <div class="toast toast-top toast-end z-[9999]" :key="userStore.notification.key">
      <div v-if="userStore.notification.message" :class="`alert alert-${userStore.notification.type} shadow-lg`">
        <span>{{ userStore.notification.message }}</span>
      </div>
    </div>
  </div>
</template>