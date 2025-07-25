<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box">
      <h3 class="font-bold text-xl text-gray-800">{{ isEditMode ? 'Edit' : 'Tambah' }} Bahan Baku</h3>
      <p class="py-2 text-sm text-gray-500">Ini adalah master data bahan baku yang akan digunakan di semua outlet.</p>
      
      <!-- LOGIKA @submit TIDAK DIUBAH -->
      <form @submit.prevent="onSave" class="mt-4 space-y-4">
        <div class="form-control w-full">
          <label class="label"><span class="label-text font-medium">Nama Bahan Baku</span></label>
          <!-- LOGIKA v-model TIDAK DIUBAH -->
          <input v-model="form.name" type="text" placeholder="Contoh: Gula Pasir, Biji Kopi" class="input input-bordered w-full" required />
        </div>
        <div class="form-control w-full">
          <label class="label"><span class="label-text font-medium">Satuan</span></label>
          <!-- LOGIKA v-model TIDAK DIUBAH -->
          <input v-model="form.unit" type="text" placeholder="Contoh: gram, ml, pcs" class="input input-bordered w-full" required />
        </div>
        
        <div class="modal-action mt-6 pt-4 border-t">
          <!-- LOGIKA @click TIDAK DIUBAH -->
          <button type="button" class="btn btn-ghost" @click="emit('close')">Batal</button>
          <!-- LOGIKA :disabled TIDAK DIUBAH -->
          <button type="submit" class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner"></span>
            Simpan
          </button>
        </div>
      </form>
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
