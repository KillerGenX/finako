<template>
  <div class="relative min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden flex items-center justify-center p-4">
    <!-- Ornamen Latar Belakang -->
    <div class="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 z-0 text-teal-100">
      <svg width="404" height="404" fill="none" viewBox="0 0 404 404">
        <defs>
          <pattern id="svg-pattern-squares-1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="4" class="text-teal-200" fill="currentColor"></rect>
          </pattern>
        </defs>
        <rect width="404" height="404" fill="url(#svg-pattern-squares-1)"></rect>
      </svg>
    </div>
    <div class="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 z-0 text-teal-100 opacity-75">
       <svg width="300" height="300" fill="none" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="100" fill="currentColor" />
       </svg>
    </div>

    <!-- Konten Utama -->
    <div class="relative max-w-lg w-full bg-white/70 backdrop-blur-sm rounded-xl shadow-2xl z-10 p-8 space-y-6">
      
      <!-- Header Dinamis -->
      <div class="text-center">
        <img class="mx-auto h-12 w-auto mb-4" src="@/assets/finako.svg" alt="Finako Logo" />
        <h1 class="text-3xl font-bold text-gray-900">
          <span v-if="currentView === 'selectPackage'">Pilih Paket Langganan</span>
          <span v-else-if="currentView === 'pendingPayment'">Menunggu Pembayaran</span>
          <span v-else-if="currentView === 'failed'">Langganan Gagal</span>
          <span v-else>Memuat Status</span>
        </h1>
        <p class="mt-2 text-gray-600">
          <span v-if="currentView === 'selectPackage'">Pilih paket yang paling sesuai untuk bisnis Anda.</span>
          <span v-else-if="currentView === 'pendingPayment'">Selesaikan pembayaran untuk mengaktifkan akun Anda.</span>
          <span v-else-if="currentView === 'failed'">Terjadi masalah dengan langganan Anda.</span>
          <span v-else>Sedang memeriksa status langganan Anda...</span>
        </p>
      </div>

      <!-- Kontainer View Dinamis -->
      <div class="bg-white/50 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
        <!-- Loading View -->
        <div v-if="currentView === 'loading'" class="text-center">
          <svg class="animate-spin h-8 w-8 text-teal-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-600">Memeriksa data...</p>
        </div>

        <!-- Select Package View -->
        <div v-else-if="currentView === 'selectPackage'" class="w-full">
          <form @submit.prevent="handleChoosePackage" class="space-y-4">
            <div class="space-y-3">
              <label v-for="pkg in packages" :key="pkg.id" 
                     :class="['block p-4 border rounded-lg cursor-pointer transition-all', selectedPackageId === pkg.id ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500' : 'border-gray-300 bg-white hover:border-teal-400']">
                <input type="radio" :value="pkg.id" v-model="selectedPackageId" class="sr-only">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-gray-800">{{ pkg.name }}</span>
                  <span class="font-bold text-teal-600">Rp {{ pkg.price.toLocaleString('id-ID') }}/bln</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ pkg.description || 'Deskripsi paket dasar.' }}</p>
              </label>
            </div>
            <button type="submit" :disabled="isSubmitting || !selectedPackageId" 
                    class="w-full py-3 px-4 rounded-md text-white font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-wait transition-colors">
              {{ isSubmitting ? 'Memproses...' : 'Lanjutkan Pembayaran' }}
            </button>
          </form>
        </div>

        <!-- Pending Payment View -->
        <div v-else-if="currentView === 'pendingPayment'" class="w-full text-center">
          <div class="mb-4">
             <p class="text-sm text-gray-700">Paket yang dipilih:</p>
             <p class="font-bold text-xl text-teal-700">{{ packages.find(p=>p.id===subscription.plan_id)?.name || 'Paket' }} - Rp {{ packages.find(p=>p.id===subscription.plan_id)?.price?.toLocaleString('id-ID') }}</p>
          </div>
          <div class="p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <h3 class="font-semibold text-gray-800">Instruksi:</h3>
            <p class="text-sm text-teal-800 mt-1">Silakan transfer ke rekening Mandiri <strong class="font-bold">1080018162033</strong> a.n. <strong>Teguh Prasetyo</strong>. Konfirmasi pembayaran anda ke WA Admin <strong>0821-331-331-20</strong>. Langganan akan aktif setelah pembayaran diverifikasi oleh admin.</p>
          </div>
        </div>

        <!-- Failed View -->
        <div v-else-if="currentView === 'failed'" class="w-full text-center">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          </div>
           <p class="mt-4 text-sm text-red-700">
             Mohon maaf, langganan Anda tidak dapat diproses. Silakan hubungi support untuk bantuan.
           </p>
        </div>
      </div>
      
      <!-- Tombol Aksi & Informasi -->
      <div class="space-y-3 pt-6">
        <div class="text-center text-xs text-gray-500">
          Status diperbarui otomatis. Countdown: {{ nextRefreshCountdown }}s
        </div>
        <button @click="checkStatus" :disabled="isChecking" 
                class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
          <svg :class="['h-4 w-4 mr-2', isChecking && 'animate-spin']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ isChecking ? 'Memeriksa...' : 'Periksa Status Sekarang' }}
        </button>
        <button @click="handleLogout" :disabled="isLoggingOut"
                class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50">
          Keluar
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStoreRefactored, useUIStore } from '@/stores/userStoreRefactored';
import { supabase } from '@/supabase';

const router = useRouter();
const userStore = useUserStoreRefactored();
const uiStore = useUIStore();

// State untuk UI
const isChecking = ref(false);
const isLoggingOut = ref(false);
const isSubmitting = ref(false);
const nextRefreshCountdown = ref(30);
const autoRefreshTimer = ref(null);
const countdownTimer = ref(null);

// State untuk data
const packages = ref([]);
const selectedPackageId = ref('');

// Computed properties
const businessInfo = computed(() => userStore.business);
const subscription = computed(() => userStore.currentSubscription);

// **LOGIC FIX:** Refined computed property for view switching
const currentView = computed(() => {
  // Priority 1: If we are actively checking the status, always show the loading indicator.
  if (isChecking.value) return 'loading';

  // After checking is done, determine the view based on subscription status.
  if (!subscription.value) return 'selectPackage';
  if (subscription.value.status === 'pending') return 'pendingPayment';
  if (subscription.value.status === 'rejected') return 'failed';
  
  // Fallback for any other unexpected state, prompts a re-check.
  return 'loading';
});

// --- FUNGSI-FUNGSI ---

function cleanupTimers() {
  if (autoRefreshTimer.value) clearInterval(autoRefreshTimer.value);
  if (countdownTimer.value) clearInterval(countdownTimer.value);
  autoRefreshTimer.value = null;
  countdownTimer.value = null;
}

async function checkStatus() {
  if (isChecking.value) return;
  isChecking.value = true;
  try {
    await userStore.fetchUserSession();
    const sub = userStore.currentSubscription;
    const onboardingDone = userStore.isOnboardingCompleted;
    
    if (sub && sub.status === 'active') {
      cleanupTimers();
      router.replace({ name: onboardingDone ? 'Dashboard' : 'Onboarding' });
    }
  } catch (error) {
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
    uiStore.showNotification('Paket berhasil dipilih. Lanjutkan ke pembayaran.', 'success');
    await checkStatus(); // Re-check status untuk update view
  }
  isSubmitting.value = false;
}

async function handleLogout() {
  isLoggingOut.value = true;
  await userStore.logout();
}

function setupAutoRefresh() {
  cleanupTimers();
  nextRefreshCountdown.value = 30;

  countdownTimer.value = setInterval(() => {
    nextRefreshCountdown.value = nextRefreshCountdown.value > 0 ? nextRefreshCountdown.value - 1 : 30;
  }, 1000);

  autoRefreshTimer.value = setInterval(checkStatus, 30000);
}

// Lifecycle Hooks
onMounted(() => {
  loadPackages();
  // **LOGIC FIX:** Removed initial checkStatus() call. 
  // The application's router guard handles the first check.
  setupAutoRefresh();
});

onUnmounted(() => {
  cleanupTimers();
});
</script>
