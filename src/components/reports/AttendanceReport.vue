<template>
    <div>
      <!-- Header Panel Laporan -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 class="text-lg font-bold">Detail Laporan Absensi</h3>
        <button 
          @click="handleExport" 
          class="btn btn-outline btn-sm" 
          :disabled="isLoading || !reportData || reportData.length === 0"
        >
          <span v-if="isExporting" class="loading loading-spinner loading-xs"></span>
          Ekspor ke Excel
        </button>
      </div>
  
      <!-- Kontainer Hasil Laporan -->
      <div class="border border-base-300 rounded-lg">
        <!-- Tampilan Loading -->
        <div v-if="isLoading" class="text-center p-12">
          <span class="loading loading-spinner loading-lg"></span>
          <p class="mt-2 text-sm">Memuat data laporan...</p>
        </div>
  
        <!-- Tampilan Error -->
        <div v-else-if="error" class="alert alert-error rounded-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Error: {{ error }}</span>
        </div>
  
        <!-- Tampilan Tabel Laporan -->
        <div v-else-if="reportData && reportData.length > 0" class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Pegawai</th>
                <th>Outlet</th>
                <th>Tanggal</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Durasi</th>
                <th>Bukti</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in reportData" :key="item.clock_in + index" class="hover">
                <td>{{ item.employee_name }}</td>
                <td>{{ item.outlet_name }}</td>
                <td>{{ new Date(item.clock_in).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) }}</td>
                <td><span class="font-mono">{{ new Date(item.clock_in).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}) }}</span></td>
                <td>
                  <span v-if="item.clock_out" class="font-mono">{{ new Date(item.clock_out).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}) }}</span>
                  <span v-else class="badge badge-outline badge-warning">Tidak Absen</span>
                </td>
                <td class="font-mono">{{ formatDuration(item.duration_in_minutes) }}</td>
                <td class="flex items-center gap-2">
  <!-- Aksi untuk Clock In -->
  <div class="flex items-center gap-1">
    <span class="font-bold text-xs text-success">IN:</span>
    <div class="tooltip" data-tip="Lihat Foto Masuk">
      <button class="btn btn-xs btn-ghost" @click="viewPhoto(item.clock_in_photo_path)" :disabled="!item.clock_in_photo_path">
        📷
      </button>
    </div>
    <div class="tooltip" data-tip="Lihat Lokasi Masuk">
  <button 
    class="btn btn-xs btn-ghost"
    @click="openLocationTab(item.clock_in_latitude, item.clock_in_longitude)"
    :disabled="!item.clock_in_latitude"
  >
    📍
  </button>
</div>

  </div>

  <div class="divider divider-horizontal mx-0"></div>

  <!-- Aksi untuk Clock Out -->
  <div class="flex items-center gap-1">
    <span class="font-bold text-xs text-error">OUT:</span>
    <div class="tooltip" data-tip="Lihat Foto Keluar">
      <button class="btn btn-xs btn-ghost" @click="viewPhoto(item.clock_out_photo_path)" :disabled="!item.clock_out_photo_path">
        📷
      </button>
    </div>
    <div class="tooltip" data-tip="Lihat Lokasi Keluar">
  <button 
    class="btn btn-xs btn-ghost"
    @click="openLocationTab(item.clock_out_latitude, item.clock_out_longitude)"
    :disabled="!item.clock_out_latitude"
  >
    📍
  </button>
</div>
  </div>
</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Tampilan jika tidak ada data -->
        <div v-else class="text-center p-12">
          <p class="font-semibold">Tidak Ada Data</p>
          <p class="text-sm text-base-content/70">Tidak ada catatan absensi untuk filter yang Anda pilih.</p>
        </div>
      </div>
  
      <!-- Modal untuk menampilkan foto bukti -->
      <dialog class="modal" :class="{'modal-open': photoUrl}">
        <div class="modal-box">
          <div v-if="photoLoading" class="text-center p-8"><span class="loading loading-spinner"></span></div>
          <img v-else :src="photoUrl" alt="Bukti Absensi" class="w-full h-auto rounded-lg">
          <div class="modal-action">
            <button class="btn" @click="photoUrl = null; photoLoading = false;">Tutup</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="photoUrl = null; photoLoading = false;">close</button>
        </form>
      </dialog>
    </div>
  </template>
  
  <script setup>
import { ref, watch, computed } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import { supabase } from '@/supabase';
import { useExporter } from '@/composables/useExporter';

// =========================================================
// === PERUBAHAN UTAMA ADA DI SINI ===
// =========================================================

const props = defineProps({
  // Terima satu prop 'dateRange' yang merupakan array, bukan dua prop terpisah
  dateRange: { type: Array, required: true },
  employeeId: { type: String, default: null },
});

const reportStore = useReportStore();
const { exportToStyledExcel } = useExporter();

// State lokal (tidak berubah)
const photoUrl = ref(null);
const photoLoading = ref(false);
const isExporting = ref(false);

// Computed properties (tidak berubah)
const isLoading = computed(() => reportStore.attendanceReport.loading);
const error = computed(() => reportStore.attendanceReport.error);
const reportData = computed(() => reportStore.attendanceReport.data);

// Fungsi untuk memanggil action di store (disesuaikan)
const runReport = () => {
  // Pastikan props.dateRange tidak null dan berisi 2 elemen tanggal
  if (Array.isArray(props.dateRange) && props.dateRange.length === 2) { 
    reportStore.fetchAttendanceReport({
      startDate: props.dateRange[0], // Ambil elemen pertama
      endDate: props.dateRange[1],   // Ambil elemen kedua
      employeeId: props.employeeId,
    });
  }
};

// Watcher sekarang mengamati prop 'dateRange' tunggal
watch(() => props.dateRange, runReport, { immediate: true, deep: true });

// =========================================================
// === SISA SCRIPT TIDAK ADA PERUBAHAN ===
// =========================================================

// Helper Functions
const formatDuration = (minutes) => {
  if (minutes === null || minutes <= 0) return '-';
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
  if (!reportData.value || reportData.value.length === 0) return; // Pengaman tambahan
  isExporting.value = true;
  
  // Siapkan data dengan penanganan nilai null yang lebih baik
  const dataToExport = reportData.value.map(item => ({
    "Nama Pegawai": item.employee_name || '-',
    "Outlet": item.outlet_name || '-',
    "Tanggal": new Date(item.clock_in).toLocaleDateString('id-ID', { day:'2-digit', month: 'short', year: 'numeric'}),
    "Jam Masuk": new Date(item.clock_in).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}),
    // Pastikan nilai default benar-benar string kosong jika clock_out null
    "Jam Keluar": item.clock_out ? new Date(item.clock_out).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '',
    "Durasi": formatDuration(item.duration_in_minutes),
  }));
  
  const title = "Laporan Absensi Karyawan";
  // Ambil tanggal dari prop array dateRange
  const startDateStr = new Date(props.dateRange[0]).toLocaleDateString('id-ID');
  const endDateStr = new Date(props.dateRange[1]).toLocaleDateString('id-ID');
  const dateRangeStr = `Periode: ${startDateStr} - ${endDateStr}`;
  const fileName = `laporan-absensi-${startDateStr}-sd-${endDateStr}.xlsx`;

  exportToStyledExcel(dataToExport, title, dateRangeStr, fileName);
  
  isExporting.value = false;
};


</script>