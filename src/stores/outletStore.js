import { defineStore } from 'pinia';
import { supabase } from '@/supabase';
import { ref } from 'vue';
import { useUserStoreRefactored } from './userStoreRefactored'; // Import userStore
import { useUIStore } from './userStoreRefactored'; // Asumsi uiStore diekspor dari file yang sama

export const useOutletStore = defineStore('outlet', () => {
  // Store ini fokus pada actions, state loading/error lokal jika perlu
  const loading = ref(false);
  const error = ref(null);

  // Akses ke store lain
  const userStore = useUserStoreRefactored();
  const uiStore = useUIStore();

  async function createOutlet(outletData) {
    loading.value = true;
    error.value = null;

    // Ambil konteks dari userStore sebagai sumber kebenaran
    const businessId = userStore.businessId;
    const profileId = userStore.userId;

    if (!businessId || !profileId) {
      const errorMessage = 'Konteks pengguna atau bisnis tidak ditemukan. Gagal membuat outlet.';
      uiStore.showNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    }

    try {
      // 1. Insert data outlet baru ke tabel 'outlets'
      const { data: newOutlet, error: outletError } = await supabase
        .from('outlets')
        .insert({
          name: outletData.name,
          address: outletData.address,
          business_id: businessId,
        })
        .select('id') // Hanya butuh ID untuk langkah selanjutnya
        .single();
      if (outletError) throw outletError;

      // 2. Berikan akses ke Owner di tabel 'profile_outlets'
      const { error: profileOutletError } = await supabase
        .from('profile_outlets')
        .insert({
          profile_id: profileId,
          outlet_id: newOutlet.id,
        });
      if (profileOutletError) throw profileOutletError;

      // 3. PENTING: Panggil action di userStore untuk refresh data
      // Ini memastikan seluruh aplikasi (termasuk accessibleOutlets) terupdate
      await userStore.fetchUserSession();

      uiStore.showNotification('Outlet berhasil dibuat!', 'success');
      return { success: true };

    } catch (e) {
      error.value = e.message;
      console.error('Error creating outlet:', e);
      uiStore.showNotification(e.message, 'error');
      return { success: false, error: e };
    } finally {
      loading.value = false;
    }
  }

  async function updateOutlet(outletId, outletData) {
    loading.value = true;
    error.value = null;
    try {
      const { error: updateError } = await supabase
        .from('outlets')
        .update({
          name: outletData.name,
          address: outletData.address,
        })
        .eq('id', outletId);
      if (updateError) throw updateError;
      
      await userStore.fetchUserSession(); // Refresh data global
      uiStore.showNotification('Outlet berhasil diperbarui!', 'success');
      return { success: true };

    } catch (e) {
      error.value = e.message;
      console.error('Error updating outlet:', e);
      uiStore.showNotification(e.message, 'error');
      return { success: false, error: e };
    } finally {
      loading.value = false;
    }
  }

  async function deleteOutlet(outletId) {
    loading.value = true;
    error.value = null;
    try {
      const { error: deleteError } = await supabase
        .from('outlets')
        .delete()
        .eq('id', outletId);
      if (deleteError) throw deleteError;

      // Cek apakah outlet yang dihapus adalah outlet aktif
      if (userStore.activeOutletId === outletId) {
        // Cari outlet pengganti. Ambil yang pertama dari daftar SEBELUM di-refresh.
        const remainingOutlets = userStore.accessibleOutlets.filter(o => o.id !== outletId);
        const newActiveId = remainingOutlets.length > 0 ? remainingOutlets[0].id : null;
        userStore.setActiveOutlet(newActiveId); // Set outlet aktif baru
      }

      await userStore.fetchUserSession(); // Refresh data global
      uiStore.showNotification('Outlet berhasil dihapus!', 'success');
      return { success: true };

    } catch (e) {
      error.value = e.message;
      console.error('Error deleting outlet:', e);
      uiStore.showNotification(e.message, 'error');
      return { success: false, error: e };
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, createOutlet, updateOutlet, deleteOutlet };
});
