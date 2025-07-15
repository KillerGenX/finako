<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Selamat Datang di Finako!</h1>
        <p class="text-gray-600 mt-2">Tinggal beberapa langkah lagi untuk menyiapkan bisnis Anda.</p>
      </div>

      <!-- Card Utama -->
      <div class="card w-full bg-base-100 shadow-xl">
        <div class="card-body">
          
          <!-- Stepper dari DaisyUI -->
          <ul class="steps mb-8">
            <li class="step" :class="{'step-primary': currentStep >= 1}">Info Bisnis</li>
            <li class="step" :class="{'step-primary': currentStep >= 2}">Outlet Utama</li>
            <li class="step" :class="{'step-primary': currentStep >= 3}">Selesai</li>
          </ul>

          <form @submit.prevent="handleSubmit">
            <!-- Step 1: Business Information -->
            <div v-show="currentStep === 1" class="space-y-4 animate-fade-in">
              <div>
                <label for="businessName" class="label"><span class="label-text">Nama Bisnis *</span></label>
                <input id="businessName" v-model="form.business_name" type="text" required class="input input-bordered w-full focus:input-primary" />
              </div>
              <div>
                <label for="businessAddress" class="label"><span class="label-text">Alamat Bisnis *</span></label>
                <textarea id="businessAddress" v-model="form.business_address" required rows="3" class="textarea textarea-bordered w-full focus:textarea-primary"></textarea>
              </div>
              <div>
                <label for="businessPhone" class="label"><span class="label-text">Nomor Telepon *</span></label>
                <input id="businessPhone" v-model="form.business_phone" type="tel" required class="input input-bordered w-full focus:input-primary" />
              </div>
            </div>

            <!-- Step 2: Outlet Information -->
            <div v-show="currentStep === 2" class="space-y-4 animate-fade-in">
              <div>
                <label for="outletName" class="label"><span class="label-text">Nama Outlet Utama *</span></label>
                <input id="outletName" v-model="form.outlet_name" type="text" required class="input input-bordered w-full focus:input-primary" placeholder="Contoh: Cabang Pusat, Dapur Utama"/>
              </div>
              <div>
                <label for="outletAddress" class="label"><span class="label-text">Alamat Outlet *</span></label>
                <textarea id="outletAddress" v-model="form.outlet_address" required rows="3" class="textarea textarea-bordered w-full focus:textarea-primary"></textarea>
              </div>
            </div>

            <!-- Step 3: Selesai -->
            <div v-show="currentStep === 3" class="text-center p-6 animate-fade-in">
              <div class="text-5xl mb-4">🎉</div>
              <h2 class="text-2xl font-bold text-gray-800">Semua Siap!</h2>
              <p class="text-gray-600 mt-2">Bisnis Anda telah berhasil disiapkan. Klik tombol di bawah untuk masuk ke dashboard dan mulai mengelola bisnis Anda.</p>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between pt-8 mt-4 border-t">
              <button type="button" @click="prevStep" :disabled="isLoading" class="btn btn-ghost" :class="{'invisible': currentStep === 1}">
                Kembali
              </button>
              <button
      v-if="currentStep < totalSteps"
      type="button"  
      @click="nextStep" 
      :disabled="isLoading || !isCurrentStepValid"
      class="btn btn-primary"
    >
      Lanjutkan
    </button>

    <!-- Tombol untuk STEP TERAKHIR (hanya ini yang men-submit form) -->
    <button
      v-else
      type="submit" 
      :disabled="isLoading || !isCurrentStepValid"
      class="btn btn-primary"
    >
      <span v-if="isLoading" class="loading loading-spinner"></span>
      Selesai & Masuk Dashboard
    </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Tombol Logout -->
      <div class="text-center mt-6">
        <button @click="handleLogout" class="btn btn-link text-gray-500 text-sm">Keluar dari Setup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';

const router = useRouter();
const userStore = useUserStoreRefactored();

const currentStep = ref(1);
const totalSteps = 3;
const isLoading = ref(false);

const form = ref({
  business_name: '',
  business_address: '',
  business_phone: '',
  outlet_name: '',
  outlet_address: '',
});

onMounted(() => {
  // Isi nama bisnis dari data yang sudah ada, jika ada
  if (userStore.business?.name) {
    form.value.business_name = userStore.business.name;
  }
});

const isCurrentStepValid = computed(() => {
  if (currentStep.value === 1) {
    return form.value.business_name && form.value.business_address && form.value.business_phone;
  }
  if (currentStep.value === 2) {
    return form.value.outlet_name && form.value.outlet_address;
  }
  return true; // Step 3 selalu valid
});

function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

async function handleSubmit() {
  if (!isCurrentStepValid.value || isLoading.value) return;

  if (currentStep.value < totalSteps) {
    nextStep();
    return;
  }
  
  // Final submission di step terakhir
  isLoading.value = true;

  const businessData = {
    name: form.value.business_name,
    address: form.value.business_address,
    phone_number: form.value.business_phone,
  };
  const outletData = {
    name: form.value.outlet_name,
    address: form.value.outlet_address,
  };

  const { success } = await userStore.setupBusinessAndFirstOutlet(businessData, outletData);

  if (success) {
    // Router guard akan otomatis mengarahkan ke dashboard
    // karena onboarding sudah selesai. Kita bisa push ke root.
    router.push('/');
  }
  
  isLoading.value = false;
}

async function handleLogout() {
  await userStore.logout();
}
</script>

<style scoped>
/* Animasi sederhana untuk transisi antar step */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
</style>