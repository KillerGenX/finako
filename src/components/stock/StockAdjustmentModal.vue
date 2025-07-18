<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Kelola Stok: {{ ingredientName }}</h3>
      <p class="py-2 text-sm">Anda sedang mengatur stok untuk outlet: <span class="font-bold">{{ outletName }}</span>.</p>
      
      <form @submit.prevent="onSave" class="mt-4 space-y-4">
        
        <!-- === TAMBAHAN: Input Harga Modal di Atas === -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Harga Modal / Beli (per {{ ingredientData?.unit }})</span>
          </label>
          <input v-model.number="form.cost_price" type="number" step="any" placeholder="0" class="input input-bordered w-full" />
        </div>
        <!-- === AKHIR TAMBAHAN === -->
        
        <div class="form-control w-full">
          <label class="label"><span class="label-text">Jumlah Stok Saat Ini</span></label>
          <input v-model.number="form.stock_quantity" type="number" step="any" placeholder="0" class="input input-bordered w-full" required />
        </div>
        
        <div class="form-control w-full">
          <label class="label"><span class="label-text">Stok Minimum (Opsional)</span></label>
          <input v-model.number="form.min_stock" type="number" step="any" placeholder="0" class="input input-bordered w-full" />
          <label class="label"><span class="label-text-alt">Akan menampilkan peringatan jika stok di bawah angka ini.</span></label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Aktifkan bahan baku ini di outlet</span> 
            <input type="checkbox" v-model="form.is_active" class="toggle toggle-primary" />
          </label>
        </div>
        
        <div class="modal-action mt-6">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Batal</button>
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner"></span>
            Simpan Stok
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  ingredientData: Object, // Data gabungan dari getter
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
      // === TAMBAHAN: Siapkan state untuk cost_price ===
      cost_price: props.ingredientData.cost_price ?? 0,
    };
  }
});

function onSave() {
  emit('save', { ...form.value });
}
</script>