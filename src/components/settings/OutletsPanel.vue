<template>
    <div>
      <div class="flex justify-between items-center mb-1">
        <div>
          <h2 class="text-xl font-bold">Manajemen Outlet</h2>
          <p class="text-sm text-base-content/70">
            Total Outlet: {{ currentOutletCount }} / {{ outletLimit }}
          </p>
        </div>
        <div class="tooltip" :data-tip="addButtonTooltip">
          <button 
            class="btn btn-primary" 
            @click="openCreateModal"
            :disabled="isAddButtonDisabled"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
            Tambah Outlet
          </button>
        </div>
      </div>
      
      <progress 
        class="progress progress-primary w-full" 
        :value="currentOutletCount" 
        :max="outletLimit"
      ></progress>
  
      <!-- Daftar Outlet -->
      <div class="overflow-x-auto mt-4">
        <table class="table w-full">
          <thead>
            <tr>
              <th></th>
              <th>Nama Outlet</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(outlet, index) in userStore.accessibleOutlets" :key="outlet.id" class="hover">
              <th>{{ index + 1 }}</th>
              <td>{{ outlet.name }}</td>
              <td>{{ outlet.address || '-' }}</td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-sm btn-ghost" @click="openEditModal(outlet)">Edit</button>
                  <button 
                    class="btn btn-sm btn-ghost text-error" 
                    @click="handleDelete(outlet)"
                    :disabled="isDeleteDisabled"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="userStore.accessibleOutlets.length === 0">
              <td colspan="4" class="text-center py-4">Belum ada outlet. Silakan tambah outlet pertama Anda.</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal untuk Create/Update (akan kita buat di langkah berikutnya) -->
      <OutletFormModal
        :is-open="isModalOpen"
        :outlet-to-edit="selectedOutlet"
        @close="closeModal"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
  import { useOutletStore } from '@/stores/outletStore';
  import OutletFormModal from '@/components/OutletFormModal.vue'; // Akan kita buat
  
  const userStore = useUserStoreRefactored();
  const outletStore = useOutletStore();
  
  // State untuk modal
  const isModalOpen = ref(false);
  const selectedOutlet = ref(null);
  
  // --- LOGIKA BISNIS: Validasi Limit ---
  const currentOutletCount = computed(() => userStore.accessibleOutlets?.length || 0);
  const outletLimit = computed(() => userStore.currentSubscription?.plans?.outlet_limit || 1);
  const isAddButtonDisabled = computed(() => currentOutletCount.value >= outletLimit.value);
  const isDeleteDisabled = computed(() => currentOutletCount.value <= 1);
  
  const addButtonTooltip = computed(() => {
    return isAddButtonDisabled.value 
      ? `Anda telah mencapai batas ${outletLimit.value} outlet untuk paket saat ini.`
      : 'Tambah outlet baru';
  });
  
  // Fungsi-fungsi untuk Modal
  const openCreateModal = () => {
    selectedOutlet.value = null;
    isModalOpen.value = true;
  };
  
  const openEditModal = (outlet) => {
    selectedOutlet.value = { ...outlet }; // Kirim copy, bukan referensi langsung
    isModalOpen.value = true;
  };
  
  const closeModal = () => {
    isModalOpen.value = false;
    selectedOutlet.value = null;
  };
  
  // Aksi Hapus
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