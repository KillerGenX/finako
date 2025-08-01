<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full pb-20 sm:pb-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header dengan User Greeting -->
      <div class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Pengaturan</h1>
            <p class="text-gray-600 text-sm sm:text-base">
              {{ isOwner ? 'Kelola informasi usaha, outlet, dan pegawai Anda di sini.' : 'Kelola informasi akun Anda di sini.' }}
            </p>
          </div>
          <div class="flex items-center gap-3 text-sm text-gray-600">
            <div class="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {{ (userStore.user?.user_metadata?.full_name || userStore.userFullName || 'U').charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-medium text-gray-800">{{ userStore.user?.user_metadata?.full_name || userStore.userFullName || 'User' }}</div>
              <div class="text-xs">{{ 
                typeof userStore.activeRole === 'string' 
                  ? userStore.activeRole 
                  : userStore.activeRole?.name || 'User' 
              }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Tab Navigation (Dropdown Style) -->
      <div class="sm:hidden mb-6">
        <div class="relative">
          <button 
            @click="showMobileMenu = !showMobileMenu"
            class="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm"
          >
            <span class="font-medium text-gray-800">{{ getTabLabel(activeTab) }}</span>
            <svg class="w-5 h-5 text-gray-400 transition-transform" :class="{ 'rotate-180': showMobileMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div v-if="showMobileMenu" class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10">
            <button
              @click="selectTab('akun')"
              class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
              :class="{ 'bg-teal-50 text-teal-600 font-medium': activeTab === 'akun' }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Info Akun
            </button>
            
            <template v-if="isOwner">
              <button
                @click="selectTab('usaha')"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100"
                :class="{ 'bg-teal-50 text-teal-600 font-medium': activeTab === 'usaha' }"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Info Usaha
              </button>

              <button
                @click="selectTab('outlet')"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100"
                :class="{ 'bg-teal-50 text-teal-600 font-medium': activeTab === 'outlet' }"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Outlet
              </button>

              <button
                @click="selectTab('pegawai')"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100"
                :class="{ 'bg-teal-50 text-teal-600 font-medium': activeTab === 'pegawai' }"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Pegawai
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Desktop Tab Navigation -->
      <div class="hidden sm:block border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button 
            @click="activeTab = 'akun'" 
            :class="[
              activeTab === 'akun' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Info Akun
          </button>
          
          <template v-if="isOwner">
            <button 
              @click="activeTab = 'usaha'" 
              :class="[
                activeTab === 'usaha' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Info Usaha
            </button>

            <button 
              @click="activeTab = 'outlet'" 
              :class="[
                activeTab === 'outlet' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Outlet
            </button>

            <button 
              @click="activeTab = 'pegawai'" 
              :class="[
                activeTab === 'pegawai' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pegawai
            </button>
          </template>
        </nav>
      </div>

      <!-- Area Konten Tab dengan Animasi -->
      <div class="transition-all duration-300 ease-in-out">
        <div v-if="activeTab === 'akun'" class="animate-fade-in">
          <AccountInfoPanel />
        </div>
        <div v-if="activeTab === 'usaha' && isOwner" class="animate-fade-in">
          <BusinessInfoPanel />
        </div>
        <div v-if="activeTab === 'outlet' && isOwner" class="animate-fade-in">
          <OutletsPanel />
        </div>
        <div v-if="activeTab === 'pegawai' && isOwner" class="animate-fade-in">
          <EmployeesPanel />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import AccountInfoPanel from '@/components/settings/AccountInfoPanel.vue';
import BusinessInfoPanel from '@/components/settings/BusinessInfoPanel.vue';
import OutletsPanel from '@/components/settings/OutletsPanel.vue';
import EmployeesPanel from '@/components/settings/EmployeesPanel.vue';

const userStore = useUserStoreRefactored();

const activeTab = ref('akun'); // Default ke Info Akun
const showMobileMenu = ref(false);

// Check if user is owner/admin
const isOwner = computed(() => {
  // activeRole bisa berupa string langsung atau object dengan property name
  const roleName = (typeof userStore.activeRole === 'string' 
    ? userStore.activeRole 
    : userStore.activeRole?.name)?.toLowerCase();
  
  return roleName === 'owner' || roleName === 'admin' || roleName === 'pemilik';
});

onMounted(() => {
  // Jika bukan owner, pastikan tab default adalah 'akun'
  if (!isOwner.value) {
    activeTab.value = 'akun';
  }
});

const getTabLabel = (tab) => {
  const labels = {
    'akun': 'Info Akun',
    'usaha': 'Info Usaha', 
    'outlet': 'Outlet',
    'pegawai': 'Pegawai'
  };
  return labels[tab] || 'Info Akun';
};

const selectTab = (tab) => {
  // Jika bukan owner, hanya boleh akses tab 'akun'
  if (!isOwner.value && tab !== 'akun') {
    return;
  }
  
  activeTab.value = tab;
  showMobileMenu.value = false;
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Custom scrollbar untuk mobile menu */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
