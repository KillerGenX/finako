import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router' // REFACTOR 1: Impor useRouter untuk navigasi

// REFACTOR 2: Logika UI dipisahkan. 
// Ini idealnya berada di store terpisah (misal: `useUIStore`) atau composable.
// Untuk saat ini, kita taruh di luar agar `userStore` tetap bersih.
export const useUIStore = defineStore('ui', () => {
  const isSidebarCollapsed = ref(true)
  const notification = ref({ message: '', type: 'info', key: 0 })

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  function showNotification(message, type = 'success', duration = 3000) {
    notification.value = { message, type, key: Date.now() }
    const currentKey = notification.value.key
    setTimeout(() => {
      // Hanya bersihkan jika notifikasi belum berganti
      if (notification.value.key === currentKey) {
        notification.value = { message: '', type: 'info', key: 0 }
      }
    }, duration)
  }

  return { isSidebarCollapsed, notification, toggleSidebar, showNotification }
})


export const useUserStoreRefactored = defineStore('userRefactored', () => {
  const router = typeof window !== 'undefined' ? useRouter() : null // Gunakan di dalam actions untuk navigasi

  // --- REFACTORED STATE ---
  // REFACTOR 3: State disederhanakan dan lebih sesuai dengan skema DB
  const profile = ref(null) // Data dari tabel 'profiles'
  const business = ref(null) // Data dari tabel 'businesses' (sebelumnya 'organization')
  const user = ref(null) // Data dari 'auth.users' (sebelumnya dalam 'session')
  const isReady = ref(false) // Flag untuk menandakan data user sudah selesai dimuat

  // REFACTOR 4: State baru yang sangat penting untuk POS, yaitu outlet aktif
  const activeOutletId = ref(null)

  // --- REFACTORED GETTERS ---
  // REFACTOR 5: Getters dibuat lebih jelas, langsung, dan semantik
  const isLoggedIn = computed(() => !!user.value)
  const businessId = computed(() => business.value?.id || null)
  const userId = computed(() => user.value?.id || null)
  const userEmail = computed(() => user.value?.email || '')
  const userFullName = computed(() => profile.value?.full_name || '')
  const activeRole = computed(() => profile.value?.roles?.name || 'public') // Mengambil role dari data relasi
  const currentSubscription = computed(() => {
    // Cari langganan aktif dari array subscriptions di dalam data business
    if (!business.value?.subscriptions) return null
    return business.value.subscriptions.find(sub => sub.status === 'active') || business.value.subscriptions[0] || null
  })
  const isOnboardingCompleted = computed(() => business.value?.onboarding_status === 'completed')

  // --- REFACTORED ACTIONS ---

  /**
   * REFACTOR 6: PERFORMA DITINGKATKAN DRASTIS
   * Mengambil semua data user, profil, bisnis, langganan, dan plan
   * dalam SATU KALI panggilan ke Supabase.
   */
  async function fetchUserSession() {
    isReady.value = false
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Ambil SEMUA data terkait dalam satu query
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select(`
            *,
            roles ( name ),
            businesses (
              *,
              subscriptions (
                *,
                plans ( name, price )
              )
            )
          `)
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        console.log('--- DEBUG USER STORE ---');
  console.log('Hasil userProfile dari Supabase:', userProfile);
  console.log('Business ID yang didapat:', userProfile?.businesses?.id);
  console.log('Role yang didapat:', userProfile?.roles?.name);
        
        // Populate state dari satu objek hasil query
        user.value = session.user
        profile.value = userProfile
        business.value = userProfile.businesses
        
        // TODO: Atur outlet aktif pertama sebagai default
        // const { data: outlets } = await supabase.from('outlets').select('id').eq('business_id', businessId.value).limit(1)
        // if (outlets && outlets.length > 0) activeOutletId.value = outlets[0].id

      } else {
        // Jika tidak ada sesi, bersihkan semua state
        clearUserSession()
      }
    } catch (e) {
      console.error("Error fetching user session:", e.message)
      clearUserSession()
    } finally {
      isReady.value = true
    }
  }

  function clearUserSession() {
    user.value = null
    profile.value = null
    business.value = null
    isReady.value = true // Tetap set true agar aplikasi bisa lanjut merender halaman login
  }

 async function loginWithEmailPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        useUIStore().showNotification(error.message, 'error');
        return { success: false, error: error.message };
    }

    // Setelah login, panggil fetchUserSession untuk mengambil semua data.
    await fetchUserSession();

    // Setelah data sesi terisi, tentukan langkah selanjutnya.
    let nextStep = 'dashboard'; // Default
    if (!currentSubscription.value || currentSubscription.value.status !== 'active') {
        nextStep = 'payment_info';
    } else if (!isOnboardingCompleted.value) {
        nextStep = 'onboarding';
    }

    useUIStore().showNotification('Login berhasil!', 'success');

    // Kembalikan status sukses DAN langkah selanjutnya.
    return { success: true, nextStep };
}

  // REFACTOR 7: Menggabungkan fungsi logout yang duplikat
  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
      useUIStore().showNotification('Error saat logout', 'error')
      return
    }
    clearUserSession()
    // Redirect ke halaman login menggunakan useRouter
    if (router) {
      router.push('/login')
    }
  }

  // REFACTOR 8: Memisahkan flow redirect ke fungsi tersendiri
  function handleAuthRedirects() {
    if (!isReady.value) return // Jangan lakukan apa-apa jika data belum siap
    if (!isLoggedIn.value) return router?.push('/login')
    
    // Alur Onboarding
    if (!currentSubscription.value || currentSubscription.value.status !== 'active') {
        return router?.push('/payment-info')
    }
    if (!isOnboardingCompleted.value) {
        return router?.push('/onboarding')
    }
    return router?.push('/dashboard')
  }

  return {
    // State
    profile,
    business,
    user,
    isReady,
    activeOutletId,

    // Getters
    isLoggedIn,
    businessId,
    userId,
    userEmail,
    userFullName,
    activeRole,
    currentSubscription,
    isOnboardingCompleted,

    // Actions
    fetchUserSession,
    loginWithEmailPassword,
    logout,

    // Utility / Flow
    handleAuthRedirects,
  }
})