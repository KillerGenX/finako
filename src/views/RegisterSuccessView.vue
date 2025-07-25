<template>
  <div class="relative min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden flex items-center justify-center p-4">
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

    <div class="relative max-w-md w-full bg-white/70 backdrop-blur-sm rounded-xl shadow-2xl p-8 text-center z-10">
      <!-- Success Icon -->
      <div class="mx-auto w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
        <svg class="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <!-- Content -->
      <div class="mt-6">
        <h1 class="text-3xl font-bold text-gray-900">Pendaftaran Berhasil!</h1>
        <p class="mt-2 text-gray-600">
          Akun Anda telah berhasil dibuat. Kami sudah mengirimkan email verifikasi untuk aktivasi.
        </p>
      </div>

      <!-- Separator -->
      <div class="my-6">
        <hr class="border-t border-gray-200">
      </div>

      <!-- Action -->
      <p class="text-sm text-gray-700 mb-4">
        Silakan periksa kotak masuk (dan folder spam) Anda, lalu kembali untuk login.
      </p>
      <button 
        @click="goToLogin"
        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105"
      >
        Lanjutkan ke Halaman Login
      </button>

      <!-- Footer Info -->
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500">
          &copy; {{ new Date().getFullYear() }} Finako. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToLogin = () => {
  // Arahkan ke halaman login dengan query untuk menampilkan pesan sukses
  router.push({ name: 'Login' });
};
</script>

<style scoped>
/* Optional: Add a subtle animation for the whole card */
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.max-w-md {
  animation: fadeInScale 0.5s ease-out forwards;
}
</style>
