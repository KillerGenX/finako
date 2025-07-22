<template>
  <div class="p-4 md:p-6 ">
    <!-- Header Halaman -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold">Absensi Kehadiran</h1>
        <p v-if="userStore.activeOutlet" class="text-base-content/70">
          Anda sedang aktif di outlet: <strong>{{ userStore.activeOutlet.name }}</strong>
        </p>
      </div>
      <div class="text-center md:text-right">
        <p class="font-mono text-3xl font-bold tracking-wider">{{ currentTime }}</p>
        <p class="text-sm text-base-content/70">{{ currentDate }}</p>
      </div>
    </div>

    <!-- Tampilan Loading Awal -->
    <div v-if="attendanceStore.loading && lastAttendance === null" class="text-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Memeriksa status absensi Anda...</p>
    </div>

    <!-- ===== Konten Utama ===== -->
    <div v-else class="space-y-8">
      <!-- Kartu Aksi Utama -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body items-center text-center">
          <div class="mb-4">
            <p class="text-lg">Status Anda Saat Ini:</p>
            <div v-if="attendanceStore.currentStatus === 'CLOCKED_IN'" class="badge badge-success badge-lg gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              SEDANG BEKERJA
            </div>
            <div v-else class="badge badge-error badge-lg gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
              TIDAK BEKERJA
            </div>
            <p v-if="attendanceStore.currentStatus === 'CLOCKED_IN' && lastAttendance" class="text-sm mt-2">
              Masuk sejak: {{ new Date(lastAttendance.clock_in).toLocaleTimeString('id-ID') }}
            </p>
          </div>
          <div class="card-actions">
            <button 
              @click="startAttendanceProcess" 
              class="btn btn-wide text-lg"
              :class="{ 
                'btn-primary': attendanceStore.currentStatus === 'CLOCKED_OUT',
                'btn-secondary': attendanceStore.currentStatus === 'CLOCKED_IN'
              }"
              :disabled="isProcessing || !userStore.activeOutletId"
            >
              <span v-if="isProcessing" class="loading loading-spinner"></span>
              {{ attendanceStore.currentStatus === 'CLOCKED_OUT' ? 'Clock In' : 'Clock Out' }}
            </button>
          </div>
          <p v-if="!userStore.activeOutletId" class="text-error text-xs mt-2">Pilih outlet aktif terlebih dahulu.</p>
        </div>
      </div>

      <!-- Kartu Statistik -->
      <div v-if="dashboardData" class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
  <div class="stat bg-base-200 rounded-lg shadow">
    <div class="stat-title">Jam Kerja Minggu Ini</div>
    <div class="stat-value">{{ dashboardData?.stats?.total_hours_this_week?.toFixed(1) || '0.0' }} jam</div>
    <div class="stat-desc">Total 7 hari terakhir</div>
  </div>
  <div class="stat bg-base-200 rounded-lg shadow">
    <div class="stat-title">Kehadiran Bulan Ini</div>
    <div class="stat-value">{{ dashboardData?.stats?.total_attendances_this_month || '0' }} hari</div>
    <div class="stat-desc">Jumlah clock-in bulan ini</div>
  </div>
  <div class="stat bg-base-200 rounded-lg shadow">
    <div class="stat-title">Rata-rata Jam Masuk</div>
    <div class="stat-value">{{ dashboardData?.stats?.avg_clock_in_time_this_month || '-' }}</div>
    <div class="stat-desc">Rata-rata di bulan ini</div>
  </div>
</div>

      <!-- Tabel Riwayat -->
      <div>
        <h2 class="text-xl font-bold mb-4">Riwayat Absensi (7 Hari Terakhir)</h2>
        <div class="overflow-x-auto bg-base-100 rounded-lg shadow">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jam Masuk</th>
                <th>Jam Keluar</th>
                <th>Durasi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="attendanceStore.loading && !dashboardData">
                <td colspan="4" class="text-center h-24"><span class="loading loading-spinner"></span></td>
              </tr>
              <tr v-else-if="!dashboardData?.history?.length">
  <td colspan="4" class="text-center h-24">Tidak ada riwayat absensi.</td>
</tr>
<tr v-for="(item, index) in dashboardData?.history" :key="index" class="hover">
                <td>{{ new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) }}</td>
                <td>{{ item.clock_in_time }}</td>
                <td>{{ item.clock_out_time || '-' }}</td>
                <td>
                  <span v-if="item.duration_hours !== null && item.duration_hours >= 0">
                    {{ item.duration_hours }} jam {{ item.duration_minutes_rem }} mnt
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Modal Kamera -->
    <dialog class="modal" :class="{ 'modal-open': showCameraModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Konfirmasi Absensi</h3>
        <p class="py-2 text-sm">Ambil foto selfie dan pastikan layanan lokasi aktif.</p>
        <div class="bg-base-300 rounded-lg overflow-hidden aspect-video my-4 flex items-center justify-center">
            <video v-show="!photoPreviewUrl" ref="videoRef" autoplay playsinline class="w-full h-full object-cover"></video>
            <img v-if="photoPreviewUrl" :src="photoPreviewUrl" alt="Preview Foto" class="w-full h-full object-cover" />
        </div>
        <p v-if="statusMessage" class="text-center font-semibold" :class="hasError ? 'text-error' : 'text-success'">
            {{ statusMessage }}
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeCameraModal" :disabled="isProcessing">Batal</button>
          <button v-if="!photoPreviewUrl" class="btn btn-accent" @click="takePicture" :disabled="!isCameraReady || isProcessing">Ambil Foto</button>
          <button v-else class="btn btn-primary" @click="confirmAttendance" :disabled="isProcessing">
            <span v-if="isProcessing" class="loading loading-spinner"></span>
            Konfirmasi
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAttendanceStore } from '@/stores/attendanceStore';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';

// Stores
const attendanceStore = useAttendanceStore();
const userStore = useUserStoreRefactored();

// State UI
const isProcessing = ref(false);
const hasError = ref(false);
const statusMessage = ref('');
const currentTime = ref('');
const currentDate = ref('');
let timeInterval = null;

// State Modal Kamera
const showCameraModal = ref(false);
const videoRef = ref(null);
const photoPreviewUrl = ref(null);
const photoFile = ref(null);
const location = ref(null);
const isCameraReady = ref(false);

const lastAttendance = computed(() => attendanceStore.lastAttendance);
const dashboardData = computed(() => attendanceStore.dashboardData);

// Mengupdate jam digital
const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit'});
    currentDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
};

// Lifecycle Hooks
onMounted(() => {
  attendanceStore.fetchMyLastStatus();
  attendanceStore.fetchMyDashboard();
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timeInterval);
});

// Logika Proses Absensi
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
    
    await attendanceStore.fetchMyDashboard(); // Refresh data statistik dan riwayat
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