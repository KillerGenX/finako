<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="card w-full max-w-md shadow-2xl bg-base-100 mx-auto">
      <div class="card-body">
        <div class="text-center">
          <h1 class="card-title mb-4 text-2xl justify-center">Informasi Pembayaran</h1>
          <div class="alert alert-warning mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>Akun organisasi Anda belum aktif</span>
          </div>
          
          <p class="mb-4">
            Untuk mengaktifkan akun dan mengakses semua fitur Finako, 
            silakan hubungi tim support kami atau lakukan pembayaran sesuai paket yang dipilih.
          </p>
          
          <div class="space-y-4">
            <div class="bg-base-200 p-4 rounded-lg">
              <h3 class="font-semibold mb-2">Kontak Support:</h3>
              <p class="text-sm">Email: support@finako.com</p>
              <p class="text-sm">WhatsApp: +62 812-3456-7890</p>
            </div>
            
            <!-- Tombol Refresh Status -->
            <button 
              @click="refreshStatus" 
              :disabled="isRefreshing"
              class="btn btn-primary w-full"
              :class="{ 'loading': isRefreshing }"
            >
              <span v-if="!isRefreshing">🔄 Periksa Status Terbaru</span>
              <span v-else>Memeriksa...</span>
            </button>
            
            <button @click="handleLogout" class="btn btn-outline w-full">
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { supabase } from '@/supabase'

const router = useRouter()
const userStore = useUserStore()
const isRefreshing = ref(false)

async function refreshStatus() {
  isRefreshing.value = true
  try {
    // Fetch ulang user profile untuk mendapatkan status terbaru
    await userStore.fetchUserProfile()
    
    // Cek status organization terbaru
    if (userStore.organization?.status === 'active') {
      userStore.showNotification('Status akun telah aktif! Mengarahkan ke setup bisnis...', 'success')
      // Navigation guard akan otomatis mengarahkan ke onboarding
      setTimeout(() => {
        router.push('/onboarding')
      }, 1500)
    } else {
      userStore.showNotification('Status masih pending. Silakan coba lagi nanti.', 'info')
    }
  } catch (error) {
    console.error('Error refreshing status:', error)
    userStore.showNotification('Terjadi kesalahan saat memeriksa status', 'error')
  } finally {
    isRefreshing.value = false
  }
}

async function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    await supabase.auth.signOut()
    userStore.clearUserProfile()
    router.push("/login")
  }
}
</script>
