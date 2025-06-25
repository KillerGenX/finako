// File: src/stores/userStore.js (Dengan status 'isReady')

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/supabase";

export const useUserStore = defineStore("user", () => {
  // --- STATE ---
  const session = ref(null);
  const profile = ref(null);
  const isReady = ref(false); // <-- BAGIAN BARU: Awalnya, statusnya 'tidak siap'

  // --- GETTERS ---
  const role = computed(() => profile.value?.role || "public");
  const isLoggedIn = computed(() => !!session.value);

  // --- ACTIONS ---
  async function fetchUserProfile() {
    // Set 'isReady' ke false setiap kali kita mulai mengambil data baru
    isReady.value = false;
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      session.value = currentSession;
      if (!session.value) return;

      const { data: userProfile, error } = await supabase.from("profiles").select("*").eq("id", session.value.user.id).single();

      if (error) throw error;
      profile.value = userProfile;
    } catch (e) {
      console.error("Error fetching user profile:", e.message);
    } finally {
      // <-- BAGIAN BARU: Apapun hasilnya (sukses/gagal), tandai bahwa store sudah 'siap'
      isReady.value = true;
    }
  }

  function clearUserProfile() {
    profile.value = null;
    session.value = null;
  }

  // Kembalikan juga 'isReady' agar bisa digunakan komponen lain
  return { session, profile, fetchUserProfile, role, isLoggedIn, clearUserProfile, isReady };
});
