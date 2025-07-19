<template>
    <dialog :open="isOpen" class="modal modal-bottom sm:modal-middle" @close="emit('close')">
      <div class="modal-box">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="emit('close')">✕</button>
        <h3 class="font-bold text-lg">{{ formTitle }}</h3>
        
        <form @submit.prevent="handleSubmit" class="py-4 space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Nama Outlet</span></label>
            <input v-model="form.name" type="text" placeholder="Contoh: Cabang Jakarta Pusat" class="input input-bordered w-full" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Alamat Outlet (Opsional)</span></label>
            <textarea v-model="form.address" class="textarea textarea-bordered h-24" placeholder="Contoh: Jl. Merdeka No. 10"></textarea>
          </div>
          <div class="modal-action mt-6">
            <button type="button" class="btn" @click="emit('close')">Batal</button>
            <button type="submit" class="btn btn-primary" :class="{ 'loading': outletStore.loading }">
              {{ submitButtonText }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="emit('close')">close</button>
      </form>
    </dialog>
  </template>
  
  <script setup>
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
  const submitButtonText = computed(() => isEditMode.value ? 'Simpan' : 'Tambah');
  
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