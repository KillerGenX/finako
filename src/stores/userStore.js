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
  const isSidebarCollapsed = ref(true)
  const activeFeatures = ref([])
  const businessProfile = ref(null)
  const notification = ref({ message: '', type: 'info', key: 0 })

  // --- GETTERS ---
  const userRole = computed(() => role.value || 'public')
  const isLoggedIn = computed(() => !!session.value)
  const organizationId = computed(() => organization.value?.id || null)
  const hasValidMembership = computed(() => !!session.value && !!organization.value && !!role.value)



  // --- ACTIONS ---
  async function fetchUserProfile() {
    // Hanya set isReady ke false jika belum pernah ready (startup pertama)
    if (!isReady.value) {
      isReady.value = false;
    }
    try {
      // Ambil session Supabase
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        clearUserProfile();
        isReady.value = true;
        return;
      }
      session.value = currentSession;

      // Ambil profile user dari tabel profiles
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.value.user.id)
        .single();
      if (profileError) throw profileError;
      // Gabungkan email dari session Supabase ke profile agar selalu tersedia
      profile.value = { ...userProfile, email: session.value.user.email };

      // Ambil business dari tabel businesses
      let business = null;
      if (userProfile?.business_id) {
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', userProfile.business_id)
          .single();
        if (businessError) throw businessError;
        business = businessData;
      }

      // Ambil status langganan dari tabel subscriptions
      let latestSubscription = null;
      let planName = null;
      if (userProfile?.business_id) {
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('business_id', userProfile.business_id)
          .order('created_at', { ascending: false });
        if (subError && subError.code !== 'PGRST116') throw subError;
        if (subscriptions && subscriptions.length > 0) {
          latestSubscription = subscriptions[0];
          // Ambil nama plan dari tabel plans
          if (latestSubscription.plan_id) {
            const { data: planData, error: planError } = await supabase
              .from('plans')
              .select('name')
              .eq('id', latestSubscription.plan_id)
              .single();
            if (planError) throw planError;
            planName = planData?.name || null;
          }
        }
      }

      // Assign organization dan subscription hanya jika berubah (shallow compare)
      const shallowEqual = (a, b) => {
        if (a === b) return true;
        if (!a || !b) return false;
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;
        for (const key of aKeys) {
          if (a[key] !== b[key]) return false;
        }
        return true;
      };

      if (business) {
        if (!shallowEqual(organization.value, business)) {
          organization.value = { ...business };
        }
        // Assign subscription ke organization
        if (!organization.value.subscription || !shallowEqual(organization.value.subscription, latestSubscription)) {
          organization.value.subscription = latestSubscription ? { ...latestSubscription, plan_name: planName } : null;
        }
        businessProfile.value = organization.value; // alias
      } else {
        organization.value = null;
        businessProfile.value = null;
      }

      // Ambil role dari tabel roles
      if (userProfile?.role_id) {
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('name')
          .eq('id', userProfile.role_id)
          .single();
        if (roleError) throw roleError;
        role.value = roleData?.name || null;
      } else {
        role.value = null;
      }

      // Tidak ada lagi organization_features, fitur aktif bisa diatur via role/plan jika perlu
      activeFeatures.value = [];

    } catch (e) {
      console.error("Error di dalam fetchUserProfile:", e.message);
      clearUserProfile();
    } finally {
      isReady.value = true;
    }
  }

  function clearUserProfile() {
    session.value = null;
    profile.value = null;
    organization.value = null;
    role.value = null;
    activeFeatures.value = [];
    businessProfile.value = null;
    notification.value = { message: '', type: 'info', key: 0 };
  }

  // Enhanced logout function
  async function logout() {
    try {
      await supabase.auth.signOut();
      clearUserProfile();
      showNotification('Berhasil logout', 'success');
      
      // Redirect to login page if in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Error saat logout', 'error');
    }
  }

  // Refresh user data
  async function refreshUserData() {
    if (!session.value) return;
    await fetchUserProfile();
  }

  // Check if user has specific feature access
  function hasFeature(featureId) {
    return activeFeatures.value.includes(featureId);
  }

  // Check if user has specific role
  function hasRole(requiredRole) {
    if (!role.value) return false;
    
    const roleHierarchy = {
      'super_admin': 4,
      'admin': 3,
      'manager': 2,
      'staff': 1,
      'viewer': 0
    };
    
    return roleHierarchy[role.value] >= roleHierarchy[requiredRole];
  }

  // Validate organization membership
  function validateMembership() {
    if (!isLoggedIn.value) {
      throw new Error('User tidak terautentikasi');
    }
    
    if (!organization.value) {
      throw new Error('User tidak memiliki organisasi');
    }
    
    if (!role.value) {
      throw new Error('User tidak memiliki role dalam organisasi');
    }
    
    return true;
  }

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  function showNotification(message, type = 'success', duration = 3000) {
    notification.value = { message, type, key: Date.now() };
    setTimeout(() => {
      if (notification.value.key === notification.value.key) {
        notification.value = { message: '', type: 'info', key: 0 };
      }
    }, duration);
  }


  // --- SaaS FLOW ACTIONS ---
  // Cek session dan tentukan langkah berikutnya sesuai alur dokumentasi
  async function checkSessionAndRedirect() {
    try {
      if (!session.value?.user?.id) {
        return { next_step: 'login' };
      }

      // Ambil ulang data profile dan bisnis
      await fetchUserProfile();

      // Cek status onboarding dan langganan
      if (!profile.value) return { next_step: 'login' };

      // 1. Jika belum ada subscription, ke Payment Info
      if (!organization.value?.subscription || organization.value.subscription.status !== 'active') {
        return { next_step: 'payment_info' };
      }

      // 2. Jika onboarding_status masih 'pending', ke Onboarding
      if (organization.value?.onboarding_status !== 'completed') {
        return { next_step: 'onboarding' };
      }

      // 3. Jika semua sudah lengkap, ke Dashboard
      return { next_step: 'dashboard' };
    } catch (error) {
      console.error('Session check failed:', error);
      return { next_step: 'login' };
    }
  }

  // Registrasi user baru (register Supabase Auth sudah otomatis trigger bisnis & profile)
  async function registerTenant({ email, password, full_name }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name } }
      });
      if (error) throw error;
      showNotification('Registrasi berhasil! Silakan cek email untuk verifikasi.', 'success');
      return { success: true, next_step: 'register_success' };
    } catch (error) {
      showNotification(error.message, 'error');
      return { success: false, error: error.message };
    }
  }

  // Selesaikan onboarding (update data bisnis)
  async function completeOnboarding(onboardingData) {
    try {
      if (!organization.value?.id) throw new Error('Bisnis tidak ditemukan');
      const { error } = await supabase
        .from('businesses')
        .update(onboardingData)
        .eq('id', organization.value.id);
      if (error) throw error;
      await fetchUserProfile();
      showNotification('Setup bisnis berhasil!', 'success');
      return { success: true, next_step: 'dashboard' };
    } catch (error) {
      showNotification(error.message, 'error');
      return { success: false, error: error.message };
    }
  }

  // Ambil daftar paket/plan dari tabel plans
  async function getPackages() {
    try {
      const { data, error } = await supabase.from('plans').select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      return [];
    }
  }

  // --- ENHANCED LOGIN/LOGOUT ---
  async function loginWithEmailPassword(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile after successful login
      await fetchUserProfile();
      
      showNotification('Login berhasil!', 'success');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      showNotification(error.message, 'error');
      return { success: false, error: error.message };
    }
  }

  async function logout() {
    try {
      await supabase.auth.signOut();
      clearUserProfile();
      showNotification('Logout berhasil', 'info');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      clearUserProfile(); // Force clear even if logout fails
      return { success: false, error: error.message };
    }
  }

  // --- UTILITY METHODS ---
  function hasRole(requiredRole) {
    return role.value === requiredRole;
  }

  function hasFeature(requiredFeature) {
    return activeFeatures.value.includes(requiredFeature);
  }

  function getOrganizationStatus() {
    return organization.value?.status || 'unknown';
  }

  function isOnboardingCompleted() {
    // Onboarding dianggap selesai jika onboarding_status === 'completed'
    return organization.value?.onboarding_status === 'completed';
  }

  return { 
    // State
    session, profile, organization, role, isReady,
    isSidebarCollapsed, activeFeatures, businessProfile, notification,
    
    // Getters
    userRole, isLoggedIn, organizationId, hasValidMembership, isOnboardingCompleted,
    
    // Actions
    fetchUserProfile, clearUserProfile, logout, refreshUserData,
    toggleSidebar, showNotification,
    
    // Utilities
    hasFeature, hasRole, validateMembership,

    // SaaS Actions
    checkSessionAndRedirect, registerTenant, completeOnboarding, getPackages,

    // Enhanced Login/Logout
    loginWithEmailPassword
  }
})