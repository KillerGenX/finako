// File: src/stores/userStore.js (VERSI FINAL FINAKO 4.0)

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export const useUserStore = defineStore('user', () => {
  // --- STATE ---
  const session = ref(null)
  const profile = ref(null)
  const organization = ref(null)
  const role = ref(null)
  const isReady = ref(false)
  const isSidebarCollapsed = ref(true) // Default sidebar sudah mengecil

  // --- STATE BARU: Untuk menyimpan fitur aktif pengguna ---
  // Diinisialisasi sebagai array kosong [] untuk mencegah error. Ini perbaikan penting.
  const activeFeatures = ref([])

  // --- GETTERS ---
  const userRole = computed(() => role.value || 'public')
  const isLoggedIn = computed(() => !!session.value)

  const notification = ref({ message: '', type: 'success', key: 0 });
  

  // --- ACTIONS ---
  async function fetchUserProfile() {
    isReady.value = false;
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      session.value = currentSession;

      if (!session.value) {
        isReady.value = true;
        clearUserProfile();
        return;
      }

      // Ambil data keanggotaan. Diganti ke .single() untuk efisiensi.
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select(`role, organizations ( id, name )`)
        .eq('user_id', session.value.user.id)
        .single();
        
      if (memberError && memberError.code !== 'PGRST116') throw memberError;
      
      if (memberData) {
        role.value = memberData.role;
        organization.value = memberData.organizations;
      }

      // --- BAGIAN BARU: Ambil Fitur Aktif ---
      // Jika data organisasi ditemukan, ambil fitur-fitur yang aktif untuk organisasi tersebut.
      if (organization.value?.id) {
        const { data: featureData, error: featureError } = await supabase
          .from('organization_features')
          .select('feature_id') // Kita hanya butuh ID fiturnya
          .eq('organization_id', organization.value.id)
          .eq('is_enabled', true); // Hanya ambil fitur yang statusnya ON
        
        if (featureError) throw featureError;

        if (featureData) {
          // featureData akan berbentuk [{ feature_id: 'pos' }, { feature_id: 'expenses' }]
          // Kita ubah menjadi array string sederhana: ['pos', 'expenses']
          activeFeatures.value = featureData.map(f => f.feature_id);
        }
      }
      // --- AKHIR BAGIAN BARU ---

      // Ambil data profil. Diganti ke .single()
      const { data: userProfileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.value.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (userProfileData) {
        // Cukup userProfileData karena .single() mengembalikan objek, bukan array
        profile.value = userProfileData;
      }

    } catch (e) {
      console.error("Error di dalam fetchUserProfile:", e.message);
      clearUserProfile(); // Bersihkan state jika ada error
    } finally {
      isReady.value = true;
    }
  }

  // Fungsi clear sekarang juga mereset activeFeatures
  function clearUserProfile() {
    session.value = null;
    profile.value = null;
    organization.value = null;
    role.value = null;
    activeFeatures.value = [];
    notification.value = { message: '', type: 'info', key: 0 }; // Reset notifikasi
  }

  // Fungsi toggle sidebar tidak berubah
  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  function showNotification(message, type = 'success', duration = 3000) {
    // Set pesan dan tipe notifikasi
    notification.value = { message, type, key: Date.now() };
  
    // Set timeout untuk otomatis menghilangkan pesan setelah durasi tertentu
    setTimeout(() => {
      // Hanya hapus jika pesannya masih sama (mencegah menghapus notif baru)
      if (notification.value.key === notification.value.key) {
        notification.value = { message: '', type, key: 0 };
      }
    }, duration);
  }

  // --- Return semua state dan action ---
  return { 
    session, profile, organization, role, userRole, isLoggedIn, isReady,
    isSidebarCollapsed, 
    activeFeatures, // <-- Kirim state baru ini agar bisa diakses komponen lain
    fetchUserProfile, 
    clearUserProfile,
    toggleSidebar,
    notification,
    showNotification
  }
})