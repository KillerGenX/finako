<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-full">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Laporan Bisnis</h1>

      <!-- Panel Filter Global dengan Gaya Baru -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Rentang Tanggal</label>
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
          >
            <template #input-icon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 ml-2 text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>
            </template>
          </Datepicker>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter Outlet</label>
          <!-- v-model TIDAK DIUBAH -->
          <select class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm" v-model="selectedOutletId">
            <option :value="null">Semua Outlet</option>
            <option v-for="outlet in userStore.accessibleOutlets" :key="outlet.id" :value="outlet.id">
              {{ outlet.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter Pegawai</label>
          <!-- v-model TIDAK DIUBAH -->
          <select class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm" v-model="selectedEmployeeId">
            <option :value="null">Semua Pegawai</option>
            <option v-for="employee in employeeList" :key="employee.id" :value="employee.id">
              {{ employee.full_name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Navigasi Tab Modern -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <a href="#" @click.prevent="activeTab = 'penjualan'" :class="[activeTab === 'penjualan' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
            Laporan Penjualan
          </a>
          <a href="#" @click.prevent="activeTab = 'absensi'" :class="[activeTab === 'absensi' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
            Laporan Absensi
          </a>
          <a href="#" @click.prevent="activeTab = 'stok'" :class="[activeTab === 'stok' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
            Kartu Stok
          </a>
        </nav>
      </div>

      <!-- Konten Laporan dalam Card Putih -->
      <div class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
/* Kustomisasi kecil agar datepicker terlihat lebih menyatu */
.dp__input {
  border-radius: var(--rounded-btn, 0.5rem);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.dp__input_icon_pad {
  padding-left: 2.5rem;
}
</style>
