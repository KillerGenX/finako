// File: src/stores/userStore.js (VERSI FINAL & BERSIH)

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export const useUserStore = defineStore('user', () => {
  // --- STATE: Gunakan 'ref' untuk semua state yang bisa berubah ---
  const session = ref(null)
  const profile = ref(null)
  const organization = ref(null)
  const role = ref(null)
  const isReady = ref(false)

  // --- GETTERS: Gunakan 'computed' untuk nilai turunan ---
  const userRole = computed(() => role.value || 'public')
  const isLoggedIn = computed(() => !!session.value)

  // --- ACTIONS: Fungsi untuk mengubah state ---
  async function fetchUserProfile() {
    isReady.value = false;
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      session.value = currentSession;

      if (!session.value) {
        isReady.value = true; // Siap, karena tidak ada yang perlu diambil
        return;
      }

      // Ambil data keanggotaan
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select(`role, organizations ( id, name )`)
        .eq('user_id', session.value.user.id);
        
      if (memberError) throw memberError;
      
      if (memberData && memberData.length > 0) {
        const primaryMembership = memberData[0];
        role.value = primaryMembership.role;
        organization.value = primaryMembership.organizations;
      }

      // Ambil data profil
      const { data: userProfileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.value.user.id);
        
      if (profileError) throw profileError;

      if (userProfileData && userProfileData.length > 0) {
        profile.value = userProfileData[0];
      }

    } catch (e) {
      console.error("Error di dalam fetchUserProfile:", e.message);
    } finally {
      // Apapun yang terjadi, nyatakan proses fetch selesai
      isReady.value = true;
    }
  }

  function clearUserProfile() {
    session.value = null;
    profile.value = null;
    organization.value = null;
    role.value = null;
  }

  return { session, profile, organization, role, userRole, isLoggedIn, isReady, fetchUserProfile, clearUserProfile }
})