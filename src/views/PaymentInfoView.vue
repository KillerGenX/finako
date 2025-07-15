<template>
  <div class="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
          <svg class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Menunggu Persetujuan
        </h1>
        <p class="text-gray-600">
          Registrasi Anda sedang diproses oleh tim admin
        </p>
      </div>


      <!-- Status Card -->
      <div class="bg-white rounded-lg shadow-xl p-8 relative">
        <!-- Loading Overlay -->
        <div v-if="isChecking" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <svg class="animate-spin h-8 w-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <!-- Organization Info -->
        <div v-if="businessInfo && userProfile" class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informasi Organisasi</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Nama Bisnis:</span>
              <span class="text-sm font-medium text-gray-900">{{ businessInfo.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Email:</span>
              <span class="text-sm font-medium text-gray-900">{{ userStore.userEmail }}</span>
            </div>
          </div>
        </div>

        <!-- PILIH PAKET -->
        <div v-if="!isChecking && !subscription">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Pilih Paket Langganan</h2>
          <form @submit.prevent="handleChoosePackage" class="space-y-4">
            <div>
              <label for="packageId" class="block text-sm font-medium text-gray-700 mb-2">Paket</label>
              <select id="packageId" v-model="selectedPackageId" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option value="">Pilih paket</option>
                <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">
                  {{ pkg.name }} - Rp {{ pkg.price.toLocaleString('id-ID') }}/bulan
                </option>
              </select>
            </div>
            <button type="submit" :disabled="isSubmitting || !selectedPackageId" class="w-full py-2 px-4 rounded-md bg-yellow-500 text-white font-semibold hover:bg-yellow-600 disabled:opacity-50">
              {{ isSubmitting ? 'Memproses...' : 'Pilih Paket & Lanjutkan' }}
            </button>
          </form>
        </div>

        <!-- INSTRUKSI PEMBAYARAN -->
        <div v-else-if="!isChecking && subscription && subscription.status === 'pending'">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Instruksi Pembayaran</h2>
          <div class="mb-4">
            <p class="text-sm text-gray-700">Silakan lakukan pembayaran sesuai paket yang dipilih untuk mengaktifkan langganan Anda.</p>
            <ul class="mt-2 text-sm text-gray-600">
              <li>Paket: <span class="font-medium text-gray-900">{{ packages.find(p=>p.id===subscription.plan_id)?.name || 'Paket' }}</span></li>
              <li>Harga: <span class="font-medium text-gray-900">Rp {{ packages.find(p=>p.id===subscription.plan_id)?.price?.toLocaleString('id-ID') }}</span></li>
              <li>Status: <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu Pembayaran</span></li>
            </ul>
            <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p class="text-xs text-yellow-700">Transfer ke rekening BCA 1234567890 a.n. PT Finako Digital (contoh). Setelah pembayaran, admin akan mengaktifkan langganan Anda.</p>
            </div>
          </div>
        </div>

        <!-- STATUS DITOLAK -->
        <div v-else-if="!isChecking && subscription && subscription.status === 'rejected'">
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Registrasi Ditolak
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>Mohon maaf, registrasi/langganan Anda tidak dapat diproses. Silakan hubungi support untuk informasi lebih lanjut.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <!-- Refresh Button -->
          <button
            @click="checkStatus"
            :disabled="isChecking"
            class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isChecking" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ isChecking ? 'Memeriksa...' : 'Periksa Status' }}
          </button>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isLoggingOut" class="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {{ isLoggingOut ? 'Keluar...' : 'Keluar' }}
          </button>
        </div>

        <!-- Auto Refresh Info -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            Status akan dicek otomatis setiap {{ autoRefreshInterval / 1000 }} detik
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Refresh berikutnya dalam {{ nextRefreshCountdown }} detik
          </p>
        </div>
      </div>

      <!-- Support Info -->
      <div class="text-center text-sm text-gray-500">
        <p>
          Butuh bantuan? Hubungi support di 
          <a href="mailto:support@finako.id" class="text-blue-600 hover:text-blue-500">
            support@finako.id
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
// Pastikan kedua store diimpor
import { useUserStoreRefactored, useUIStore } from '@/stores/userStoreRefactored';
import { supabase } from '@/supabase';

const router = useRouter();
const userStore = useUserStoreRefactored();
const uiStore = useUIStore(); // Inisialisasi uiStore untuk notifikasi

// State lokal
const isChecking = ref(false);
const isLoggingOut = ref(false);
const autoRefreshInterval = ref(30000);
const nextRefreshCountdown = ref(30);
const autoRefreshTimer = ref(null);
const countdownTimer = ref(null);
const packages = ref([]);
const selectedPackageId = ref('');
const isSubmitting = ref(false);

// Computed properties
const businessInfo = computed(() => userStore.business);
const userProfile = computed(() => userStore.profile);
const subscription = computed(() => userStore.currentSubscription);


// ===============================================
// === FUNGSI-FUNGSI PENTING ADA DI SINI ===
// ===============================================

// FUNGSI INI HARUS ADA SEBELUM DIPANGGIL OLEH checkStatus
function cleanup() {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value);
    autoRefreshTimer.value = null;
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
}

async function checkStatus() {
  if (isChecking.value) return;
  isChecking.value = true;
  try {
    await userStore.fetchUserSession();

    const updatedSubscription = userStore.currentSubscription;
    const onboardingDone = userStore.isOnboardingCompleted;
    
    if (updatedSubscription && updatedSubscription.status === 'active') {
        // Panggil fungsi cleanup yang sudah kita definisikan di atas
        cleanup(); 

        if (!onboardingDone) {
            router.replace({ name: 'Onboarding' });
        } else {
            router.replace({ name: 'Dashboard' });
        }
    }
  } catch (error) {
    console.error('Status check failed:', error);
    uiStore.showNotification('Gagal memeriksa status.', 'error');
  } finally {
    isChecking.value = false;
  }
}

async function loadPackages() {
  packages.value = await userStore.getPackages();
}

async function handleChoosePackage() {
  if (!selectedPackageId.value || !businessInfo.value) return;
  isSubmitting.value = true;
  
  const { error } = await supabase.from('subscriptions').insert({ 
    business_id: businessInfo.value.id,
    plan_id: selectedPackageId.value,
    status: 'pending',
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
  });

  if (error) {
    uiStore.showNotification(error.message, 'error'); 
  } else {
    uiStore.showNotification('Paket berhasil dipilih. Silakan lakukan pembayaran.', 'success');
    await checkStatus();
  }
  isSubmitting.value = false;
}

async function handleLogout() {
  isLoggingOut.value = true;
  await userStore.logout();
}

// Setup auto refresh
function setupAutoRefresh() {
  cleanup(); // Hentikan timer lama sebelum memulai yang baru

  countdownTimer.value = setInterval(() => {
    nextRefreshCountdown.value = nextRefreshCountdown.value > 0 ? nextRefreshCountdown.value - 1 : autoRefreshInterval.value / 1000;
  }, 1000);

  autoRefreshTimer.value = setInterval(() => {
    checkStatus();
  }, autoRefreshInterval.value);
}

// Lifecycle Hooks
onMounted(() => {
  loadPackages();
  // Tidak perlu checkStatus() di sini, biarkan guard yang menangani saat pertama kali masuk
  // Tapi kita tetap setup auto-refresh jika perlu
  if (!subscription.value || subscription.value.status !== 'active') {
    setupAutoRefresh();
  }
});

onUnmounted(() => {
  cleanup(); // Pastikan timer dibersihkan saat komponen dihancurkan
});
</script>
