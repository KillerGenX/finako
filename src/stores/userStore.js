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

  // --- ACTIONS ---
  async function fetchUserProfile() {
    isReady.value = false;
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        clearUserProfile();
        isReady.value = true;
        return;
      }
      session.value = currentSession;
      
      // --- PERBAIKAN DI SINI ---
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select(`role, organizations ( * )`) // Mengambil SEMUA kolom dari tabel organizations
        .eq('user_id', session.value.user.id)
        .single();
      if (memberError && memberError.code !== 'PGRST116') throw memberError;
      
      if (memberData) {
        role.value = memberData.role;
        organization.value = memberData.organizations;
        console.log('UserStore Debug - Organization:', organization.value);
      }

      if (organization.value?.id) {
        // Debug: Check current auth session
        const { data: { session: currentAuthSession } } = await supabase.auth.getSession();
        console.log('Auth Debug - Session:', currentAuthSession?.user?.id);
        console.log('Auth Debug - Organization ID:', organization.value.id);
        
        const [featureRes, profileRes] = await Promise.all([
          supabase.from('organization_features').select('feature_id').eq('organization_id', organization.value.id).eq('is_enabled', true),
          // Use backend endpoint instead of direct Supabase call
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/business-profile/${organization.value.id}`)
            .then(res => res.json())
            .then(result => ({ data: result.data, error: null }))
            .catch(err => ({ data: null, error: err }))
        ]);

        if (featureRes.error) throw featureRes.error;
        if (featureRes.data) activeFeatures.value = featureRes.data.map(f => f.feature_id);

        if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error;
        if (profileRes.data) {
          businessProfile.value = profileRes.data;
          console.log('UserStore Debug - Business Profile:', businessProfile.value);
        } else {
          console.log('UserStore Debug - No Business Profile found');
        }
      }

      const { data: userProfileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.value.user.id)
        .single();
      if (profileError && profileError.error.code !== 'PGRST116') throw profileError;
      if (userProfileData) profile.value = userProfileData;

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
    session, profile, organization, role, userRole, isLoggedIn, isReady,
    isSidebarCollapsed, activeFeatures, businessProfile, notification,
    fetchUserProfile, clearUserProfile, toggleSidebar, showNotification
  }
})