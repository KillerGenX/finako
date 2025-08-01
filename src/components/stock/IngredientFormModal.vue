<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box w-full max-w-lg mx-4 md:mx-auto h-[90vh] md:h-auto flex flex-col p-0">
      <!-- Mobile-First Header -->
      <div class="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex-1 pr-4">
            <h3 class="font-bold text-xl text-gray-800">
              {{ isEditMode ? '✏️ Edit' : '➕ Tambah' }} Bahan Baku
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              Master data untuk semua outlet
            </p>
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
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <!-- LOGIKA @submit TIDAK DIUBAH -->
        <form @submit.prevent="onSave" class="space-y-6">
          
          <!-- Info Card -->
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
            <div class="flex items-start space-x-3">
              <svg class="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h4 class="font-medium text-indigo-800">Master Data Bahan Baku</h4>
                <p class="text-sm text-indigo-700 mt-1">
                  Data ini akan tersedia di semua outlet. Anda bisa mengatur stok dan harga per outlet nanti.
                </p>
              </div>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="space-y-5">
            <!-- Nama Bahan Baku -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <span>Nama Bahan Baku</span>
                  <span class="text-red-500">*</span>
                </span>
              </label>
              <!-- LOGIKA v-model TIDAK DIUBAH -->
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="Contoh: Gula Pasir, Biji Kopi Robusta, Susu UHT..." 
                class="input input-bordered w-full touch-target no-zoom focus:ring-teal-500 focus:border-teal-500" 
                required 
              />
            </div>

            <!-- Satuan -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                <span class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                  </svg>
                  <span>Satuan</span>
                  <span class="text-red-500">*</span>
                </span>
              </label>
              <!-- LOGIKA v-model TIDAK DIUBAH -->
              <input 
                v-model="form.unit" 
                type="text" 
                placeholder="Contoh: kg, gram, liter, ml, pcs, pack..." 
                class="input input-bordered w-full touch-target no-zoom focus:ring-teal-500 focus:border-teal-500" 
                required 
              />
            </div>
          </div>

          <!-- Common Units Helper -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h5 class="font-medium text-gray-800 mb-3 flex items-center space-x-2">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              <span>Satuan Umum</span>
            </h5>
            <div class="grid grid-cols-3 gap-2">
              <button 
                type="button" 
                class="btn btn-outline btn-sm text-xs touch-target" 
                @click="form.unit = 'kg'"
              >
                kg
              </button>
              <button 
                type="button" 
                class="btn btn-outline btn-sm text-xs touch-target" 
                @click="form.unit = 'gram'"
              >
                gram
              </button>
              <button 
                type="button" 
                class="btn btn-outline btn-sm text-xs touch-target" 
                @click="form.unit = 'liter'"
              >
                liter
              </button>
              <button 
                type="button" 
                class="btn btn-outline btn-sm text-xs touch-target" 
                @click="form.unit = 'ml'"
              >
                ml
              </button>
              <button 
                type="button" 
                class="btn btn-outline btn-sm text-xs touch-target" 
                @click="form.unit = 'pcs'"
              >
                pcs
              </button>
              <button 
                type="button" 
                class="btn btn-outline btn-sm text-xs touch-target" 
                @click="form.unit = 'pack'"
              >
                pack
              </button>
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
            {{ isEditMode ? 'Update' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, watch, computed } from 'vue';

const props = defineProps({
  show: Boolean,
  ingredientToEdit: Object,
  isLoading: Boolean,
});

const emit = defineEmits(['close', 'save']);

const form = ref({ id: null, name: '', unit: '' });

const isEditMode = computed(() => !!props.ingredientToEdit?.id);

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (isEditMode.value) {
      form.value = { ...props.ingredientToEdit };
    } else {
      form.value = { id: null, name: '', unit: '' };
    }
  }
});

function onSave() {
  emit('save', { ...form.value });
}
</script>

<style scoped>
/* Mobile-first styles for IngredientFormModal */
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
  
  .btn-sm {
    padding: 8px 12px;
    font-size: 14px;
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
