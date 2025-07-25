<template>
    <dialog :open="isOpen" class="modal">
      <div class="modal-box">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
        <h3 class="font-bold text-xl text-gray-800">Kelola Akses Outlet</h3>
        <p class="py-2 text-sm text-gray-500">
          Atur outlet mana saja yang bisa diakses oleh <strong class="text-teal-600">{{ employee.full_name }}</strong>.
        </p>
  
        <!-- Tampilan Loading -->
        <div v-if="loadingInitialData" class="text-center py-10">
          <span class="loading loading-spinner text-teal-600"></span>
        </div>
  
        <!-- Daftar Outlet -->
        <div v-else class="form-control space-y-2 max-h-64 overflow-y-auto mt-4 pr-2 border rounded-lg p-2">
          <label v-for="outlet in allBusinessOutlets" :key="outlet.id" class="label cursor-pointer p-2 rounded-lg hover:bg-gray-50">
            <span class="label-text font-medium">{{ outlet.name }}</span> 
            <!-- LOGIKA v-model TIDAK DIUBAH -->
            <input 
              type="checkbox" 
              :value="outlet.id"
              v-model="selectedOutletIds"
              class="checkbox checkbox-primary" 
            />
          </label>
        </div>
        
        <div class="modal-action mt-6 pt-4 border-t">
          <!-- LOGIKA @click TIDAK DIUBAH -->
          <button type="button" class="btn btn-ghost" @click="closeModal">Batal</button>
          <button 
            type="submit" 
            class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" 
            :disabled="employeeStore.loading"
            @click="handleSubmit"
          >
            <span v-if="employeeStore.loading" class="loading loading-spinner"></span>
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
// SCRIPT TIDAK DIUBAH SAMA SEKALI
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
const selectedOutletIds = ref([]); 
  
const allBusinessOutlets = userStore.accessibleOutlets;
  
watch(() => props.isOpen, async (newVal) => {
    if (newVal) {
      loadingInitialData.value = true;
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
