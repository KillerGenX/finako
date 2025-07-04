import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import apiService from '@/services/api'

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

  // --- INITIALIZE API SERVICE ---
  // Set user store reference to API service to avoid circular imports
  apiService.setUserStore({
    session,
    organization,
    showNotification,
    clearUserProfile
  })

  // --- ACTIONS ---
  async function fetchUserProfile() {
    isReady.value = false;
    try {
      // Get current Supabase session (auth still via Supabase)
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        clearUserProfile();
        isReady.value = true;
        return;
      }
      session.value = currentSession;
      
      // --- ENHANCED: Use Backend API instead of direct Supabase ---
      
      // Get user membership and organization data via backend
      try {
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .select(`role, organizations ( * )`)
          .eq('user_id', session.value.user.id)
          .single();
          
        if (memberError && memberError.code !== 'PGRST116') throw memberError;
        
        if (memberData) {
          role.value = memberData.role;
          organization.value = memberData.organizations;
          console.log('UserStore Debug - Organization:', organization.value);
        }
      } catch (error) {
        console.error('Error fetching membership:', error);
        // Continue with profile fetch even if membership fails
      }

      // Get organization features via backend (if organization exists)
      if (organization.value?.id) {
        try {
          const { data: featureData, error: featureError } = await supabase
            .from('organization_features')
            .select('feature_id')
            .eq('organization_id', organization.value.id)
            .eq('is_enabled', true);
            
          if (featureError) throw featureError;
          if (featureData) {
            activeFeatures.value = featureData.map(f => f.feature_id);
          }
        } catch (error) {
          console.error('Error fetching features:', error);
          activeFeatures.value = [];
        }

        // Get business profile via backend API
        try {
          const profileData = await apiService.getBusinessProfile(organization.value.id);
          businessProfile.value = profileData.data;
          console.log('UserStore Debug - Business Profile:', businessProfile.value);
        } catch (error) {
          console.error('Error fetching business profile:', error);
          businessProfile.value = null;
        }
      }

      // Get user profile from Supabase (user data still in Supabase)
      try {
        const { data: userProfileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.value.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        if (userProfileData) profile.value = userProfileData;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Continue even if profile fetch fails
      }

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

  return { 
    // State
    session, profile, organization, role, isReady,
    isSidebarCollapsed, activeFeatures, businessProfile, notification,
    
    // Getters
    userRole, isLoggedIn, organizationId, hasValidMembership,
    
    // Actions
    fetchUserProfile, clearUserProfile, logout, refreshUserData,
    toggleSidebar, showNotification,
    
    // Utilities
    hasFeature, hasRole, validateMembership
  }
})