import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';

// Logika UI tetap di sini
export const useUIStore = defineStore('ui', () => {
  const isSidebarCollapsed = ref(true);
  const notification = ref({ message: '', type: 'info', key: 0 });
  
  function toggleSidebar() { 
    isSidebarCollapsed.value = !isSidebarCollapsed.value; 
  }
  
  function setSidebarCollapsed(collapsed) {
    isSidebarCollapsed.value = collapsed;
  }
  
  function showNotification(message, type = 'success', duration = 3000) {
    notification.value = { message, type, key: Date.now() };
    const currentKey = notification.value.key;
    setTimeout(() => { 
      if (notification.value.key === currentKey) { 
        notification.value = { message: '', type: 'info', key: 0 }; 
      } 
    }, duration);
  }
  
  return { 
    isSidebarCollapsed, 
    notification, 
    toggleSidebar, 
    setSidebarCollapsed,
    showNotification 
  };
});


export const useUserStoreRefactored = defineStore('userRefactored', () => {
  const router = typeof window !== 'undefined' ? useRouter() : null;
  const uiStore = useUIStore();
  

  // --- STATE (dari kode Anda yang sudah lengkap) ---
  const profile = ref(null);
  const business = ref(null);
  const user = ref(null);
  const isReady = ref(false);
  const activeOutletId = ref(null);
  const accessibleOutlets = ref([]);
  const activeOutlet = computed(() => {
    if (!activeOutletId.value || accessibleOutlets.value.length === 0) return null;
    return accessibleOutlets.value.find(o => o.id === activeOutletId.value);
  });

  // --- GETTERS (dari kode Anda yang sudah lengkap) ---
  const isLoggedIn = computed(() => !!user.value);
  const businessId = computed(() => business.value?.id || null);
  const userId = computed(() => user.value?.id || null);
  const userEmail = computed(() => user.value?.email || '');
  const userFullName = computed(() => profile.value?.full_name || '');
  const activeRole = computed(() => profile.value?.roles?.name || 'public');
  const currentSubscription = computed(() => {
    if (!business.value?.subscriptions) return null;
    return business.value.subscriptions.find(sub => sub.status === 'active') || business.value.subscriptions[0] || null;
  });
  const isOnboardingCompleted = computed(() => business.value?.onboarding_status === 'completed');

  // --- ACTIONS UTAMA (dari kode Anda yang sudah lengkap) ---
  async function fetchUserSession() {
    isReady.value = false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // 1. Ambil data profil & bisnis utama
        // === PERUBAHAN KRUSIAL: Kembalikan query untuk mengambil langganan ===
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select(`*, roles(name), businesses(*, subscriptions(*, plans(*)))`) // Query yang benar!
          .eq('id', session.user.id)
          .single();
        // ====================================================================

        if (profileError) throw profileError;
        
        user.value = session.user;
        profile.value = userProfile;
        business.value = userProfile.businesses;

        // 2. Tentukan daftar outlet yang bisa diakses (logika ini tetap sama)
        if (userProfile.roles.name === 'Owner') {
          const { data: allOutlets, error: outletsError } = await supabase
            .from('outlets')
            .select('*')
            .eq('business_id', business.value.id);
          if (outletsError) throw outletsError;
          accessibleOutlets.value = allOutlets;
        } else {
          const { data: assigned, error: assignedError } = await supabase
            .from('profile_outlets')
            .select('outlets(*)')
            .eq('profile_id', user.value.id);
          if (assignedError) throw assignedError;
          accessibleOutlets.value = assigned.map(a => a.outlets);
        }

        // 3. Set outlet aktif (logika ini tetap sama)
        const savedOutletId = localStorage.getItem('finako-active-outlet');
        if (accessibleOutlets.value.length > 0) {
            const isValidSavedOutlet = accessibleOutlets.value.some(o => o.id === savedOutletId);
            if (isValidSavedOutlet) {
                activeOutletId.value = savedOutletId;
            } else {
                activeOutletId.value = accessibleOutlets.value[0].id;
            }
        }
        
      } else {
        clearUserSession();
      }
    } catch (e) {
      console.error("Error fetching user session:", e.message);
      clearUserSession();
    } finally {
      isReady.value = true;
    }
  }


  function clearUserSession() {
    user.value = null;
    profile.value = null;
    business.value = null;
    isReady.value = true;
  }

  async function loginWithEmailPassword(email, password) {
    // ... (SELURUH ISI FUNGSI INI SAMA PERSIS SEPERTI YANG ANDA KIRIM, TIDAK DIUBAH)
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      uiStore.showNotification(error.message, 'error');
      return { success: false, error: error.message };
    }
    await fetchUserSession();
    let nextStep = 'dashboard';
    if (!currentSubscription.value || currentSubscription.value.status !== 'active') {
      nextStep = 'payment_info';
    } else if (!isOnboardingCompleted.value) {
      nextStep = 'onboarding';
    }
    uiStore.showNotification('Login berhasil!', 'success');
    return { success: true, nextStep };
  }

  async function logout() {
    // ... (SELURUH ISI FUNGSI INI SAMA PERSIS SEPERTI YANG ANDA KIRIM, TIDAK DIUBAH)
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      uiStore.showNotification('Error saat logout', 'error');
      return;
    }
    clearUserSession();
    if (router) {
      router.push('/login');
    }
  }
  
  function handleAuthRedirects() {
    // ... (FUNGSI INI MUNGKIN TIDAK DIPAKAI LAGI KARENA LOGIKA ADA DI ROUTER, TAPI BIARKAN SAJA UNTUK KEAMANAN)
    if (!isReady.value) return;
    if (!isLoggedIn.value) return router?.push('/login');
    if (!currentSubscription.value || currentSubscription.value.status !== 'active') {
      return router?.push('/payment-info');
    }
    if (!isOnboardingCompleted.value) {
      return router?.push('/onboarding');
    }
    return router?.push('/dashboard');
  }
  
  // ===============================================
  // === ACTIONS BARU DARI userStore.js (LAMA) ===
  // ===============================================

  async function register(email, password, fullName, businessName) {
    // Aksi ini sekarang mengirim 'business_name' di dalam metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          business_name: businessName 
        }
      }
    });

    if (error) {
      uiStore.showNotification(error.message, 'error');
      return { success: false };
    }
    
    uiStore.showNotification('Pendaftaran berhasil! Silakan cek email untuk verifikasi.', 'success');
    return { success: true };
}

async function setupBusinessAndFirstOutlet(businessData, outletData) {
  if (!businessId.value) {
    uiStore.showNotification('ID Bisnis tidak ditemukan.', 'error');
    return { success: false };
  }
  
  try {
    // Gunakan RPC untuk menjalankan kedua operasi dalam satu transaksi di database
    // Ini lebih aman dan efisien
    const { error } = await supabase.rpc('complete_onboarding_with_outlet', {
      b_id: businessId.value,
      b_name: businessData.name,
      b_address: businessData.address,
      b_phone: businessData.phone_number,
      o_name: outletData.name,
      o_address: outletData.address
    });
    
    if (error) throw error;
    
    // Jika berhasil, ambil data sesi terbaru untuk update UI
    await fetchUserSession();
    uiStore.showNotification('Setup bisnis berhasil! Selamat datang di Finako.', 'success');
    return { success: true };
    
  } catch (e) {
    uiStore.showNotification(e.message, 'error');
    return { success: false };
  }
}


  async function completeOnboarding(onboardingData) {
    if (!businessId.value) {
      uiStore.showNotification('ID Bisnis tidak ditemukan.', 'error');
      return { success: false };
    }
    const { error } = await supabase.from('businesses').update({ ...onboardingData, onboarding_status: 'completed' }).eq('id', businessId.value);
    if (error) {
      uiStore.showNotification(error.message, 'error');
      return { success: false };
    }
    await fetchUserSession(); 
    uiStore.showNotification('Setup bisnis berhasil!', 'success');
    return { success: true };
  }
  
  async function getPackages() {
    try {
      const { data, error } = await supabase.from('plans').select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Gagal mengambil daftar paket:", error);
      return [];
    }
  }

  async function updateBusinessDetails(newDetails) {
    if (!businessId.value) {
      uiStore.showNotification('ID Bisnis tidak ditemukan. Tidak dapat menyimpan.', 'error');
      return { success: false };
    }
  
    try {
      // Langkah update tidak berubah, tapi kita tidak perlu `select()` lagi
      const { error } = await supabase
        .from('businesses')
        .update(newDetails)
        .eq('id', businessId.value);
      
      if (error) throw error;
  
      // === SOLUSI: Panggil ulang fetchUserSession() ===
      // Ini akan mengambil kembali semua data (termasuk langganan)
      // dan memastikan seluruh state aplikasi kembali sinkron.
      await fetchUserSession(); 
      
      uiStore.showNotification('Pengaturan usaha berhasil disimpan!', 'success');
      return { success: true };
    } catch (e) {
      console.error('Error updating business details:', e);
      uiStore.showNotification(e.message, 'error');
      return { success: false };
    }
  }

  function setActiveOutlet(outletId) {
    if (outletId && accessibleOutlets.value.some(o => o.id === outletId)) {
      activeOutletId.value = outletId;
      // Simpan pilihan user di localStorage agar tidak hilang saat refresh
      localStorage.setItem('finako-active-outlet', outletId);
      uiStore.showNotification(`Bekerja di outlet: ${activeOutlet.value?.name}`, 'info', 2000);
    } else {
      console.error("Attempted to set an invalid or inaccessible outlet.");
    }
  }


  return {
    // State (dari kode Anda)
    profile, business, user, isReady, activeOutletId, accessibleOutlets, activeOutlet,
    // Getters (dari kode Anda)
    isLoggedIn, businessId, userId, userEmail, userFullName, activeRole, currentSubscription, isOnboardingCompleted,
    // Actions (dari kode Anda)
    fetchUserSession, loginWithEmailPassword, logout, handleAuthRedirects,
    // Actions Baru
    register, completeOnboarding, getPackages,setupBusinessAndFirstOutlet,updateBusinessDetails,setActiveOutlet,
  };
});