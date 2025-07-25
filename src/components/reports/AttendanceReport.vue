<template>
    <div class="space-y-6">
      <!-- Header Panel Laporan -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 class="text-xl font-bold text-gray-800">Laporan Absensi</h3>
        <button 
          @click="handleExport" 
          class="btn btn-outline border-gray-300 btn-sm" 
          :disabled="isLoading || !reportData || reportData.length === 0"
        >
          <span v-if="isExporting" class="loading loading-spinner loading-xs"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Ekspor ke Excel
        </button>
      </div>
  
      <!-- Tampilan Loading -->
      <div v-if="isLoading" class="text-center py-20">
        <span class="loading loading-spinner loading-lg text-teal-600"></span>
        <p class="mt-4 text-gray-600">Memuat data laporan absensi...</p>
      </div>
  
      <!-- Tampilan Error -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
        <p class="text-sm text-red-700">Error: {{ error }}</p>
      </div>
  
      <!-- Tabel Laporan dengan Gaya Baru -->
      <div v-else class="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table class="table-auto w-full text-sm">
            <thead class="bg-gray-50 text-left text-gray-600">
              <tr>
                <th class="px-6 py-3 font-medium">Pegawai</th>
                <th class="px-6 py-3 font-medium">Tanggal</th>
                <th class="px-6 py-3 font-medium">Clock In</th>
                <th class="px-6 py-3 font-medium">Clock Out</th>
                <th class="px-6 py-3 font-medium">Durasi</th>
                <th class="px-6 py-3 font-medium">Bukti</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="!reportData || reportData.length === 0">
                  <td colspan="6" class="text-center py-12 text-gray-500">
                      <p class="font-semibold">Tidak Ada Data</p>
                      <p>Tidak ada catatan absensi untuk filter yang Anda pilih.</p>
                  </td>
              </tr>
              <!-- KODE YANG DIPERBAIKI ADA DI SINI -->
              <tr v-for="(item, index) in reportData" :key="item.clock_in + index">
                <td class="px-6 py-4">
                    <p class="font-semibold text-gray-800">{{ item.employee_name }}</p>
                    <p class="text-xs text-gray-500">{{ item.outlet_name }}</p>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ new Date(item.clock_in).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) }}</td>
                <td class="px-6 py-4 font-mono">{{ new Date(item.clock_in).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}) }}</td>
                <td class="px-6 py-4">
                  <span v-if="item.clock_out" class="font-mono">{{ new Date(item.clock_out).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}) }}</span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Belum Clock Out</span>
                </td>
                <td class="px-6 py-4 font-mono font-semibold">{{ formatDuration(item.duration_in_minutes) }}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <div class="tooltip" data-tip="Lihat Foto Masuk">
                            <button @click="viewPhoto(item.clock_in_photo_path)" :disabled="!item.clock_in_photo_path" class="p-1.5 text-gray-400 rounded-full hover:bg-green-100 hover:text-green-600 disabled:hover:bg-transparent disabled:text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg></button>
                        </div>
                        <div class="tooltip" data-tip="Lihat Lokasi Masuk">
                            <button @click="openLocationTab(item.clock_in_latitude, item.clock_in_longitude)" :disabled="!item.clock_in_latitude" class="p-1.5 text-gray-400 rounded-full hover:bg-green-100 hover:text-green-600 disabled:hover:bg-transparent disabled:text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg></button>
                        </div>
                        <div class="tooltip" data-tip="Lihat Foto Keluar">
                            <button @click="viewPhoto(item.clock_out_photo_path)" :disabled="!item.clock_out_photo_path" class="p-1.5 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 disabled:hover:bg-transparent disabled:text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg></button>
                        </div>
                        <div class="tooltip" data-tip="Lihat Lokasi Keluar">
                            <button @click="openLocationTab(item.clock_out_latitude, item.clock_out_longitude)" :disabled="!item.clock_out_latitude" class="p-1.5 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 disabled:hover:bg-transparent disabled:text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg></button>
                        </div>
                    </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <dialog class="modal" :class="{'modal-open': photoUrl}">
        <div class="modal-box">
          <div v-if="photoLoading" class="text-center p-8"><span class="loading loading-spinner text-teal-600"></span></div>
          <img v-else :src="photoUrl" alt="Bukti Absensi" class="w-full h-auto rounded-lg">
          <div class="modal-action">
            <button class="btn" @click="photoUrl = null; photoLoading = false;">Tutup</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="photoUrl = null; photoLoading = false;">close</button>
        </form>
      </dialog>
    
</template>
  
<script setup>
// SCRIPT TIDAK DIUBAH
import { ref, watch, computed } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import { supabase } from '@/supabase';
import { useExporter } from '@/composables/useExporter';

const props = defineProps({
  dateRange: { type: Array, required: true },
  employeeId: { type: String, default: null },
});

const reportStore = useReportStore();
const { exportToStyledExcel } = useExporter();

const photoUrl = ref(null);
const photoLoading = ref(false);
const isExporting = ref(false);

const isLoading = computed(() => reportStore.attendanceReport.loading);
const error = computed(() => reportStore.attendanceReport.error);
const reportData = computed(() => reportStore.attendanceReport.data);

const runReport = () => {
  if (Array.isArray(props.dateRange) && props.dateRange.length === 2) { 
    reportStore.fetchAttendanceReport({
      startDate: props.dateRange[0],
      endDate: props.dateRange[1],
      employeeId: props.employeeId,
    });
  }
};

watch(() => [props.dateRange, props.employeeId], runReport, { immediate: true, deep: true });

const formatDuration = (minutes) => {
  if (minutes === null || minutes < 0) return '-';
  if (minutes === 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h > 0 ? h + 'j' : ''} ${m}m`;
};

const viewPhoto = async (path) => {
  if (!path) return;
  photoUrl.value = null;
  photoLoading.value = true;
  try {
    const { data, error } = await supabase.storage.from('attendance-proofs').createSignedUrl(path, 60);
    if (error) throw error;
    photoUrl.value = data.signedUrl;
  } catch (e) {
    console.error("Error creating signed URL:", e);
    alert("Gagal memuat foto bukti.");
  } finally {
    photoLoading.value = false;
  }
};

const openLocationTab = (lat, long) => {
  if (lat === null || long === null) return;
  const url = `https://www.google.com/maps?q=${lat},${long}`;
  window.open(url, '_blank');
};

const handleExport = () => {
  if (!reportData.value || reportData.value.length === 0) return;
  isExporting.value = true;
  
  const dataToExport = {
    attendance: reportData.value.map(item => ({
      "Nama Pegawai": item.employee_name || '-',
      "Outlet": item.outlet_name || '-',
      "Tanggal": new Date(item.clock_in).toLocaleDateString('id-ID', { day:'2-digit', month: 'short', year: 'numeric'}),
      "Jam Masuk": new Date(item.clock_in).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}),
      "Jam Keluar": item.clock_out ? new Date(item.clock_out).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : 'Tidak Absen',
      "Durasi": formatDuration(item.duration_in_minutes),
    }))
  };
  
  const title = "Laporan Absensi Karyawan";
  const startDateStr = new Date(props.dateRange[0]).toLocaleDateString('id-ID');
  const endDateStr = new Date(props.dateRange[1]).toLocaleDateString('id-ID');
  const dateRangeStr = `Periode: ${startDateStr} - ${endDateStr}`;
  const fileName = `laporan-absensi-${startDateStr}-sd-${endDateStr}.xlsx`;

  exportToStyledExcel(dataToExport, title, dateRangeStr, fileName);
  
  isExporting.value = false;
};
</script>
