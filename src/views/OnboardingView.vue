<template>
  <div class="relative min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden flex items-center justify-center p-4">
    <!-- Ornamen Latar Belakang -->
    <div class="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 z-0 text-teal-100 opacity-60">
      <svg width="404" height="404" fill="none" viewBox="0 0 404 404"><rect width="404" height="404" fill="url(#svg-pattern-squares-1)"></rect></svg>
    </div>
    <div class="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 z-0 text-teal-100 opacity-75">
      <svg width="300" height="300" fill="none" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="currentColor"></circle></svg>
    </div>

    <!-- Konten Utama -->
    <div class="relative max-w-2xl w-full z-10">
      <div class="text-center mb-8">
        <img class="mx-auto h-12 w-auto mb-4" src="@/assets/finako.svg" alt="Finako Logo" />
        <h1 class="text-3xl font-bold text-gray-900">Pengaturan Awal Bisnis Anda</h1>
        <p class="mt-2 text-gray-600">Hanya beberapa langkah untuk memulai.</p>
      </div>

      <!-- Kartu Onboarding -->
      <div class="bg-white/70 backdrop-blur-sm rounded-xl shadow-2xl">
        <div class="p-8">
          <!-- Stepper Kustom -->
          <div class="flex justify-between items-center mb-8">
            <div v-for="step in totalSteps" :key="step" class="flex-1 flex items-center" :class="{ 'cursor-pointer': step < currentStep }" @click="goToStep(step)">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center font-bold', step <= currentStep ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500']">
                <svg v-if="step < currentStep" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                <span v-else>{{ step }}</span>
              </div>
              <div :class="['ml-3 text-sm font-medium', step <= currentStep ? 'text-teal-700' : 'text-gray-500']">
                <span v-if="step === 1">Info Bisnis</span>
                <span v-if="step === 2">Outlet Utama</span>
                <span v-if="step === 3">Selesai</span>
              </div>
              <div v-if="step < totalSteps" class="flex-1 h-0.5 mx-4" :class="step < currentStep ? 'bg-teal-500' : 'bg-gray-200'"></div>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="min-h-[250px]">
            <!-- Konten Step -->
            <div class="animate-fade-in">
              <!-- Step 1: Business Information -->
              <div v-show="currentStep === 1" class="space-y-4">
                <div>
                  <label for="businessName" class="block text-sm font-medium text-gray-700">Nama Bisnis</label>
                  <input id="businessName" v-model="form.business_name" type="text" required class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                  <label for="businessAddress" class="block text-sm font-medium text-gray-700">Alamat Bisnis</label>
                  <textarea id="businessAddress" v-model="form.business_address" required rows="3" class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"></textarea>
                </div>
                <div>
                  <label for="businessPhone" class="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                  <input id="businessPhone" v-model="form.business_phone" type="tel" required class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
                </div>
              </div>

              <!-- Step 2: Outlet Information -->
              <div v-show="currentStep === 2" class="space-y-4">
                <div>
                  <label for="outletName" class="block text-sm font-medium text-gray-700">Nama Outlet Utama</label>
                  <input id="outletName" v-model="form.outlet_name" type="text" required class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="Contoh: Cabang Pusat"/>
                </div>
                <div>
                  <label for="outletAddress" class="block text-sm font-medium text-gray-700">Alamat Outlet</label>
                  <textarea id="outletAddress" v-model="form.outlet_address" required rows="3" class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"></textarea>
                </div>
              </div>

              <!-- Step 3: Selesai -->
              <div v-show="currentStep === 3" class="text-center p-6">
                <div class="mx-auto w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center">
                   <svg class="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mt-5">Semua Siap!</h2>
                <p class="text-gray-600 mt-2">Bisnis Anda telah berhasil disiapkan. Klik tombol di bawah untuk masuk ke dashboard.</p>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between pt-8 mt-4 border-t border-gray-200">
              <button type="button" @click="prevStep" :disabled="isLoading" class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" :class="{'invisible': currentStep === 1}">
                Kembali
              </button>
              <button v-if="currentStep < totalSteps" type="button" @click="nextStep" :disabled="isLoading || !isCurrentStepValid" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50">
                Lanjutkan
              </button>
              <button v-else type="submit" :disabled="isLoading || !isCurrentStepValid" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50">
                <span v-if="isLoading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                Selesai & Masuk Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Tombol Logout -->
      <div class="text-center mt-6">
        <button @click="handleLogout" class="text-sm text-gray-500 hover:text-gray-700 hover:underline">Keluar dari Setup</button>
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
  return true;
});

function goToStep(step) {
  if (step < currentStep.value) {
    currentStep.value = step;
  }
}

function nextStep() {
  if (currentStep.value < totalSteps && isCurrentStepValid.value) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

async function handleSubmit() {
  if (!isCurrentStepValid.value) return;

  if (currentStep.value === totalSteps) {
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
      router.push('/');
    }
    isLoading.value = false;
  } else {
    nextStep();
  }
}

async function handleLogout() {
  await userStore.logout();
}
</script>

<style scoped>
/* Definisi pattern SVG untuk ornamen, jika dibutuhkan oleh template */
#svg-pattern-squares-1 rect {
  fill: currentColor;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
