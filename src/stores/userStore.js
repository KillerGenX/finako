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

  // --- SaaS FLOW ACTIONS ---
  async function checkSessionAndRedirect() {
    try {
      if (!session.value?.user?.id) {
        return { next_step: 'login' };
      }

      console.log('Checking session for user ID:', session.value.user.id);
      
      // Use direct API call without withErrorHandling wrapper to get raw response
      const response = await apiService.getSessionInfo(session.value.user.id);
      
      console.log('Session API response:', response);

      // Extract data from the response structure {success: true, data: {...}}
      const data = response.data || response;
      
      console.log('Extracted data:', data);

      // Update store with fresh data
      if (data.organization) {
        organization.value = data.organization;
        role.value = data.role;
        console.log('Updated organization:', data.organization);
      }
      
      if (data.business_profile) {
        businessProfile.value = data.business_profile;
        console.log('Updated business profile:', data.business_profile);
      }

      if (data.active_features) {
        activeFeatures.value = data.active_features;
        console.log('Updated active features:', data.active_features);
      }

      const nextStep = data.next_step || 'dashboard';
      console.log('Determined next step:', nextStep);
      
      return { next_step: nextStep };
    } catch (error) {
      console.error('Session check failed:', error);
      return { next_step: 'login' };
    }
  }

  async function registerTenant(registrationData) {
    try {
      console.log('Registering tenant with data:', registrationData);
      
      // Use API service method directly
      const data = await apiService.registerTenant(registrationData);
      
      console.log('Registration API response:', data);

      // Update store with new organization data
      if (data.organization) {
        organization.value = data.organization;
        role.value = 'owner';
      }

      showNotification('Registrasi berhasil!', 'success');
      return { success: true, next_step: data.next_step || 'login' };
    } catch (error) {
      console.error('Registration error:', error);
      showNotification(error.message, 'error');
      return { success: false, error: error.message };
    }
  }

  async function completeOnboarding(onboardingData) {
    try {
      if (!session.value?.user?.id || !organization.value?.id) {
        throw new Error('User session or organization not found');
      }

      console.log('Completing onboarding with data:', onboardingData);
      
      // Use API service method directly (no destructuring needed)
      const data = await apiService.completeOnboarding(
        session.value.user.id,
        organization.value.id,
        onboardingData
      );

      console.log('Onboarding API response:', data);

      // Refresh user profile to get updated business profile
      await fetchUserProfile();
      
      showNotification('Setup bisnis berhasil!', 'success');
      return { success: true, next_step: data.next_step || 'dashboard' };
    } catch (error) {
      console.error('Onboarding error:', error);
      showNotification(error.message, 'error');
      return { success: false, error: error.message };
    }
  }

  async function getPackages() {
    try {
      console.log('UserStore: Calling API getPackages...')
      const data = await apiService.getPackages(); // Langsung terima data, bukan {data, error}
      console.log('UserStore: API response:', data)
      return data;
    } catch (error) {
      console.error('Failed to fetch packages:', error);
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
    const hasActiveStatus = organization.value?.status === 'active';
    const hasBusinessProfile = !!businessProfile.value;
    
    console.log('Checking onboarding completion:');
    console.log('- Organization status:', organization.value?.status);
    console.log('- Has business profile:', hasBusinessProfile);
    console.log('- Is completed:', hasActiveStatus && hasBusinessProfile);
    
    return hasActiveStatus && hasBusinessProfile;
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