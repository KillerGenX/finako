<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full pb-20 sm:pb-8">
    <!-- Header Profile - Talenta Style -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {{ (userStore.user?.user_metadata?.full_name || userStore.userFullName || 'U').charAt(0).toUpperCase() }}
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-gray-800">
            {{ getGreeting() }}, {{ userStore.user?.user_metadata?.full_name || userStore.userFullName || 'User' }}! 👋
          </h1>
          <p v-if="userStore.activeOutlet" class="text-sm text-gray-600">
            📍 {{ userStore.activeOutlet.name }}
          </p>
          <p v-else class="text-sm text-red-500">Pilih outlet aktif</p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-mono text-xl sm:text-2xl font-bold text-gray-800">{{ currentTime }}</p>
        <p class="text-xs text-gray-500">{{ currentDate }}</p>
      </div>
    </div>

    <!-- Tampilan Loading Awal -->
    <div v-if="attendanceStore.loading && lastAttendance === null" class="text-center py-12 sm:py-20">
      <span class="loading loading-spinner loading-lg text-teal-600"></span>
      <p class="mt-4 text-gray-600 text-sm sm:text-base">Memeriksa status absensi Anda...</p>
    </div>

    <!-- Konten Utama -->
    <div v-else class="space-y-6 sm:space-y-8">
      <!-- Main Clock Card - Talenta Style -->
      <div class="relative overflow-hidden rounded-xl shadow-lg"
           :class="{
             'bg-gradient-to-br from-green-500 to-green-600': attendanceStore.currentStatus === 'CLOCKED_IN',
             'bg-gradient-to-br from-teal-500 to-teal-600': attendanceStore.currentStatus === 'CLOCKED_OUT'
           }">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div class="relative p-6 sm:p-8 text-white text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <svg v-if="attendanceStore.currentStatus === 'CLOCKED_IN'" 
                 class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          
          <h2 class="text-2xl sm:text-3xl font-bold mb-2">
            {{ attendanceStore.currentStatus === 'CLOCKED_IN' ? 'Sedang Bekerja' : 'Belum Clock In' }}
          </h2>
          
          <p v-if="attendanceStore.currentStatus === 'CLOCKED_IN' && lastAttendance" class="text-white/80 text-sm mb-6">
            Masuk sejak pukul: {{ new Date(lastAttendance.clock_in).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}) }}
          </p>
          <p v-else class="text-white/80 text-lg mb-6">Siap untuk memulai hari kerja?</p>

          <button 
            @click="startAttendanceProcess" 
            class="btn btn-lg bg-white hover:bg-gray-100 text-gray-800 border-none rounded-full px-8 sm:px-12 min-h-14 shadow-lg transform hover:scale-105 transition-all duration-200"
            :disabled="isProcessing || !userStore.activeOutletId"
          >
            <span v-if="isProcessing" class="loading loading-spinner loading-sm mr-2"></span>
            <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-semibold">
              {{ attendanceStore.currentStatus === 'CLOCKED_OUT' ? 'Clock In' : 'Clock Out' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Kartu Statistik - Clean Style -->
      <div v-if="dashboardData" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500 font-medium">Jam Kerja Minggu Ini</p>
              <p class="text-xl font-bold text-gray-800">{{ dashboardData?.stats?.total_hours_this_week?.toFixed(1) || '0.0' }} jam</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500 font-medium">Kehadiran Bulan Ini</p>
              <p class="text-xl font-bold text-gray-800">{{ dashboardData?.stats?.total_attendances_this_month || '0' }} hari</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500 font-medium">Rata-rata Jam Masuk</p>
              <p class="text-xl font-bold text-gray-800">{{ dashboardData?.stats?.avg_clock_in_time_this_month || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Riwayat Absensi - Modern Style -->
      <div>
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div class="w-2 h-2 bg-teal-500 rounded-full"></div>
          Riwayat 7 Hari Terakhir
        </h2>
        
        <!-- Mobile: Modern Card Layout -->
        <div class="block lg:hidden space-y-3">
          <div v-if="attendanceStore.loading && !dashboardData" class="bg-white rounded-xl border p-6 text-center">
            <span class="loading loading-spinner text-teal-600"></span>
            <p class="mt-2 text-gray-500 text-sm">Memuat riwayat...</p>
          </div>
          <div v-else-if="!dashboardData?.history?.length" class="bg-white rounded-xl border p-6 text-center text-gray-500">
            <p class="font-semibold">Tidak Ada Riwayat</p>
            <p class="text-sm mt-1">Belum ada catatan absensi.</p>
          </div>
          <div v-for="(item, index) in dashboardData?.history" :key="index" 
               class="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-200">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-semibold text-gray-800">
                {{ new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) }}
              </h4>
              <div v-if="item.duration_hours !== null && item.duration_hours >= 0" 
                   class="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                {{ item.duration_hours }}j {{ item.duration_minutes_rem }}m
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-green-50 rounded-lg p-3">
                <div class="text-xs text-green-600 font-medium mb-1">Jam Masuk</div>
                <div class="font-mono text-sm text-gray-800">{{ item.clock_in_time }}</div>
              </div>
              <div class="bg-red-50 rounded-lg p-3">
                <div class="text-xs text-red-600 font-medium mb-1">Jam Keluar</div>
                <div class="font-mono text-sm text-gray-800">{{ item.clock_out_time || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Desktop: Modern Table Layout -->
        <div class="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-700">Jam Masuk</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-700">Jam Keluar</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-700">Durasi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="attendanceStore.loading && !dashboardData">
                <td colspan="4" class="text-center py-12"><span class="loading loading-spinner text-teal-600"></span></td>
              </tr>
              <tr v-else-if="!dashboardData?.history?.length">
                <td colspan="4" class="text-center py-12 text-gray-500">Tidak ada riwayat absensi.</td>
              </tr>
              <tr v-for="(item, index) in dashboardData?.history" :key="index" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-800">
                  {{ new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="font-mono text-green-600 font-semibold">{{ item.clock_in_time }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="font-mono text-red-600 font-semibold">{{ item.clock_out_time || '-' }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span v-if="item.duration_hours !== null && item.duration_hours >= 0" 
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                    {{ item.duration_hours }}j {{ item.duration_minutes_rem }}m
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Modal Kamera - Mobile Optimized -->
    <dialog class="modal" :class="{ 'modal-open': showCameraModal }">
      <div class="modal-box max-w-md mx-4 sm:mx-auto">
        <h3 class="font-bold text-lg mb-2">Konfirmasi Absensi</h3>
        <p class="text-sm text-gray-600 mb-4">Ambil foto selfie dan pastikan layanan lokasi aktif.</p>
        
        <!-- Camera/Photo Container -->
        <div class="bg-gray-200 rounded-lg overflow-hidden aspect-video mb-4 flex items-center justify-center">
            <video v-show="!photoPreviewUrl" ref="videoRef" autoplay playsinline class="w-full h-full object-cover"></video>
            <img v-if="photoPreviewUrl" :src="photoPreviewUrl" alt="Preview Foto" class="w-full h-full object-cover" />
        </div>
        
        <!-- Status Message -->
        <p v-if="statusMessage" class="text-center font-semibold text-sm mb-4" :class="hasError ? 'text-red-600' : 'text-green-600'">
            {{ statusMessage }}
        </p>
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <button class="btn btn-ghost order-2 sm:order-1" @click="closeCameraModal" :disabled="isProcessing">
            Batal
          </button>
          <button v-if="!photoPreviewUrl" 
                  class="btn btn-outline order-1 sm:order-2" 
                  @click="takePicture" 
                  :disabled="!isCameraReady || isProcessing">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Ambil Foto
          </button>
          <button v-else 
                  class="btn bg-teal-600 hover:bg-teal-700 text-white border-none order-1 sm:order-2" 
                  @click="confirmAttendance" 
                  :disabled="isProcessing">
            <span v-if="isProcessing" class="loading loading-spinner loading-sm mr-2"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Konfirmasi Absensi
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

const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 12) {
        return 'Selamat Pagi';
    } else if (hour >= 12 && hour < 15) {
        return 'Selamat Siang';
    } else if (hour >= 15 && hour < 18) {
        return 'Selamat Sore';
    } else {
        return 'Selamat Malam';
    }
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
