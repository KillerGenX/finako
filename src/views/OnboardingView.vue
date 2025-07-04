<template>
  <div class="min-h-screen bg-base-200 p-4">
    <div class="max-w-2xl mx-auto">
      <!-- Progress Steps -->
      <div class="mb-8">
        <ul class="steps w-full">
          <li class="step" :class="{ 'step-primary': currentStep >= 1 }">Profil Bisnis</li>
          <li class="step" :class="{ 'step-primary': currentStep >= 2 }">Outlet Utama</li>
          <li class="step" :class="{ 'step-primary': currentStep >= 3 }">Konfigurasi</li>
          <li class="step" :class="{ 'step-primary': currentStep >= 4 }">Selesai</li>
        </ul>
      </div>

      <!-- Step Content -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- Step 1: Business Profile -->
          <div v-if="currentStep === 1">
            <h2 class="card-title mb-4">Profil Bisnis Anda</h2>
            <p class="mb-6 text-base-content/70">Masukkan informasi dasar tentang bisnis Anda</p>
            
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Nama Bisnis</span>
                </label>
                <input 
                  type="text" 
                  v-model="businessData.businessName"
                  class="input input-bordered" 
                  placeholder="Contoh: Toko Kelontong Bahagia"
                  required 
                />
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Jenis Bisnis</span>
                </label>
                <select v-model="businessData.businessType" class="select select-bordered">
                  <option value="">Pilih jenis bisnis</option>
                  <option value="retail">Retail/Toko</option>
                  <option value="fnb">Food & Beverage</option>
                  <option value="service">Jasa</option>
                  <option value="wholesale">Grosir</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Alamat Bisnis</span>
                </label>
                <textarea 
                  v-model="businessData.businessAddress"
                  class="textarea textarea-bordered" 
                  placeholder="Alamat lengkap bisnis Anda"
                  rows="3"
                ></textarea>
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Nomor Telepon</span>
                </label>
                <input 
                  type="tel" 
                  v-model="businessData.businessPhone"
                  class="input input-bordered" 
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
          </div>

          <!-- Step 2: Outlet Setup -->
          <div v-if="currentStep === 2">
            <h2 class="card-title mb-4">Setup Outlet Utama</h2>
            <p class="mb-6 text-base-content/70">Buat outlet pertama untuk bisnis Anda</p>
            
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Nama Outlet</span>
                </label>
                <input 
                  type="text" 
                  v-model="outletData.name"
                  class="input input-bordered" 
                  placeholder="Contoh: Cabang Pusat, Outlet Mall"
                  required 
                />
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Alamat Outlet</span>
                </label>
                <textarea 
                  v-model="outletData.address"
                  class="textarea textarea-bordered" 
                  placeholder="Alamat outlet (bisa sama dengan alamat bisnis)"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 3: Configuration -->
          <div v-if="currentStep === 3">
            <h2 class="card-title mb-4">Konfigurasi Dasar</h2>
            <p class="mb-6 text-base-content/70">Atur pengaturan operasional bisnis Anda</p>
            
            <div class="space-y-6">
              <!-- Tax Settings -->
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Aktifkan Pajak (PPN)</span>
                  <input 
                    type="checkbox" 
                    v-model="configData.taxEnabled"
                    class="checkbox checkbox-primary" 
                  />
                </label>
              </div>
              
              <div v-if="configData.taxEnabled" class="form-control">
                <label class="label">
                  <span class="label-text">Persentase Pajak (%)</span>
                </label>
                <input 
                  type="number" 
                  v-model="configData.taxPercent"
                  class="input input-bordered" 
                  placeholder="11"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <!-- Service Charge Settings -->
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Aktifkan Service Charge</span>
                  <input 
                    type="checkbox" 
                    v-model="configData.serviceChargeEnabled"
                    class="checkbox checkbox-primary" 
                  />
                </label>
              </div>
              
              <div v-if="configData.serviceChargeEnabled" class="form-control">
                <label class="label">
                  <span class="label-text">Persentase Service Charge (%)</span>
                </label>
                <input 
                  type="number" 
                  v-model="configData.serviceChargePercent"
                  class="input input-bordered" 
                  placeholder="5"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <!-- Step 4: Completion -->
          <div v-if="currentStep === 4">
            <div class="text-center">
              <div class="mb-4">
                <div class="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-success-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h2 class="text-2xl font-bold mb-2">Selamat!</h2>
              <p class="mb-6 text-base-content/70">Setup awal bisnis Anda telah selesai. Anda siap untuk mulai menggunakan Finako!</p>
              
              <div class="bg-base-200 p-4 rounded-lg mb-6">
                <h3 class="font-semibold mb-2">Ringkasan Setup:</h3>
                <ul class="text-left space-y-1">
                  <li>✅ Profil Bisnis: {{ businessData.businessName }}</li>
                  <li>✅ Outlet: {{ outletData.name }}</li>
                  <li>✅ Konfigurasi: Pajak {{ configData.taxEnabled ? 'Aktif' : 'Nonaktif' }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="card-actions justify-between mt-8">
            <button 
              v-if="currentStep > 1" 
              @click="previousStep" 
              class="btn btn-outline"
            >
              Sebelumnya
            </button>
            <div v-else></div>
            
            <button 
              v-if="currentStep < 4" 
              @click="nextStep" 
              class="btn btn-primary"
              :disabled="!canProceed"
            >
              {{ currentStep === 3 ? 'Selesaikan Setup' : 'Selanjutnya' }}
            </button>
            
            <button 
              v-if="currentStep === 4" 
              @click="finishOnboarding" 
              class="btn btn-success"
              :disabled="loading"
            >
              <span v-if="loading" class="loading loading-spinner"></span>
              Mulai Menggunakan Finako
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { supabase } from '@/supabase'

const router = useRouter()
const userStore = useUserStore()

const currentStep = ref(1)
const loading = ref(false)

// Form data
const businessData = ref({
  businessName: '',
  businessType: '',
  businessAddress: '',
  businessPhone: ''
})

const outletData = ref({
  name: '',
  address: ''
})

const configData = ref({
  taxEnabled: false,
  taxPercent: 11,
  serviceChargeEnabled: false,
  serviceChargePercent: 5
})

// Computed
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return businessData.value.businessName && businessData.value.businessType
  }
  if (currentStep.value === 2) {
    return outletData.value.name
  }
  if (currentStep.value === 3) {
    return true
  }
  return false
})

// Methods
function nextStep() {
  if (canProceed.value) {
    currentStep.value++
  }
}

function previousStep() {
  currentStep.value--
}

async function finishOnboarding() {
  try {
    loading.value = true

    const organizationId = userStore.organization.id

    // 1. Create business profile
    await supabase.from('business_profiles').insert({
      organization_id: organizationId,
      tax_enabled: configData.value.taxEnabled,
      tax_percent: configData.value.taxPercent,
      service_charge_enabled: configData.value.serviceChargeEnabled,
      service_charge_percent: configData.value.serviceChargePercent
    })

    // 2. Create main outlet
    await supabase.from('outlets').insert({
      organization_id: organizationId,
      name: outletData.value.name,
      address: outletData.value.address
    })

    // 3. Update organization dengan business info
    await supabase.from('organizations').update({
      name: businessData.value.businessName,
      address: businessData.value.businessAddress,
      phone: businessData.value.businessPhone
    }).eq('id', organizationId)

    // 4. Refresh user store
    await userStore.fetchUserProfile()

    // 5. Redirect to dashboard
    if (userStore.userRole === 'pegawai') {
      router.push('/transaksi')
    } else {
      router.push('/')
    }

  } catch (error) {
    console.error('Onboarding error:', error)
    alert('Terjadi kesalahan saat menyelesaikan setup. Silakan coba lagi.')
  } finally {
    loading.value = false
  }
}
</script>
