<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <!-- Success Icon -->
      <div class="mb-6">
        <div class="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h1>
        <p class="text-gray-600">Satu langkah lagi untuk memulai.</p>
      </div>

      <!-- Pesan Generik -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-700">
          Kami telah mengirimkan email verifikasi ke alamat email Anda. Silakan klik link di dalam email tersebut untuk mengaktifkan akun Anda.
        </p>
      </div>

      <!-- Next Steps (Disederhanakan) -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Langkah Selanjutnya</h3>
        <p class="text-sm text-gray-700">
          Setelah verifikasi, Anda bisa langsung login untuk melanjutkan ke setup bisnis Anda.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button 
          @click="goToLogin"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Lanjutkan ke Halaman Login
        </button>
      </div>

      <!-- Support Info -->
      <div class="mt-6 text-center">
        <p class="text-xs text-gray-500">
          Tidak menerima email? Cek folder Spam atau 
          <a href="#" class="text-green-600 hover:text-green-800 font-medium">
            kirim ulang email verifikasi.
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

// Tidak perlu lagi impor useRoute, onMounted, atau userStore.
// Komponen ini menjadi sangat sederhana dan "bodoh".

const router = useRouter();

const goToLogin = () => {
  // Cukup arahkan ke halaman login.
  router.push({ name: 'Login' });
};
</script>

<style scoped>
/* Semua style kustom Anda tetap dipertahankan */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.max-w-md { animation: fadeInUp 0.6s ease-out; }
button:hover { box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); }
@keyframes checkmark {
  0% { stroke-dasharray: 0 100; }
  100% { stroke-dasharray: 100 0; }
}
svg path { animation: checkmark 0.6s ease-in-out 0.3s both; }
</style>