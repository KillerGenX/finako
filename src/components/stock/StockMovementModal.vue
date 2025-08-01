<template>
    <dialog class="modal" :class="{ 'modal-open': show }">
      <div class="modal-box w-full max-w-lg mx-4 md:mx-auto h-[95vh] md:h-auto flex flex-col p-0">
        <!-- Mobile-First Header -->
        <div class="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-xl text-gray-800">Input Mutasi Stok</h3>
              <p class="text-sm text-gray-500 mt-1">Catat pergerakan stok untuk menjaga data tetap akurat</p>
            </div>
            <button 
              type="button" 
              @click="emit('close')" 
              class="btn btn-ghost btn-sm btn-circle touch-target"
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
            
            <!-- Outlet Info Card -->
            <div class="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <div>
                  <p class="text-sm font-medium text-gray-700">Outlet Aktif</p>
                  <p class="font-semibold text-gray-800">{{ outletName }}</p>
                </div>
              </div>
            </div>

            <!-- Bahan Baku Selection -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <span>Bahan Baku</span>
                  <span class="text-red-500">*</span>
                </span>
              </label>
              <!-- LOGIKA v-model TIDAK DIUBAH -->
              <select 
                v-model="form.ingredient_id" 
                class="select select-bordered w-full touch-target no-zoom focus:ring-teal-500 focus:border-teal-500" 
                required
              >
                <option disabled value="">Pilih bahan baku...</option>
                <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">
                  {{ ing.name }}
                </option>
              </select>
            </div>

            <!-- Jenis Mutasi Selection -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M4 18v-5h5m11-4h-5V4M15 18h5v-5"/>
                  </svg>
                  <span>Jenis Mutasi</span>
                  <span class="text-red-500">*</span>
                </span>
              </label>
              <!-- LOGIKA v-model TIDAK DIUBAH -->
              <select 
                v-model="form.movement_type" 
                class="select select-bordered w-full touch-target no-zoom focus:ring-teal-500 focus:border-teal-500" 
                required
              >
                <option value="masuk">
                  📈 Stok Masuk (Pembelian, Produksi)
                </option>
                <option value="keluar">
                  📉 Stok Keluar (Rusak, Hilang, Terpakai)
                </option>
                <option value="penyesuaian">
                  ⚖️ Penyesuaian (Stok Opname)
                </option>
              </select>
            </div>

            <!-- Jumlah Input dengan Info Helper -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                  </svg>
                  <span>Jumlah</span>
                  <span class="text-red-500">*</span>
                </span>
              </label>
              <!-- LOGIKA v-model TIDAK DIUBAH -->
              <input 
                v-model.number="form.quantity" 
                type="number" 
                step="any" 
                placeholder="Masukkan jumlah..." 
                class="input input-bordered w-full touch-target no-zoom focus:ring-teal-500 focus:border-teal-500" 
                required 
              />
              <!-- LOGIKA v-if TIDAK DIUBAH, HANYA TAMPILAN LABEL -->
              <div v-if="form.movement_type === 'penyesuaian'" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="flex items-start space-x-2">
                  <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm text-blue-700">
                    <span class="font-medium">Info Penyesuaian:</span><br>
                    Masukkan jumlah stok <strong>AKHIR</strong> yang benar setelah dihitung fisik.
                  </p>
                </div>
              </div>
            </div>

            <!-- Keterangan -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                  <span>Keterangan</span>
                  <span class="text-gray-400 text-xs">(Opsional)</span>
                </span>
              </label>
              <!-- LOGIKA v-model TIDAK DIUBAH -->
              <input 
                v-model="form.ref" 
                type="text" 
                placeholder="Contoh: Pembelian dari Pemasok A, Rusak karena expired..." 
                class="input input-bordered w-full touch-target no-zoom focus:ring-teal-500 focus:border-teal-500" 
              />
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
              Simpan Mutasi
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
    ingredients: Array,
    outletId: String,
    outletName: String,
    isLoading: Boolean,
});

const emit = defineEmits(['close', 'save']);

const form = ref({});

const initialFormState = () => ({
    ingredient_id: '',
    outlet_id: props.outletId,
    movement_type: 'masuk',
    quantity: 0,
    ref: '',
});

watch(() => props.show, (newVal) => {
    if (newVal) {
      form.value = initialFormState();
    }
});

watch(() => props.outletId, (newId) => {
    if (form.value) {
        form.value.outlet_id = newId;
    }
})

function onSave() {
    emit('save', { ...form.value });
}
</script>

<style scoped>
/* Mobile-first styles for StockMovementModal */
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
