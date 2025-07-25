<template>
    <dialog :open="isOpen" class="modal">
      <div class="modal-box">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
        <h3 class="font-bold text-xl text-gray-800">Undang Pegawai Baru</h3>
        <p class="py-2 text-sm text-gray-500">Pegawai akan menerima email untuk mengatur password dan bergabung. Mereka akan otomatis mendapatkan peran "Kasir".</p>
        
        <!-- LOGIKA @submit TIDAK DIUBAH -->
        <form @submit.prevent="handleSubmit" class="py-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Email Pegawai</span>
            </label>
            <!-- LOGIKA v-model TIDAK DIUBAH -->
            <input 
              v-model="email" 
              type="email" 
              placeholder="pegawai@bisnisanda.com" 
              class="input input-bordered w-full" 
              required 
            />
          </div>
          <div class="modal-action mt-6 pt-4 border-t">
            <!-- LOGIKA @click TIDAK DIUBAH -->
            <button type="button" class="btn btn-ghost" @click="closeModal">Batal</button>
            <!-- LOGIKA :class TIDAK DIUBAH, HANYA GAYA CSS -->
            <button type="submit" class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" :disabled="employeeStore.loading">
                <span v-if="employeeStore.loading" class="loading loading-spinner"></span>
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
// SCRIPT TIDAK DIUBAH SAMA SEKALI
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
    const success = await employeeStore.inviteEmployee(email.value);
    if (success) {
      closeModal();
    }
};
  
const closeModal = () => {
    email.value = '';
    emit('close');
};
</script>
