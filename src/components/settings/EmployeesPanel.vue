<template>
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Manajemen Pegawai</h2>
          <!-- Teks dinamis yang menampilkan kuota pegawai -->
          <p class="text-sm text-gray-500 mt-1">
            Anda telah menggunakan <span class="font-bold text-teal-600">{{ currentEmployeeCount }}</span> dari <span class="font-bold">{{ userLimit }}</span> slot pegawai yang tersedia.
          </p>
          <!-- Progress bar untuk kuota -->
          <progress 
            class="progress progress-primary w-full mt-2" 
            :class="{'progress-success': !isAddButtonDisabled, 'progress-warning': isAddButtonDisabled}"
            :value="currentEmployeeCount" 
            :max="userLimit"
          ></progress>
        </div>
        <div class="flex md:justify-end">
          <!-- Tooltip dan tombol yang dinonaktifkan berdasarkan limit -->
          <div class="tooltip" :data-tip="addButtonTooltip">
            <button 
              class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" 
              @click="isInviteModalOpen = true"
              :disabled="isAddButtonDisabled"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" />
              </svg>
              Undang Pegawai Baru
            </button>
          </div>
        </div>
      </div>
  
      <!-- Tabel Pegawai (Tidak ada perubahan di sini) -->
      <div class="overflow-x-auto border rounded-lg">
        <table class="table-auto w-full text-sm">
          <thead class="bg-gray-50 text-left text-gray-600">
            <tr>
              <th class="px-6 py-3 font-medium">Nama</th>
              <th class="px-6 py-3 font-medium">Login Terakhir</th>
              <th class="px-6 py-3 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="employeeStore.loading">
              <td colspan="3" class="text-center p-10"><span class="loading loading-spinner text-teal-600"></span></td>
            </tr>
            <tr v-for="employee in employeeStore.employees" :key="employee.id">
              <td class="px-6 py-4">
                <p class="font-semibold text-gray-800">{{ employee.full_name }}</p>
                <p class="text-xs text-gray-500">{{ employee.email }}</p>
              </td>
              <td class="px-6 py-4 text-gray-600">{{ formatLastSignIn(employee.last_sign_in_at) }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center space-x-2">
                    <button class="btn btn-sm btn-outline border-gray-300" @click="openAccessModal(employee)">Kelola Akses</button>
                    <button @click="handleDelete(employee)" class="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600" title="Hapus Pegawai"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </td>
            </tr>
            <tr v-if="!employeeStore.loading && employeeStore.employees.length === 0">
              <td colspan="3" class="text-center py-12 text-gray-500"><p class="font-semibold">Belum Ada Pegawai</p><p>Silakan undang pegawai pertama Anda.</p></td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <InviteEmployeeModal :is-open="isInviteModalOpen" @close="isInviteModalOpen = false" />
      <ManageAccessModal v-if="selectedEmployee" :is-open="isAccessModalOpen" :employee="selectedEmployee" @close="isAccessModalOpen = false" />
    </div>
</template>
  
<script setup>
import { ref, onMounted, computed } from 'vue'; // Impor 'computed'
import { useEmployeeStore } from '@/stores/employeeStore';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored'; // Impor user store
import InviteEmployeeModal from '@/components/modals/InviteEmployeeModal.vue';
import ManageAccessModal from '@/components/modals/ManageAccessModal.vue';
  
const employeeStore = useEmployeeStore();
const userStore = useUserStoreRefactored(); // Inisialisasi user store
  
const isInviteModalOpen = ref(false);
const isAccessModalOpen = ref(false);
const selectedEmployee = ref(null);

// --- LOGIKA BARU UNTUK LIMITASI PENGGUNA ---
const currentEmployeeCount = computed(() => employeeStore.employees?.length || 0);
const userLimit = computed(() => userStore.currentSubscription?.plans?.user_limit || 1);
const isAddButtonDisabled = computed(() => currentEmployeeCount.value >= userLimit.value);

const addButtonTooltip = computed(() => {
    return isAddButtonDisabled.value 
      ? `Anda telah mencapai batas ${userLimit.value} pegawai untuk paket saat ini.`
      : 'Undang pegawai baru';
});
// --- AKHIR DARI LOGIKA BARU ---
  
onMounted(() => {
    employeeStore.fetchEmployees();
});
  
const formatLastSignIn = (dateString) => {
    if (!dateString) return 'Belum pernah login';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};
  
const openAccessModal = (employee) => {
    selectedEmployee.value = employee;
    isAccessModalOpen.value = true;
};
  
const handleDelete = async (employee) => {
    await employeeStore.deleteEmployee(employee.id, employee.full_name);
};
</script>
