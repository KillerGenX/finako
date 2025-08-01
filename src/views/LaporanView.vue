<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-full pb-8 sm:pb-10 md:pb-12">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Laporan Bisnis</h1>

      <!-- Panel Filter Global - Mobile Optimized -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Rentang Tanggal</label>
          <!-- v-model dan props lainnya TIDAK DIUBAH -->
          <Datepicker 
            v-model="dateValue" 
            range 
            :enable-time-picker="false" 
            :dark="isDarkMode"
            format="dd MMM yyyy"
            locale="id"
            :preset-ranges="presetRanges"
            select-text="Pilih"
            cancel-text="Batal"
            auto-apply
            placeholder="Pilih rentang tanggal"
            class="w-full"
          >
            <template #input-icon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 ml-2 text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>
            </template>
          </Datepicker>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter Outlet</label>
          <!-- v-model TIDAK DIUBAH -->
          <select class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm bg-white" v-model="selectedOutletId">
            <option :value="null">Semua Outlet</option>
            <option v-for="outlet in userStore.accessibleOutlets" :key="outlet.id" :value="outlet.id">
              {{ outlet.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter Pegawai</label>
          <!-- v-model TIDAK DIUBAH -->
          <select class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm bg-white" v-model="selectedEmployeeId">
            <option :value="null">Semua Pegawai</option>
            <option v-for="employee in employeeList" :key="employee.id" :value="employee.id">
              {{ employee.full_name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Navigasi Tab Modern - Mobile Optimized -->
      <div class="border-b border-gray-200 overflow-x-auto">
        <nav class="-mb-px flex space-x-4 sm:space-x-8 px-1" aria-label="Tabs">
          <a href="#" @click.prevent="activeTab = 'penjualan'" :class="[activeTab === 'penjualan' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm min-w-0 flex-shrink-0']">
            <span class="hidden sm:inline">Laporan Penjualan</span>
            <span class="sm:hidden">Penjualan</span>
          </a>
          <a href="#" @click.prevent="activeTab = 'absensi'" :class="[activeTab === 'absensi' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm min-w-0 flex-shrink-0']">
            <span class="hidden sm:inline">Laporan Absensi</span>
            <span class="sm:hidden">Absensi</span>
          </a>
          <a href="#" @click.prevent="activeTab = 'stok'" :class="[activeTab === 'stok' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm min-w-0 flex-shrink-0']">
            <span class="hidden sm:inline">Kartu Stok</span>
            <span class="sm:hidden">Stok</span>
          </a>
        </nav>
      </div>

      <!-- Konten Laporan dalam Card Putih - Mobile Optimized -->
      <div class="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 pb-6 sm:pb-8 md:pb-10">
        <!-- LOGIKA v-if TIDAK DIUBAH -->
        <div v-if="activeTab === 'penjualan'">
          <SalesReport
            :date-range="dateValue"
            :outlet-id="selectedOutletId"
          />
        </div>
        <div v-if="activeTab === 'absensi'">
          <AttendanceReport 
            v-if="dateValue"
            :date-range="dateValue"
            :employee-id="selectedEmployeeId"
          />
        </div>
        <div v-if="activeTab === 'stok'">
            <StockCardReport
                v-if="dateValue && dateValue.length === 2"
                :start-date="dateValue[0]"
                :end-date="dateValue[1]"
                :outlet-id="selectedOutletId"
            />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, onMounted, computed } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import { supabase } from '@/supabase';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import AttendanceReport from '@/components/reports/AttendanceReport.vue';
import SalesReport from '@/components/reports/SalesReport.vue';
import StockCardReport from '@/components/reports/StockCardReport.vue';

const userStore = useUserStoreRefactored();

const activeTab = ref('penjualan');
const selectedOutletId = ref(null);
const selectedEmployeeId = ref(null);
const employeeList = ref([]);

const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 6);

const dateValue = ref([sevenDaysAgo, today]);

const presetRanges = ref([
  { label: 'Hari Ini', range: [new Date(), new Date()] },
  { label: 'Kemarin', range: [new Date(new Date().setDate(new Date().getDate() - 1)), new Date(new Date().setDate(new Date().getDate() - 1))] },
  { label: '7 Hari Terakhir', range: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()] },
  { label: 'Bulan Ini', range: [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0)] },
]);

const isDarkMode = computed(() => {
  if (typeof window !== 'undefined') {
    const theme = document.documentElement.getAttribute('data-theme');
    return ['dark', 'night', 'coffee', 'synthwave'].includes(theme);
  }
  return false;
});

async function fetchEmployeeList() {
    if (!userStore.businessId) return;
    try {
        const ownerProfile = userStore.profile;
        if (!ownerProfile) return;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('business_id', userStore.businessId)
            
        if (error) throw error;

        // Tambahkan Owner ke daftar dan letakkan di paling atas
        const ownerData = { id: ownerProfile.id, full_name: `${ownerProfile.full_name} (Owner)` };
        const employees = data.filter(emp => emp.id !== ownerProfile.id) || [];
        employeeList.value = [ownerData, ...employees];

    } catch(e) {
        console.error("Gagal mengambil daftar pegawai untuk filter:", e);
    }
}

onMounted(() => {
  if (userStore.isReady) {
    fetchEmployeeList();
  } else {
    const unwatch = watch(() => userStore.isReady, (ready) => {
      if(ready) {
        fetchEmployeeList();
        unwatch();
      }
    });
  }
});
</script>

<style>
/* Kustomisasi datepicker untuk mobile */
.dp__input {
  border-radius: var(--rounded-btn, 0.5rem);
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
  min-height: 42px;
}
.dp__input_icon_pad {
  padding-left: 2.5rem;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .dp__input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  /* Ensure dropdown doesn't get cut off */
  .dp__menu {
    transform: translateX(-50%) !important;
    left: 50% !important;
  }
}

/* Touch targets untuk mobile */
@media (max-width: 768px) {
  select {
    min-height: 44px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  /* Tab navigation touch targets */
  nav a {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  
  /* Ensure content doesn't get cut off by mobile navigation */
  .bg-gray-50 {
    padding-bottom: max(2rem, env(safe-area-inset-bottom, 0px) + 1rem);
  }
}

/* Additional mobile spacing */
@media (max-width: 640px) {
  .space-y-4 > * + * {
    margin-top: 1.5rem !important;
  }
  
  .space-y-6 > * + * {
    margin-top: 2rem !important;
  }
}

/* Extra small screens - prevent button overflow */
@media (max-width: 480px) {
  .btn-xs {
    font-size: 0.65rem !important;
    padding: 0.125rem 0.375rem !important;
    min-height: 1.5rem !important;
    line-height: 1.2 !important;
  }
  
  /* Grid layout for very small screens */
  .grid-cols-2 {
    gap: 0.25rem !important;
  }
  
  /* Ensure container padding doesn't cause overflow */
  .p-4 {
    padding: 0.75rem !important;
  }
}
</style>
