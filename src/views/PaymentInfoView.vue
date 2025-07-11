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
        <div v-if="organizationInfo && userProfile" class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informasi Organisasi</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Nama Bisnis:</span>
              <span class="text-sm font-medium text-gray-900">{{ organizationInfo.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Email:</span>
              <span class="text-sm font-medium text-gray-900">{{ userProfile?.email }}</span>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { supabase } from '@/supabase'

const router = useRouter()
const userStore = useUserStore()

// State
const isChecking = ref(false)
const isLoggingOut = ref(false)
const autoRefreshInterval = ref(30000) // 30 seconds
const nextRefreshCountdown = ref(30)
const autoRefreshTimer = ref(null)
const countdownTimer = ref(null)
const isInitialized = ref(false)

// Computed
const organizationInfo = computed(() => userStore.organization)
const userProfile = computed(() => userStore.profile)
const subscription = computed(() => organizationInfo.value?.subscription || null)

// Paket/plan
const packages = ref([])
const selectedPackageId = ref('')
const isSubmitting = ref(false)

// Status helpers
function getStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'suspended':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusText(status) {
  switch (status) {
    case 'pending':
      return 'Menunggu Persetujuan'
    case 'active':
      return 'Aktif'
    case 'rejected':
      return 'Ditolak'
    case 'suspended':
      return 'Disuspend'
    default:
      return 'Tidak Diketahui'
  }
}


// Check subscription status and redirect if needed
async function checkStatus() {
  if (isChecking.value) return
  isChecking.value = true
  try {
    await userStore.fetchUserProfile()
    // Refresh organization & subscription
    if (subscription.value && subscription.value.status === 'active') {
      // Hentikan auto-refresh sebelum redirect
      cleanup()
      // Langganan sudah aktif, redirect ke onboarding/dashboard
      if (organizationInfo.value?.onboarding_status !== 'completed') {
        router.replace('/onboarding')
      } else {
        router.replace('/')
      }
      return
    }
    // Jika status pending, tetap di halaman ini (instruksi pembayaran)
    // Jika belum ada subscription, tetap di halaman ini (form pilih paket)
  } catch (error) {
    console.error('Status check failed:', error)
    userStore.showNotification('Gagal memeriksa status. Silakan coba lagi.', 'error')
  } finally {
    isChecking.value = false
  }
}

// Ambil daftar paket/plan
async function loadPackages() {
  try {
    packages.value = await userStore.getPackages() || []
  } catch (e) {
    packages.value = []
  }
}

// Submit pilih paket
async function handleChoosePackage() {
  if (!selectedPackageId.value) return
  isSubmitting.value = true
  try {
    // Insert subscription baru (status pending)
    const { error } = await supabase
  .from('subscriptions')
  .insert({ 
        business_id: organizationInfo.value.id,
        plan_id: selectedPackageId.value,
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
      })
    if (error) throw error
    userStore.showNotification('Paket berhasil dipilih. Silakan lakukan pembayaran.', 'success')
    await userStore.fetchUserProfile()
    await checkStatus()
  } catch (e) {
    userStore.showNotification(e.message || 'Gagal memilih paket', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Handle logout
async function handleLogout() {
  if (isLoggingOut.value) return
  
  isLoggingOut.value = true
  
  try {
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    isLoggingOut.value = false
  }
}

// Setup auto refresh
function setupAutoRefresh() {
  // Countdown timer (updates every second)
  countdownTimer.value = setInterval(() => {
    nextRefreshCountdown.value--
    if (nextRefreshCountdown.value <= 0) {
      nextRefreshCountdown.value = autoRefreshInterval.value / 1000
    }
  }, 1000)

  // Auto refresh timer
  autoRefreshTimer.value = setInterval(() => {
    // Jangan auto-refresh jika sudah redirect (misal: subscription active)
    if (subscription.value && subscription.value.status === 'active') {
      cleanup()
      return
    }
    checkStatus()
    nextRefreshCountdown.value = autoRefreshInterval.value / 1000
  }, autoRefreshInterval.value)
}

// Cleanup timers
function cleanup() {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}



// Only run checkStatus and auto-refresh once after first data ready
onMounted(async () => {
  await loadPackages()
  await checkStatus()
  isInitialized.value = true
})

// Setup auto-refresh only once after first checkStatus
watch(isInitialized, (val) => {
  if (val && (!subscription.value || subscription.value.status !== 'active')) {
    setupAutoRefresh()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  cleanup()
})
</script>
