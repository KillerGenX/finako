<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box w-full max-w-lg mx-4 md:mx-auto h-[95vh] md:h-auto flex flex-col p-0">
      <!-- Mobile-First Header -->
      <div class="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex-1 pr-4">
            <h3 class="font-bold text-xl text-gray-800">Kelola Stok</h3>
            <div class="flex items-center space-x-2 mt-1">
              <span class="font-semibold text-teal-700">{{ ingredientName }}</span>
              <span class="text-sm text-gray-500">di</span>
              <span class="font-medium text-gray-600">{{ outletName }}</span>
            </div>
          </div>
          <button 
            type="button" 
            @click="emit('close')" 
            class="btn btn-ghost btn-sm btn-circle touch-target flex-shrink-0"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile-Optimized Form Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <!-- LOGIKA @submit TIDAK DIUBAH -->
        <form @submit.prevent="onSave" class="space-y-6">
          
          <!-- Stock & Pricing Section -->
          <div class="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-4">
            <div class="flex items-center space-x-2 mb-4">
              <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
              <h4 class="font-semibold text-gray-800">Informasi Stok & Harga</h4>
            </div>
            
            <div class="space-y-4">
              <!-- Harga Modal -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  <span class="flex items-center space-x-1">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                    <span>Harga Modal / Beli</span>
                    <span v-if="ingredientData?.unit" class="text-xs text-gray-500">(per {{ ingredientData.unit }})</span>
                  </span>
                </label>
                <!-- LOGIKA v-model TIDAK DIUBAH -->
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                  <input 
                    v-model.number="form.cost_price" 
                    type="number" 
                    step="any" 
                    placeholder="0" 
                    class="input input-bordered w-full pl-12 touch-target no-zoom focus:ring-teal-500 focus:border-teal-500" 
                  />
                </div>
              </div>

              <!-- Jumlah Stok -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  <span class="flex items-center space-x-1">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    <span>Jumlah Stok Saat Ini</span>
                    <span class="text-red-500">*</span>
                  </span>
                </label>
                <!-- LOGIKA v-model TIDAK DIUBAH -->
                <input 
                  v-model.number="form.stock_quantity" 
                  type="number" 
                  step="any" 
                  placeholder="Masukkan jumlah stok..." 
                  class="input input-bordered w-full touch-target no-zoom focus:ring-teal-500 focus:border-teal-500" 
                  required 
                />
              </div>

              <!-- Stok Minimum -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  <span class="flex items-center space-x-1">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <span>Stok Minimum</span>
                    <span class="text-gray-400 text-xs">(Opsional)</span>
                  </span>
                </label>
                <!-- LOGIKA v-model TIDAK DIUBAH -->
                <input 
                  v-model.number="form.min_stock" 
                  type="number" 
                  step="any" 
                  placeholder="Batas minimum stok..." 
                  class="input input-bordered w-full touch-target no-zoom focus:ring-teal-500 focus:border-teal-500" 
                />
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div class="flex items-start space-x-2">
                    <svg class="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                    <p class="text-sm text-yellow-700">
                      Sistem akan menampilkan peringatan ketika stok mencapai batas minimum ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Activation -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-gray-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <span class="font-medium text-gray-800">Aktifkan Bahan Baku</span>
                  <p class="text-sm text-gray-600 mt-1">
                    Nonaktifkan untuk menyembunyikan dari resep dan menu di outlet ini
                  </p>
                </div>
              </div>
              <!-- LOGIKA v-model TIDAK DIUBAH -->
              <input 
                type="checkbox" 
                v-model="form.is_active" 
                class="toggle toggle-primary toggle-lg" 
              />
            </div>
          </div>
        </form>
      </div>

      <!-- Mobile-First Sticky Footer -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 pb-safe">
        <div class="flex space-x-3">
          <!-- LOGIKA @click TIDAK DIUBAH -->
          <button 
            type="button" 
            class="btn btn-outline flex-1 touch-target" 
            @click="emit('close')"
          >
            Batal
          </button>
          <!-- LOGIKA :disabled dan @click TIDAK DIUBAH -->
          <button 
            type="submit" 
            class="btn bg-teal-600 hover:bg-teal-700 text-white border-none flex-1 touch-target" 
            :disabled="isLoading"
            @click="onSave"
          >
            <span v-if="isLoading" class="loading loading-spinner loading-sm mr-2"></span>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  ingredientData: Object,
  outletName: String,
  isLoading: Boolean,
});

const emit = defineEmits(['close', 'save']);

const form = ref({});
const ingredientName = ref('');

watch(() => props.show, (newVal) => {
  if (newVal && props.ingredientData) {
    ingredientName.value = props.ingredientData.name;
    form.value = {
      ingredient_id: props.ingredientData.id,
      outlet_id: props.ingredientData.outlet_id,
      stock_quantity: props.ingredientData.stock_quantity ?? 0,
      min_stock: props.ingredientData.min_stock ?? 0,
      is_active: props.ingredientData.is_active ?? true,
      cost_price: props.ingredientData.cost_price ?? 0,
    };
  }
});

function onSave() {
  emit('save', { ...form.value });
}
</script>

<style scoped>
/* Mobile-first styles for StockAdjustmentModal */
.touch-target {
  min-height: 44px;
  touch-action: manipulation;
}

.no-zoom {
  font-size: 16px; /* Prevent zoom on iOS */
}

.pb-safe {
  padding-bottom: calc(env(safe-area-inset-bottom) + 16px);
}

/* Enhanced mobile form styling */
@media (max-width: 640px) {
  .input, .select {
    font-size: 16px; /* Prevent zoom */
    padding: 12px 16px;
  }
  
  .btn {
    padding: 12px 20px;
    font-size: 16px;
    font-weight: 600;
  }
}

/* Improved focus states */
.focus\:ring-teal-500:focus {
  --tw-ring-color: rgb(20 184 166);
}

.focus\:border-teal-500:focus {
  border-color: rgb(20 184 166);
}
</style>
