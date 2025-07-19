<template>
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Manajemen Pegawai</h2>
        <button class="btn btn-primary" @click="isInviteModalOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" />
          </svg>
          Undang Pegawai
        </button>
      </div>
  
      <!-- Tabel Daftar Pegawai -->
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Login Terakhir</th>
              <th>Akses Outlet</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="employeeStore.loading">
              <td colspan="5" class="text-center">
                <span class="loading loading-spinner"></span>
              </td>
            </tr>
            <tr v-for="employee in employeeStore.employees" :key="employee.id" class="hover">
              <td>{{ employee.full_name }}</td>
              <td>{{ employee.email }}</td>
              <td>{{ formatLastSignIn(employee.last_sign_in_at) }}</td>
              <td>
                <button class="btn btn-xs btn-ghost" @click="openAccessModal(employee)">
                  Kelola Akses
                </button>
              </td>
              <td>
                <button class="btn btn-xs btn-ghost text-error" @click="handleDelete(employee)">
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="!employeeStore.loading && employeeStore.employees.length === 0">
              <td colspan="5" class="text-center py-4">Belum ada pegawai. Silakan undang pegawai pertama Anda.</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modals (akan kita buat selanjutnya) -->
      <InviteEmployeeModal
        :is-open="isInviteModalOpen"
        @close="isInviteModalOpen = false"
      />
      <ManageAccessModal
        v-if="selectedEmployee"
        :is-open="isAccessModalOpen"
        :employee="selectedEmployee"
        @close="isAccessModalOpen = false"
      />
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useEmployeeStore } from '@/stores/employeeStore';
  import InviteEmployeeModal from '@/components/modals/InviteEmployeeModal.vue'; // akan dibuat
  import ManageAccessModal from '@/components/modals/ManageAccessModal.vue'; // akan dibuat
  
  const employeeStore = useEmployeeStore();
  
  // State untuk mengontrol modal
  const isInviteModalOpen = ref(false);
  const isAccessModalOpen = ref(false);
  const selectedEmployee = ref(null);
  
  // Ambil data pegawai saat komponen dimuat
  onMounted(() => {
    employeeStore.fetchEmployees();
  });
  
  // Fungsi untuk memformat tanggal
  const formatLastSignIn = (dateString) => {
    if (!dateString) return 'Belum pernah login';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  // Fungsi membuka modal kelola akses
  const openAccessModal = (employee) => {
    selectedEmployee.value = employee;
    isAccessModalOpen.value = true;
  };
  
  // Fungsi untuk menghapus pegawai (Placeholder, perlu konfirmasi)
  const handleDelete = async (employee) => {
  // Panggil action dari store yang baru kita buat
  await employeeStore.deleteEmployee(employee.id, employee.full_name);
};
  </script>