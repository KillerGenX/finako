<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-full">
    <!-- Header Halaman -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h1 class="text-2xl font-bold text-gray-800">Absensi Kehadiran</h1>
        <p v-if="userStore.activeOutlet" class="text-gray-600 mt-1">
          Outlet Aktif: <strong class="text-teal-600">{{ userStore.activeOutlet.name }}</strong>
        </p>
         <p v-else class="text-red-500 mt-1">Silakan pilih outlet aktif di Dasbor untuk memulai.</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200 text-center md:text-right">
        <p class="font-mono text-4xl font-bold text-gray-800 tracking-wider">{{ currentTime }}</p>
        <p class="text-sm text-gray-500">{{ currentDate }}</p>
      </div>
    </div>

    <!-- Tampilan Loading Awal -->
    <div v-if="attendanceStore.loading && lastAttendance === null" class="text-center py-20">
      <span class="loading loading-spinner loading-lg text-teal-600"></span>
      <p class="mt-4 text-gray-600">Memeriksa status absensi Anda...</p>
    </div>

    <!-- Konten Utama -->
    <div v-else class="space-y-8">
      <!-- Kartu Aksi Utama dengan Desain Baru -->
      <div class="card bg-white shadow-lg border border-gray-200">
        <div class="card-body items-center text-center p-8">
          <div class="mb-4">
            <p class="text-lg text-gray-600">Status Anda Saat Ini:</p>
            <div v-if="attendanceStore.currentStatus === 'CLOCKED_IN'" class="inline-flex items-center gap-2 text-2xl font-bold text-green-600 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              SEDANG BEKERJA
            </div>
            <div v-else class="inline-flex items-center gap-2 text-2xl font-bold text-red-600 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
              TIDAK BEKERJA
            </div>
            <p v-if="attendanceStore.currentStatus === 'CLOCKED_IN' && lastAttendance" class="text-sm mt-2 text-gray-500">
              Masuk sejak pukul: {{ new Date(lastAttendance.clock_in).toLocaleTimeString('id-ID') }}
            </p>
          </div>
          <div class="card-actions">
            <button 
              @click="startAttendanceProcess" 
              class="btn btn-lg rounded-full px-10"
              :class="{ 
                'btn-primary bg-teal-600 hover:bg-teal-700 border-none': attendanceStore.currentStatus === 'CLOCKED_OUT',
                'btn-secondary bg-red-600 hover:bg-red-700 border-none': attendanceStore.currentStatus === 'CLOCKED_IN'
              }"
              :disabled="isProcessing || !userStore.activeOutletId"
            >
              <span v-if="isProcessing" class="loading loading-spinner"></span>
              {{ attendanceStore.currentStatus === 'CLOCKED_OUT' ? 'Clock In Sekarang' : 'Clock Out Sekarang' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Kartu Statistik dengan Gaya Dasbor -->
      <div v-if="dashboardData" class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="bg-white shadow-lg rounded-lg border-l-4 border-teal-500 flex items-center p-5">
            <div class="bg-teal-100 rounded-full p-3 mr-4"><svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Jam Kerja Minggu Ini</p>
                <p class="text-2xl font-bold text-gray-800">{{ dashboardData?.stats?.total_hours_this_week?.toFixed(1) || '0.0' }} jam</p>
            </div>
        </div>
        <div class="bg-white shadow-lg rounded-lg border-l-4 border-blue-500 flex items-center p-5">
            <div class="bg-blue-100 rounded-full p-3 mr-4"><svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Kehadiran Bulan Ini</p>
                <p class="text-2xl font-bold text-gray-800">{{ dashboardData?.stats?.total_attendances_this_month || '0' }} hari</p>
            </div>
        </div>
        <div class="bg-white shadow-lg rounded-lg border-l-4 border-purple-500 flex items-center p-5">
            <div class="bg-purple-100 rounded-full p-3 mr-4"><svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Rata-rata Jam Masuk</p>
                <p class="text-2xl font-bold text-gray-800">{{ dashboardData?.stats?.avg_clock_in_time_this_month || '-' }}</p>
            </div>
        </div>
      </div>

      <!-- Tabel Riwayat dengan Gaya Baru -->
      <div>
        <h2 class="text-xl font-bold text-gray-800 mb-4">Riwayat Absensi (7 Hari Terakhir)</h2>
        <div class="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table class="table-auto w-full text-sm">
            <thead class="bg-gray-50 text-left text-gray-600">
              <tr>
                <th class="px-6 py-3 font-medium">Tanggal</th>
                <th class="px-6 py-3 font-medium">Jam Masuk</th>
                <th class="px-6 py-3 font-medium">Jam Keluar</th>
                <th class="px-6 py-3 font-medium">Durasi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="attendanceStore.loading && !dashboardData">
                <td colspan="4" class="text-center py-10"><span class="loading loading-spinner text-teal-600"></span></td>
              </tr>
              <tr v-else-if="!dashboardData?.history?.length">
                <td colspan="4" class="text-center py-10 text-gray-500">Tidak ada riwayat absensi.</td>
              </tr>
              <tr v-for="(item, index) in dashboardData?.history" :key="index">
                <td class="px-6 py-4 font-medium text-gray-800">{{ new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) }}</td>
                <td class="px-6 py-4 text-gray-600 font-mono">{{ item.clock_in_time }}</td>
                <td class="px-6 py-4 text-gray-600 font-mono">{{ item.clock_out_time || '-' }}</td>
                <td class="px-6 py-4">
                  <span v-if="item.duration_hours !== null && item.duration_hours >= 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    {{ item.duration_hours }} jam {{ item.duration_minutes_rem }} mnt
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Modal Kamera (Hanya gaya yang diubah) -->
    <dialog class="modal" :class="{ 'modal-open': showCameraModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Konfirmasi Absensi</h3>
        <p class="py-2 text-sm">Ambil foto selfie dan pastikan layanan lokasi aktif.</p>
        <div class="bg-gray-200 rounded-lg overflow-hidden aspect-video my-4 flex items-center justify-center">
            <video v-show="!photoPreviewUrl" ref="videoRef" autoplay playsinline class="w-full h-full object-cover"></video>
            <img v-if="photoPreviewUrl" :src="photoPreviewUrl" alt="Preview Foto" class="w-full h-full object-cover" />
        </div>
        <p v-if="statusMessage" class="text-center font-semibold" :class="hasError ? 'text-red-600' : 'text-green-600'">
            {{ statusMessage }}
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeCameraModal" :disabled="isProcessing">Batal</button>
          <button v-if="!photoPreviewUrl" class="btn btn-outline" @click="takePicture" :disabled="!isCameraReady || isProcessing">Ambil Foto</button>
          <button v-else class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" @click="confirmAttendance" :disabled="isProcessing">
            <span v-if="isProcessing" class="loading loading-spinner"></span>
            Konfirmasi
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAttendanceStore } from '@/stores/attendanceStore';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';

const attendanceStore = useAttendanceStore();
const userStore = useUserStoreRefactored();

const isProcessing = ref(false);
const hasError = ref(false);
const statusMessage = ref('');
const currentTime = ref('');
const currentDate = ref('');
let timeInterval = null;

const showCameraModal = ref(false);
const videoRef = ref(null);
const photoPreviewUrl = ref(null);
const photoFile = ref(null);
const location = ref(null);
const isCameraReady = ref(false);

const lastAttendance = computed(() => attendanceStore.lastAttendance);
const dashboardData = computed(() => attendanceStore.dashboardData);

const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit'});
    currentDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
};

onMounted(() => {
  attendanceStore.fetchMyLastStatus();
  attendanceStore.fetchMyDashboard();
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timeInterval);
});

const startAttendanceProcess = async () => {
    showCameraModal.value = true;
    isProcessing.value = true;
    hasError.value = false;
    statusMessage.value = 'Mempersiapkan kamera dan lokasi...';

    const [cameraResult, locationResult] = await Promise.allSettled([
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }),
        new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { 
                enableHighAccuracy: true, timeout: 10000, maximumAge: 0 
            });
        })
    ]);

    if (cameraResult.status === 'fulfilled') {
        const stream = cameraResult.value;
        if (videoRef.value) {
            videoRef.value.srcObject = stream;
        }
        isCameraReady.value = true;
    } else {
        console.error('Camera Error:', cameraResult.reason);
        statusMessage.value = 'Error: Gagal mengakses kamera. Mohon periksa izin.';
        hasError.value = true;
        isProcessing.value = false;
        return;
    }

    if (locationResult.status === 'fulfilled') {
        location.value = locationResult.value;
        statusMessage.value = 'Kamera & Lokasi siap. Silakan ambil foto.';
    } else {
        console.error('Location Error:', locationResult.reason);
        statusMessage.value = 'Peringatan: Lokasi gagal dideteksi. Anda masih bisa lanjut.';
        location.value = null;
    }

    isProcessing.value = false;
};

const takePicture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.value.videoWidth;
    canvas.height = videoRef.value.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
        photoFile.value = new File([blob], "attendance_photo.jpg", { type: "image/jpeg" });
        photoPreviewUrl.value = URL.createObjectURL(photoFile.value);
    }, 'image/jpeg');

    if (videoRef.value.srcObject) {
        videoRef.value.srcObject.getTracks().forEach(track => track.stop());
    }
    statusMessage.value = 'Foto berhasil diambil. Klik Konfirmasi untuk menyimpan.';
};

const confirmAttendance = async () => {
    isProcessing.value = true;
    statusMessage.value = 'Menyimpan data absensi...';

    if (attendanceStore.currentStatus === 'CLOCKED_OUT') {
        await attendanceStore.clockIn(location.value, photoFile.value);
    } else {
        await attendanceStore.clockOut(location.value, photoFile.value);
    }
    
    await attendanceStore.fetchMyDashboard();
    isProcessing.value = false;
    closeCameraModal();
};

const closeCameraModal = () => {
    if (videoRef.value && videoRef.value.srcObject) {
        videoRef.value.srcObject.getTracks().forEach(track => track.stop());
    }
    showCameraModal.value = false;
    photoPreviewUrl.value = null;
    photoFile.value = null;
    location.value = null;
    isCameraReady.value = false;
    statusMessage.value = '';
};
</script>
