<template>
    <dialog class="modal" :class="{ 'modal-open': show }">
      <div class="modal-box">
        <h3 class="font-bold text-xl text-gray-800">Input Mutasi Stok</h3>
        <p class="py-2 text-sm text-gray-500">Catat pergerakan stok untuk menjaga data tetap akurat.</p>
        
        <!-- LOGIKA @submit TIDAK DIUBAH -->
        <form @submit.prevent="onSave" class="mt-4 space-y-4">
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Outlet</span></label>
            <input type="text" :value="outletName" class="input input-bordered w-full bg-gray-100" disabled />
          </div>
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Bahan Baku</span></label>
            <!-- LOGIKA v-model TIDAK DIUBAH -->
            <select v-model="form.ingredient_id" class="select select-bordered w-full" required>
              <option disabled value="">Pilih bahan baku</option>
              <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">
                {{ ing.name }}
              </option>
            </select>
          </div>
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Jenis Mutasi</span></label>
            <!-- LOGIKA v-model TIDAK DIUBAH -->
            <select v-model="form.movement_type" class="select select-bordered w-full" required>
              <option value="masuk">Stok Masuk (cth: Pembelian)</option>
              <option value="keluar">Stok Keluar (cth: Rusak, Hilang)</option>
              <option value="penyesuaian">Penyesuaian (Stok Opname)</option>
            </select>
          </div>
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Jumlah</span></label>
            <!-- LOGIKA v-model TIDAK DIUBAH -->
            <input v-model.number="form.quantity" type="number" step="any" placeholder="0" class="input input-bordered w-full" required />
            <!-- LOGIKA v-if TIDAK DIUBAH, HANYA TAMPILAN LABEL -->
             <label class="label" v-if="form.movement_type === 'penyesuaian'">
              <span class="label-text-alt text-blue-600">Untuk Penyesuaian, masukkan jumlah stok AKHIR yang benar setelah dihitung.</span>
            </label>
          </div>
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Keterangan (Opsional)</span></label>
            <!-- LOGIKA v-model TIDAK DIUBAH -->
            <input v-model="form.ref" type="text" placeholder="Contoh: Pembelian dari Pemasok A" class="input input-bordered w-full" />
          </div>
          
          <div class="modal-action mt-6 pt-4 border-t">
            <!-- LOGIKA @click TIDAK DIUBAH -->
            <button type="button" class="btn btn-ghost" @click="emit('close')">Batal</button>
            <!-- LOGIKA :disabled TIDAK DIUBAH -->
            <button type="submit" class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" :disabled="isLoading">
              <span v-if="isLoading" class="loading loading-spinner"></span>
              Simpan Mutasi
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
