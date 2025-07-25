<template>
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Manajemen Outlet</h2>
          <p class="text-sm text-gray-500 mt-1">
            Anda telah menggunakan <span class="font-bold text-teal-600">{{ currentOutletCount }}</span> dari <span class="font-bold">{{ outletLimit }}</span> slot outlet yang tersedia.
          </p>
          <progress 
            class="progress progress-primary w-full mt-2" 
            :class="{'progress-success': !isAddButtonDisabled, 'progress-warning': isAddButtonDisabled}"
            :value="currentOutletCount" 
            :max="outletLimit"
          ></progress>
        </div>
        <div class="flex md:justify-end">
          <div class="tooltip" :data-tip="addButtonTooltip">
            <button 
              class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" 
              @click="openCreateModal"
              :disabled="isAddButtonDisabled"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
              Tambah Outlet
            </button>
          </div>
        </div>
      </div>
      
      <!-- Tabel Outlet dengan Gaya Baru -->
      <div class="overflow-x-auto border rounded-lg">
        <table class="table-auto w-full text-sm">
          <thead class="bg-gray-50 text-left text-gray-600">
            <tr>
              <th class="px-6 py-3 font-medium">#</th>
              <th class="px-6 py-3 font-medium">Nama Outlet</th>
              <th class="px-6 py-3 font-medium">Alamat</th>
              <th class="px-6 py-3 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(outlet, index) in userStore.accessibleOutlets" :key="outlet.id">
              <td class="px-6 py-4 font-medium text-gray-500">{{ index + 1 }}</td>
              <td class="px-6 py-4 font-semibold text-gray-800">{{ outlet.name }}</td>
              <td class="px-6 py-4 text-gray-600">{{ outlet.address || '-' }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center space-x-2">
                  <button @click="openEditModal(outlet)" class="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600" title="Edit Outlet">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button 
                    @click="handleDelete(outlet)"
                    :disabled="isDeleteDisabled"
                    class="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600 disabled:text-gray-300 disabled:hover:bg-transparent" 
                    title="Hapus Outlet"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="userStore.accessibleOutlets.length === 0">
              <td colspan="4" class="text-center py-12 text-gray-500">
                <p class="font-semibold">Belum Ada Outlet</p>
                <p>Silakan tambah outlet pertama Anda.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- LOGIKA PEMANGGILAN MODAL TIDAK DIUBAH -->
      <OutletFormModal
        :is-open="isModalOpen"
        :outlet-to-edit="selectedOutlet"
        @close="closeModal"
      />
    </div>
</template>
  
<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, computed } from 'vue';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import { useOutletStore } from '@/stores/outletStore';
import OutletFormModal from '@/components/OutletFormModal.vue';
  
const userStore = useUserStoreRefactored();
const outletStore = useOutletStore();
  
const isModalOpen = ref(false);
const selectedOutlet = ref(null);
  
const currentOutletCount = computed(() => userStore.accessibleOutlets?.length || 0);
const outletLimit = computed(() => userStore.currentSubscription?.plans?.outlet_limit || 1);
const isAddButtonDisabled = computed(() => currentOutletCount.value >= outletLimit.value);
const isDeleteDisabled = computed(() => currentOutletCount.value <= 1);
  
const addButtonTooltip = computed(() => {
    return isAddButtonDisabled.value 
      ? `Anda telah mencapai batas ${outletLimit.value} outlet untuk paket saat ini.`
      : 'Tambah outlet baru';
});
  
const openCreateModal = () => {
    selectedOutlet.value = null;
    isModalOpen.value = true;
};
  
const openEditModal = (outlet) => {
    selectedOutlet.value = { ...outlet };
    isModalOpen.value = true;
};
  
const closeModal = () => {
    isModalOpen.value = false;
    selectedOutlet.value = null;
};
  
const handleDelete = async (outlet) => {
    if (isDeleteDisabled.value) {
      alert("Anda tidak dapat menghapus outlet terakhir. Bisnis harus memiliki minimal satu outlet.");
      return;
    }
    const isConfirmed = window.confirm(`Yakin ingin menghapus outlet "${outlet.name}"? Semua data terkait akan terhapus permanen.`);
    if (isConfirmed) {
      await outletStore.deleteOutlet(outlet.id);
    }
};
</script>
