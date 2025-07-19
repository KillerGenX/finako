import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/supabase';
import { useUserStoreRefactored, useUIStore } from './userStoreRefactored';

export const useEmployeeStore = defineStore('employee', () => {
  // Akses ke store lain untuk mendapatkan konteks
  const userStore = useUserStoreRefactored();
  const uiStore = useUIStore();

  // --- STATE ---
  const employees = ref([]); // Untuk menyimpan daftar pegawai
  const loading = ref(false);

  // --- GETTERS ---
  // Getter untuk mengambil peran 'Kasir' secara dinamis, agar tidak hardcode ID
  const cashierRoleId = ref(null); 
  async function fetchCashierRoleId() {
      if (cashierRoleId.value) return; // Jangan fetch ulang jika sudah ada
      try {
          const { data, error } = await supabase
              .from('roles')
              .select('id')
              .eq('name', 'Kasir')
              .single();
          if (error) throw new Error('Peran "Kasir" tidak ditemukan di database.');
          cashierRoleId.value = data.id;
      } catch (e) {
          console.error(e);
          uiStore.showNotification(e.message, 'error');
      }
  }

  // --- ACTIONS ---

  // 1. Mengambil daftar semua pegawai di bisnis ini
  async function fetchEmployees() {
    if (!userStore.businessId) return;
    loading.value = true;
    try {
      // Panggil fungsi RPC yang sudah kita buat di database
      const { data, error } = await supabase.rpc('get_employees_by_business', {
        p_business_id: userStore.businessId,
        p_owner_id: userStore.userId
      });

      if (error) throw error;

      employees.value = data || [];

    } catch (e) {
      uiStore.showNotification(`Gagal mengambil data pegawai: ${e.message}`, 'error');
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  // 2. Mengundang pegawai baru
  async function inviteEmployee(email) {
    loading.value = true;
    await fetchCashierRoleId(); 
    if (!cashierRoleId.value) {
        loading.value = false;
        return; 
    }

    try {
      // Panggil Edge Function kita, bukan supabase.auth.admin
      const { data, error } = await supabase.functions.invoke('invite-employee', {
        body: {
          email: email,
          role_id: cashierRoleId.value,
          business_id: userStore.businessId
        },
      });

      if (error) throw error;
      
      uiStore.showNotification(`Undangan berhasil dikirim ke ${email}`, 'success');
      await fetchEmployees();
    } catch (e) {
      // Menangkap error dari Edge Function
      const errorMessage = e.context?.data?.error || e.message;
      uiStore.showNotification(errorMessage, 'error');
      console.error("Error invoking invite-employee function:", e);
    } finally {
      loading.value = false;
    }
  }

  // 3. Mengambil daftar outlet yang sudah di-assign ke seorang pegawai
  async function getAssignedOutlets(profileId) {
    loading.value = true;
    try {
        const { data, error } = await supabase
            .from('profile_outlets')
            .select('outlet_id')
            .eq('profile_id', profileId);
        if (error) throw error;
        // Kembalikan array berisi ID outlet, contoh: ['id-outlet-1', 'id-outlet-2']
        return data.map(item => item.outlet_id);
    } catch (e) {
        uiStore.showNotification(`Gagal mengambil data akses: ${e.message}`, 'error');
        return [];
    } finally {
        loading.value = false;
    }
  }

  // 4. Mengupdate (sinkronisasi) akses outlet untuk seorang pegawai
  async function updateOutletAccess(profileId, selectedOutletIds = []) {
    loading.value = true;
    try {
        // Hapus semua akses yang ada untuk pegawai ini terlebih dahulu
        const { error: deleteError } = await supabase
            .from('profile_outlets')
            .delete()
            .eq('profile_id', profileId);
        if (deleteError) throw deleteError;

        // Jika ada outlet yang dipilih, tambahkan entri baru
        if (selectedOutletIds.length > 0) {
            const newAccesses = selectedOutletIds.map(outletId => ({
                profile_id: profileId,
                outlet_id: outletId
            }));

            const { error: insertError } = await supabase
                .from('profile_outlets')
                .insert(newAccesses);
            if (insertError) throw insertError;
        }

        uiStore.showNotification('Akses outlet berhasil diperbarui!', 'success');
    } catch (e) {
        uiStore.showNotification(`Gagal memperbarui akses: ${e.message}`, 'error');
    } finally {
        loading.value = false;
    }
  }

   // 5. Menghapus pegawai
   async function deleteEmployee(employeeId, employeeName) {
    // Tampilkan konfirmasi yang jelas karena ini aksi destruktif
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus pegawai "${employeeName}" secara permanen? Aksi ini tidak dapat dibatalkan.`);
    if (!isConfirmed) return;

    loading.value = true;
    try {
      // Panggil Edge Function delete-employee
      const { error } = await supabase.functions.invoke('delete-employee', {
        body: { employee_id: employeeId },
      });

      if (error) throw error;
      
      uiStore.showNotification(`Pegawai "${employeeName}" berhasil dihapus.`, 'success');
      
      // Refresh daftar pegawai di state setelah berhasil dihapus
      await fetchEmployees();

    } catch (e) {
      const errorMessage = e.context?.data?.error || e.message;
      uiStore.showNotification(errorMessage, 'error');
      console.error("Error invoking delete-employee function:", e);
    } finally {
      loading.value = false;
    }
  }

  return {
    employees,
    loading,
    fetchEmployees,
    inviteEmployee,
    getAssignedOutlets,
    updateOutletAccess,
    deleteEmployee,
  };
});