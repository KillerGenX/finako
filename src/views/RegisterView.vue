<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
    <div class="max-w-lg w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Daftar Tenant Baru
        </h1>
        <p class="text-gray-600">
          Bergabung dengan ribuan bisnis yang menggunakan Finako
        </p>
      </div>

      <!-- Registration Form -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Business Name -->
          <div>
            <label for="businessName" class="block text-sm font-medium text-gray-700 mb-2">
              Nama Bisnis *
            </label>
            <input
              id="businessName"
              v-model="form.businessName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="PT. Nama Perusahaan"
              :disabled="isLoading"
            />
          </div>

          <!-- Owner Name -->
          <div>
          <label for="full_name" class="block text-sm font-medium text-gray-700 mb-2">
            Nama Pemilik *
          </label>
          <input
            id="full_name"
            v-model="form.fullName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Nama lengkap pemilik"
            :disabled="isLoading"
          />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="email@perusahaan.com"
              :disabled="isLoading"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Minimal 6 karakter"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                :disabled="isLoading"
              >
                <svg v-if="showPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            </div>
          </div>

          
          

          <!-- Terms and Conditions -->
          <div class="flex items-start">
            <input
              id="agreeTerms"
              v-model="form.agreeTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              :disabled="isLoading"
            />
            <label for="agreeTerms" class="ml-2 block text-sm text-gray-700">
              Saya setuju dengan 
              <a href="#" class="text-green-600 hover:text-green-500">syarat dan ketentuan</a> 
              serta 
              <a href="#" class="text-green-600 hover:text-green-500">kebijakan privasi</a>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang' }}
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Sudah punya akun?
            <router-link
              to="/login"
              class="font-medium text-green-600 hover:text-green-500 transition-colors"
            >
              Masuk di sini
            </router-link>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center text-sm text-gray-500">
        <p>&copy; 2025 Finako. Platform POS untuk bisnis modern.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// 1. Ganti impor ke store yang benar
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';

const router = useRouter();
// 2. Inisialisasi store yang benar
const userStore = useUserStoreRefactored();

// 3. Ubah nama field agar lebih konsisten dengan penanganan form
const form = ref({
  businessName: '',
  fullName: '', // Diubah dari full_name
  email: '',
  password: '',
  agreeTerms: false
});

const isLoading = ref(false);
const showPassword = ref(false);
// 4. Hapus errorMessage lokal, kita akan pakai notifikasi global
// const errorMessage = ref('');

const isFormValid = computed(() => {
  return form.value.businessName &&
         form.value.fullName && // Gunakan fullName
         form.value.email &&
         form.value.password &&
         form.value.agreeTerms &&
         form.value.password.length >= 6;
});

// 5. Refactor fungsi handleRegister menjadi lebih bersih
async function handleRegister() {
  if (isLoading.value || !isFormValid.value) return;
  
  isLoading.value = true;
  
  // Panggil action `register` yang baru dari store yang sudah digabung
  const result = await userStore.register(
    form.value.email.trim(),
    form.value.password,
    form.value.fullName.trim(),
    form.value.businessName.trim()
  );

  if (result.success) {
    // Jika sukses, arahkan ke halaman berikutnya
    router.push({ name: 'RegisterSuccess' });
  }
  
  // Penanganan error sudah otomatis ditangani oleh notifikasi di dalam store
  isLoading.value = false;
}

// Fungsi onMounted tetap sama
onMounted(() => {
  const businessNameInput = document.getElementById('businessName');
  if (businessNameInput) {
    businessNameInput.focus();
  }
});
</script>