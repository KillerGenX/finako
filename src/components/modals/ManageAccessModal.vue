<template>
    <dialog :open="isOpen" class="modal">
      <div class="modal-box">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
        <h3 class="font-bold text-lg">Kelola Akses Outlet</h3>
        <p class="py-2 text-sm">
          Atur outlet mana saja yang bisa diakses oleh <strong>{{ employee.full_name }}</strong>.
        </p>
  
        <div v-if="loadingInitialData" class="text-center py-6">
          <span class="loading loading-spinner"></span>
        </div>
  
        <div v-else class="form-control space-y-2 max-h-64 overflow-y-auto mt-4 pr-2">
          <label v-for="outlet in allBusinessOutlets" :key="outlet.id" class="label cursor-pointer p-2 rounded-lg hover:bg-base-200">
            <span class="label-text">{{ outlet.name }}</span> 
            <input 
              type="checkbox" 
              :value="outlet.id"
              v-model="selectedOutletIds"
              class="checkbox checkbox-primary" 
            />
          </label>
        </div>
        
        <div class="modal-action mt-6">
          <button type="button" class="btn" @click="closeModal">Batal</button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :class="{ 'loading': employeeStore.loading }"
            @click="handleSubmit"
          >
            Simpan Perubahan
          </button>
        </div>
  
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeModal">close</button>
      </form>
    </dialog>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { useEmployeeStore } from '@/stores/employeeStore';
  import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
  
  const props = defineProps({
    isOpen: { type: Boolean, required: true },
    employee: { type: Object, required: true },
  });
  const emit = defineEmits(['close']);
  
  const employeeStore = useEmployeeStore();
  const userStore = useUserStoreRefactored();
  
  const loadingInitialData = ref(false);
  
  // State untuk menampung ID outlet yang dipilih
  const selectedOutletIds = ref([]); 
  
  // Ambil daftar semua outlet yang dimiliki bisnis dari userStore
  const allBusinessOutlets = userStore.accessibleOutlets;
  
  // Watcher untuk mengambil data akses saat modal dibuka
  watch(() => props.isOpen, async (newVal) => {
    if (newVal) {
      loadingInitialData.value = true;
      // Panggil action dari store untuk mendapatkan outlet mana saja yg sudah di-assign
      const assignedIds = await employeeStore.getAssignedOutlets(props.employee.id);
      selectedOutletIds.value = assignedIds;
      loadingInitialData.value = false;
    }
  });
  
  const handleSubmit = async () => {
      await employeeStore.updateOutletAccess(props.employee.id, selectedOutletIds.value);
      closeModal();
  };
  
  const closeModal = () => {
    emit('close');
  };
  
  </script>