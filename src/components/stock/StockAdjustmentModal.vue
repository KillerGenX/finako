<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box">
      <h3 class="font-bold text-xl text-gray-800">Kelola Stok: {{ ingredientName }}</h3>
      <p class="py-2 text-sm text-gray-500">Anda sedang mengatur detail stok untuk outlet: <span class="font-bold text-teal-600">{{ outletName }}</span>.</p>
      
      <!-- LOGIKA @submit TIDAK DIUBAH -->
      <form @submit.prevent="onSave" class="mt-4 space-y-6">
        <div class="space-y-4 p-4 border rounded-lg bg-gray-50/50">
            <div>
              <label class="block text-sm font-medium text-gray-700">Harga Modal / Beli (per {{ ingredientData?.unit }})</label>
              <!-- LOGIKA v-model TIDAK DIUBAH -->
              <input v-model.number="form.cost_price" type="number" step="any" placeholder="0" class="input input-bordered w-full mt-1" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Jumlah Stok Saat Ini</label>
              <!-- LOGIKA v-model TIDAK DIUBAH -->
              <input v-model.number="form.stock_quantity" type="number" step="any" placeholder="0" class="input input-bordered w-full mt-1" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Stok Minimum (Opsional)</label>
              <!-- LOGIKA v-model TIDAK DIUBAH -->
              <input v-model.number="form.min_stock" type="number" step="any" placeholder="0" class="input input-bordered w-full mt-1" />
              <p class="text-xs text-gray-500 mt-1">Akan menampilkan peringatan jika stok di bawah angka ini.</p>
            </div>
        </div>
        
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div>
            <span class="font-medium text-gray-700">Aktifkan bahan baku ini</span>
            <p class="text-xs text-gray-500">Nonaktifkan untuk menyembunyikan dari resep di outlet ini.</p>
          </div>
          <!-- LOGIKA v-model TIDAK DIUBAH -->
          <input type="checkbox" v-model="form.is_active" class="toggle toggle-primary" />
        </div>
        
        <div class="modal-action mt-6 pt-4 border-t">
          <!-- LOGIKA @click TIDAK DIUBAH -->
          <button type="button" class="btn btn-ghost" @click="emit('close')">Batal</button>
          <!-- LOGIKA :disabled TIDAK DIUBAH -->
          <button type="submit" class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner"></span>
            Simpan Pengaturan Stok
          </button>
        </div>
      </form>
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
