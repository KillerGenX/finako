<template>
  <div class="relative min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden">
    <!-- Ornament 1: Top-Left Corner -->
    <div class="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 z-0">
      <svg width="404" height="404" fill="none" viewBox="0 0 404 404" class="text-teal-100">
        <defs>
          <pattern id="svg-pattern-squares-1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="4" class="text-teal-200" fill="currentColor"></rect>
          </pattern>
        </defs>
        <rect width="404" height="404" fill="url(#svg-pattern-squares-1)"></rect>
      </svg>
    </div>
    
    <!-- Ornament 2: Bottom-Right Corner -->
    <div class="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 z-0">
       <svg width="300" height="300" fill="none" viewBox="0 0 200 200" class="text-teal-100 opacity-75">
          <circle cx="100" cy="100" r="100" fill="currentColor" />
       </svg>
    </div>

    <div class="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 z-10">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <!-- Logo -->
          <img class="mx-auto h-12 w-auto" src="@/assets/finako.svg" alt="Finako Logo" />
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke Akun Anda
          </h2>
        </div>

        <!-- Login Form Card -->
        <div class="bg-white/70 backdrop-blur-sm py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <!-- Success Message -->
          <div v-if="successMessage" class="mb-5 p-4 bg-green-100 border-l-4 border-green-500">
            <p class="text-sm text-green-800">{{ successMessage }}</p>
          </div>
          
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Alamat Email
              </label>
              <div class="mt-1">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  required
                  :disabled="isLoading"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition"
                  placeholder="anda@email.com"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div class="mt-1 relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  :disabled="isLoading"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  :disabled="isLoading"
                >
                  <svg v-if="!showPassword" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Error Message -->
            <div v-if="errorMessage" class="p-4 bg-red-100 border-l-4 border-red-500">
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-wait transition-colors"
              >
                <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? 'Memverifikasi...' : 'Masuk' }}
              </button>
            </div>
          </form>
          
          <!-- Register Link -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Belum punya akun?
              <router-link
                to="/register"
                class="font-medium text-teal-600 hover:text-teal-500 transition-colors"
              >
                Daftar sekarang
              </router-link>
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="text-center text-sm text-gray-500 mt-4">
          <p>&copy; {{ new Date().getFullYear() }} Finako. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// Impor BENAR ke store yang baru
import { useUserStoreRefactored } from '@/stores/userStoreRefactored'

const router = useRouter()
const route = useRoute()
const userStore = useUserStoreRefactored()

// State lokal tidak berubah
const form = ref({ email: '', password: '' })
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Versi FINAL dari handleLogin
async function handleLogin() {
  if (isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Panggil fungsi login dari store BARU kita.
    const result = await userStore.loginWithEmailPassword(
      form.value.email.trim(),
      form.value.password
    )

    // ============================================
    // === INI BAGIAN KUNCI PERBAIKANNYA ===
    // ============================================
    if (result.success) {
      // Jika store mengembalikan sukses, kita lakukan redirect manual
      // berdasarkan `nextStep` yang diberikan oleh store.
      
      const destination = {
        'dashboard': '/',
        'onboarding': '/onboarding',
        'payment_info': '/payment-info'
      }[result.nextStep] || '/'; // Default ke dashboard
      
      router.push(destination);

    } else {
      errorMessage.value = result.error || 'Login gagal. Silakan coba lagi.'
    }
    // ============================================

  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.message || 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

// onMounted tidak berubah
onMounted(() => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (route.query.newUser === 'true' && route.query.email) {
    form.value.email = route.query.email
    successMessage.value = 'Registrasi berhasil! Silakan login dengan akun baru Anda.'
  }
  
  const targetInput = form.value.email ? 
    document.getElementById('password') : 
    document.getElementById('email')
  
  if (targetInput) {
    targetInput.focus()
  }
})
</script>