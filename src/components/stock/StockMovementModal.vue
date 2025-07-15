<template>
    <dialog class="modal" :class="{ 'modal-open': show }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Input Mutasi Stok</h3>
        
        <form @submit.prevent="onSave" class="mt-4 space-y-4">
          <div class="form-control w-full">
            <label class="label"><span class="label-text">Outlet</span></label>
            <input type="text" :value="outletName" class="input input-bordered w-full" disabled />
          </div>
          <div class="form-control w-full">
            <label class="label"><span class="label-text">Bahan Baku</span></label>
            <select v-model="form.ingredient_id" class="select select-bordered w-full" required>
              <option disabled value="">Pilih bahan baku</option>
              <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">
                {{ ing.name }}
              </option>
            </select>
          </div>
          <div class="form-control w-full">
            <label class="label"><span class="label-text">Jenis Mutasi</span></label>
            <select v-model="form.movement_type" class="select select-bordered w-full" required>
              <option value="masuk">Stok Masuk</option>
              <option value="keluar">Stok Keluar (Rusak/Hilang)</option>
              <option value="penyesuaian">Penyesuaian (Stok Opname)</option>
            </select>
          </div>
          <div class="form-control w-full">
            <label class="label"><span class="label-text">Jumlah</span></label>
            <input v-model.number="form.quantity" type="number" step="any" placeholder="0" class="input input-bordered w-full" required />
             <label class="label" v-if="form.movement_type === 'penyesuaian'">
              <span class="label-text-alt">Masukkan jumlah stok akhir yang benar setelah dihitung.</span>
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label"><span class="label-text">Keterangan (Opsional)</span></label>
            <input v-model="form.ref" type="text" placeholder="Contoh: Pembelian dari Pemasok A" class="input input-bordered w-full" />
          </div>
          
          <div class="modal-action mt-6">
            <button type="button" class="btn btn-ghost" @click="emit('close')">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="loading loading-spinner"></span>
              Simpan Mutasi
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
  
  function onSave() {
    emit('save', { ...form.value });
  }
  </script>