<template>
    <!-- Ganti kelas modal agar lebih konsisten -->
    <dialog :open="isOpen" class="modal" @close="emit('close')">
      <div class="modal-box">
        <!-- Tombol tutup tetap menggunakan emit -->
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="emit('close')">✕</button>
        <h3 class="font-bold text-xl text-gray-800">{{ formTitle }}</h3>
        
        <!-- Form dengan gaya yang diperbarui -->
        <form @submit.prevent="handleSubmit" class="py-4 space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">Nama Outlet</span></label>
            <input v-model="form.name" type="text" placeholder="Contoh: Cabang Jakarta Pusat" class="input input-bordered w-full" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-medium">Alamat Outlet (Opsional)</span></label>
            <textarea v-model="form.address" class="textarea textarea-bordered h-24" placeholder="Contoh: Jl. Merdeka No. 10"></textarea>
          </div>
          <div class="modal-action mt-6 pt-4 border-t">
            <button type="button" class="btn btn-ghost" @click="emit('close')">Batal</button>
            <button type="submit" class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" :disabled="outletStore.loading">
                <span v-if="outletStore.loading" class="loading loading-spinner"></span>
                {{ submitButtonText }}
            </button>
          </div>
        </form>
      </div>
      <!-- Latar belakang modal -->
      <form method="dialog" class="modal-backdrop">
        <button @click="emit('close')">close</button>
      </form>
    </dialog>
</template>
  
<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, watch, computed } from 'vue';
import { useOutletStore } from '@/stores/outletStore';
  
const props = defineProps({
    isOpen: { type: Boolean, required: true },
    outletToEdit: { type: Object, default: null },
});
const emit = defineEmits(['close']);
  
const outletStore = useOutletStore();
const form = ref({ name: '', address: '' });
  
const isEditMode = computed(() => !!props.outletToEdit);
const formTitle = computed(() => isEditMode.value ? 'Edit Outlet' : 'Tambah Outlet Baru');
const submitButtonText = computed(() => isEditMode.value ? 'Simpan Perubahan' : 'Tambah Outlet');
  
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
      if (props.outletToEdit) {
        form.value.name = props.outletToEdit.name;
        form.value.address = props.outletToEdit.address || '';
      } else {
        form.value.name = '';
        form.value.address = '';
      }
    }
});
  
const handleSubmit = async () => {
    const result = isEditMode.value
      ? await outletStore.updateOutlet(props.outletToEdit.id, form.value)
      : await outletStore.createOutlet(form.value);
  
    if (result.success) {
      emit('close');
    }
};
</script>
