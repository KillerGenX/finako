<template>
  <div class="p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Laporan Bisnis</h1>

      <!-- ===== FILTER GLOBAL ===== -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-base-200 rounded-lg">
        
        <!-- ======================================================= -->
        <!-- === BAGIAN DATEPICKER YANG DIGANTI === -->
        <!-- ======================================================= -->
        <div class="form-control">
          <label class="label"><span class="label-text">Pilih Rentang Tanggal</span></label>
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 ml-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-7.5 12h18" />
              </svg>
            </template>
          </Datepicker>
        </div>
        
        <!-- Filter Pegawai (TIDAK BERUBAH) -->
        <div class="form-control">
          <label class="label"><span class="label-text">Filter Outlet</span></label>
          <select class="select select-bordered w-full" v-model="selectedOutletId">
            <option :value="null">Semua Outlet</option>
            <option v-for="outlet in userStore.accessibleOutlets" :key="outlet.id" :value="outlet.id">
              {{ outlet.name }}
            </option>
          </select>
        </div>

        <!-- Filter Pegawai -->
        <div class="form-control">
          <label class="label"><span class="label-text">Filter Pegawai</span></label>
          <select class="select select-bordered w-full" v-model="selectedEmployeeId">
            <option :value="null">Semua Pegawai</option>
            <option v-for="employee in employeeList" :key="employee.id" :value="employee.id">
              {{ employee.full_name }}
            </option>
          </select>
        </div>

      </div>

      <!-- ===== NAVIGASI TAB (TIDAK BERUBAH) ===== -->
      <div role="tablist" class="tabs tabs-lifted tabs-lg">
        <a role="tab" class="tab" :class="{'tab-active': activeTab === 'absensi'}" @click="activeTab = 'absensi'">
          Laporan Absensi
        </a>
        <a role="tab" class="tab" @click="activeTab = 'penjualan'" :class="{'tab-active': activeTab === 'penjualan'}">
          Laporan Penjualan
        </a>
      </div>

      <!-- ===== KONTEN LAPORAN (PENYESUAIAN KECIL PADA PROPS) ===== -->
      <div class="bg-base-100 rounded-b-lg p-6 shadow-md -mt-px pt-10">
        <div v-if="activeTab === 'absensi'">
          <!-- Prop yang dikirim sekarang menjadi 'dateRange' (array) -->
          <AttendanceReport 
            v-if="dateValue"
            :date-range="dateValue"
            :employee-id="selectedEmployeeId"
          />
        </div>
        <div v-if="activeTab === 'penjualan'">
          <SalesReport
  :date-range="dateValue"
  :outlet-id="selectedOutletId"
/>
  </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// =======================================================
// === BAGIAN SCRIPT YANG DISESUAIKAN ===
// =======================================================
import { ref, onMounted, computed } from 'vue';
// Import library baru dan CSS-nya
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// Import lain (TIDAK BERUBAH)
import { supabase } from '@/supabase';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import AttendanceReport from '@/components/reports/AttendanceReport.vue';
import SalesReport from '@/components/reports/SalesReport.vue';

const userStore = useUserStoreRefactored();

// State Filter (TIDAK BERUBAH)
const activeTab = ref('absensi');
const selectedOutletId = ref(null);
const selectedEmployeeId = ref(null);
const employeeList = ref([]);

// State untuk Datepicker BARU
const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 6);

// Library ini menggunakan format array: [startDate, endDate]
const dateValue = ref([sevenDaysAgo, today]);

// Menambahkan preset tanggal yang praktis
const presetRanges = ref([
  { label: 'Hari Ini', range: [new Date(), new Date()] },
  { label: 'Kemarin', range: [new Date(new Date().setDate(new Date().getDate() - 1)), new Date(new Date().setDate(new Date().getDate() - 1))] },
  { label: '7 Hari Terakhir', range: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()] },
  { label: 'Bulan Ini', range: [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0)] },
]);

// Helper untuk styling datepicker sesuai tema DaisyUI
const isDarkMode = computed(() => {
  if (typeof window !== 'undefined') {
    const theme = document.documentElement.getAttribute('data-theme');
    // Tambahkan nama-nama tema gelap Anda di sini
    return ['dark', 'night', 'coffee', 'synthwave'].includes(theme);
  }
  return false;
});

// Fungsi untuk mengambil daftar pegawai (TIDAK BERUBAH)
async function fetchEmployeeList() {
    if (!userStore.businessId) return;
    try {
        const ownerRoleId = userStore.profile?.role_id;
        if (!ownerRoleId) return;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('business_id', userStore.businessId)
            .neq('role_id', ownerRoleId); 
            
        if (error) throw error;
        employeeList.value = data || [];
    } catch(e) {
        console.error("Gagal mengambil daftar pegawai untuk filter:", e);
    }
}

// onMounted (TIDAK BERUBAH)
onMounted(() => {
  fetchEmployeeList();
});
</script>

<style>
/* Kustomisasi kecil agar datepicker terlihat lebih menyatu dengan DaisyUI */
.dp__input {
  border-color: hsl(var(--b2, var(--bc))); /* Warna border dari DaisyUI */
  border-radius: var(--rounded-btn, 0.5rem);
}
.dp__input:hover {
  border-color: hsl(var(--b3));
}
.dp__input_readonly {
  background-color: hsl(var(--b1));
}
</style>