<template>
    <dialog :open="isOpen" class="modal">
      <div class="modal-box">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
        <h3 class="font-bold text-lg">Undang Pegawai Baru</h3>
        <p class="py-2 text-sm">Pegawai yang diundang akan otomatis mendapatkan peran "Kasir". Mereka akan menerima email untuk mengatur password dan bergabung.</p>
        
        <form @submit.prevent="handleSubmit" class="py-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email Pegawai</span>
            </label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="pegawai@bisnisanda.com" 
              class="input input-bordered w-full" 
              required 
            />
          </div>
          <div class="modal-action mt-6">
            <button type="button" class="btn" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :class="{ 'loading': employeeStore.loading }">
              Kirim Undangan
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeModal">close</button>
      </form>
    </dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useEmployeeStore } from '@/stores/employeeStore';
  
  const props = defineProps({
    isOpen: { type: Boolean, required: true },
  });
  const emit = defineEmits(['close']);
  
  const employeeStore = useEmployeeStore();
  const email = ref('');
  
  const handleSubmit = async () => {
    if (!email.value) return;
    await employeeStore.inviteEmployee(email.value);
    
    // Jika tidak ada error, tutup modal
    // (Store kita saat ini tidak melempar error, tapi menangani notifikasi, jadi kita tutup saja)
    closeModal();
  };
  
  const closeModal = () => {
    email.value = ''; // Reset form
    emit('close');
  };
  </script>