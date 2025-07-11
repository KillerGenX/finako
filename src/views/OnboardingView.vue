<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
    <div class="max-w-2xl w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Setup Bisnis Anda
        </h1>
        <p class="text-gray-600">
          Lengkapi informasi bisnis untuk mulai menggunakan Finako
        </p>
      </div>

      <!-- Progress Bar -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-purple-600">Langkah {{ currentStep }} dari {{ totalSteps }}</span>
          <span class="text-sm text-gray-500">{{ Math.round((currentStep / totalSteps) * 100) }}% selesai</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-purple-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Onboarding Form -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          
          <!-- Step 1: Business Information -->
          <div v-if="currentStep === 1" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Informasi Bisnis</h2>
            
            <div class="grid grid-cols-1 gap-6">
              <div>
                <label for="businessName" class="block text-sm font-medium text-gray-700 mb-2">
                  Nama Bisnis *
                </label>
                <input
                  id="businessName"
                  v-model="form.business_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="PT. Nama Perusahaan"
                  :disabled="isLoading"
                />
              </div>

              <div>
                <label for="businessAddress" class="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Bisnis *
                </label>
                <textarea
                  id="businessAddress"
                  v-model="form.business_address"
                  required
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Alamat lengkap bisnis"
                  :disabled="isLoading"
                ></textarea>
              </div>

              <div>
                <label for="businessPhone" class="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon *
                </label>
                <input
                  id="businessPhone"
                  v-model="form.business_phone"
                  type="tel"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="08123456789"
                  :disabled="isLoading"
                />
              </div>
            </div>
          </div>

          <!-- Step 2: Outlet Information -->
          <div v-if="currentStep === 2" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Outlet Utama</h2>
            
            <div class="grid grid-cols-1 gap-6">
              <div>
                <label for="outletName" class="block text-sm font-medium text-gray-700 mb-2">
                  Nama Outlet *
                </label>
                <input
                  id="outletName"
                  v-model="form.outlet_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Cabang Pusat"
                  :disabled="isLoading"
                />
              </div>

              <div>
                <label for="outletAddress" class="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Outlet *
                </label>
                <textarea
                  id="outletAddress"
                  v-model="form.outlet_address"
                  required
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Alamat outlet"
                  :disabled="isLoading"
                ></textarea>
              </div>
            </div>
          </div>


          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {{ errorMessage }}
          </div>

          <!-- Step 3: Ucapan Terima Kasih & Info Statis -->
          <div v-if="currentStep === 3" class="space-y-6 text-center">
            <h2 class="text-2xl font-bold text-purple-700 mb-2">Terima Kasih!</h2>
            <p class="text-gray-700 mb-4">Data bisnis dan outlet utama Anda telah siap. Anda dapat mengatur detail keuangan, pajak, dan pengaturan lanjutan setelah masuk ke dashboard.</p>
            <div class="bg-purple-50 border border-purple-200 rounded-md p-4 text-sm text-purple-800">
              <p>Selamat datang di Finako! Silakan lanjutkan ke dashboard untuk mulai menggunakan seluruh fitur aplikasi.</p>
              <p class="mt-2">Jika butuh bantuan, hubungi support di <a href="mailto:support@finako.id" class="text-purple-600 underline">support@finako.id</a></p>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between pt-6">
            <!-- Previous Button -->
            <button
              v-if="currentStep > 1"
              type="button"
              @click="currentStep--"
              :disabled="isLoading"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <div v-else></div>

            <!-- Next/Submit Button -->
            <button
              v-if="currentStep < 3"
              type="submit"
              :disabled="isLoading || !isCurrentStepValid"
              class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Menyimpan...' : (currentStep === totalSteps ? 'Selesai Setup' : 'Lanjutkan') }}
            </button>
            <button
              v-else
              type="submit"
              :disabled="isLoading"
              class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Menyimpan...' : 'Lanjut ke Dashboard' }}
            </button>
          </div>
        </form>

        <!-- Logout Button -->
        <div class="mt-6 pt-6 border-t border-gray-200">
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
            {{ isLoggingOut ? 'Keluar...' : 'Keluar dari Setup' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { supabase } from '@/supabase'
const router = useRouter()
const userStore = useUserStore()

// Form state
const currentStep = ref(1)
const totalSteps = ref(3)
const isLoading = ref(false)
const isLoggingOut = ref(false)
const errorMessage = ref('')

const form = ref({
  business_name: '',
  business_address: '',
  business_phone: '',
  outlet_name: '',
  outlet_address: '',
  tax_enabled: true,
  tax_percent: 11,
  service_charge_enabled: false,
  service_charge_percent: 0,
  fixed_costs: 0,
  avg_variable_cost: 0,
  avg_selling_price: 0
})

// Computed properties
const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return form.value.business_name && 
             form.value.business_address && 
             form.value.business_phone
    case 2:
      return form.value.outlet_name && 
             form.value.outlet_address
    case 3:
      return true // Financial config is optional
    default:
      return false
  }
})

// Handle form submission
async function handleSubmit() {
  if (isLoading.value) return

  // If not last step, go to next step
  if (currentStep.value < totalSteps.value) {
    currentStep.value++
    return
  }

  // Final submission
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Mapping field ke skema Supabase
    const businessUpdate = {
      name: form.value.business_name,
      address: form.value.business_address,
      phone_number: form.value.business_phone,
      onboarding_status: 'completed',
    }

    // Update bisnis & onboarding status via userStore action
    const { success, next_step, error: onboardingError } = await userStore.completeOnboarding(businessUpdate)
    if (!success) throw new Error(onboardingError || 'Gagal update data bisnis')

    // Insert outlet utama jika belum ada (opsional: bisa dicek dulu)
    const outletInsert = {
      business_id: userStore.organization.id,
      name: form.value.outlet_name,
      address: form.value.outlet_address,
    }
    // Cek apakah outlet utama sudah ada (bisa diimprove, sekarang insert saja)
    const { error: outletError } = await supabase
      .from('outlets')
      .insert([outletInsert])
    if (outletError) throw outletError

    // Sukses, redirect ke dashboard
    router.push('/')
  } catch (error) {
    console.error('Onboarding error:', error)
    errorMessage.value = error.message || 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    isLoading.value = false
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

// Initialize page
onMounted(() => {
  // Pre-fill organization name if available
  if (userStore.organization?.name) {
    form.value.business_name = userStore.organization.name
  }

  // Focus on first field
  const firstInput = document.getElementById('businessName')
  if (firstInput) {
    firstInput.focus()
  }
})
</script>
