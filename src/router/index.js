import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue' // <-- TAMBAHKAN INI
import { useUserStoreRefactored } from '@/stores/userStoreRefactored'

// Import Views
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import RegisterSuccessView from '@/views/RegisterSuccessView.vue'
import PaymentInfoView from '@/views/PaymentInfoView.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import DashboardView from '@/views/DashboardView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

// Import other existing views
import AbsensiView from '@/views/AbsensiView.vue'
import BiayaView from '@/views/BiayaView.vue'
import KategoriBiayaView from '@/views/KategoriBiayaView.vue'
import LaporanView from '@/views/LaporanView.vue'
import PegawaiView from '@/views/PegawaiView.vue'
import PelangganView from '@/views/PelangganView.vue'
import PengaturanView from '@/views/PengaturanView.vue'
import ProdukView from '@/views/ProdukView.vue'
import StokView from '@/views/StokView.vue'
import TransaksiView from '@/views/TransaksiView.vue'
import AcceptInvitationView from '@/views/AcceptInvitationView.vue';

const routes = [
  // Public Routes (No Authentication Required)
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { 
      requiresAuth: false,
      title: 'Login - Finako'
    }
  },
  {
    path: '/register',
    name: 'Register', 
    component: RegisterView,
    meta: { 
      requiresAuth: false,
      title: 'Daftar - Finako'
    }
  },
  {
    path: '/register/success',
    name: 'RegisterSuccess',
    component: RegisterSuccessView,
    meta: {
      requiresAuth: false,
      title: 'Registrasi Berhasil - Finako'
    }
  },

  // SaaS Flow Routes (Authentication Required)
  {
    path: '/payment-info',
    name: 'PaymentInfo',
    component: PaymentInfoView,
    meta: {
      requiresAuth: true,
      allowedStatus: ['pending'],
      title: 'Informasi Pembayaran - Finako',
      layout: 'SaasFlow'
    }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: OnboardingView,
    meta: {
      requiresAuth: true,
      allowedStatus: ['active'],
      requiresOnboarding: false,
      title: 'Setup Bisnis - Finako',
      layout: 'SaasFlow'
    }
  },

  // Main Application Routes (Full Access Required)
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Dashboard - Finako'
    }
  },
  {
    path: '/dashboard',
    redirect: '/'
  },
  {
    path: '/transaksi',
    name: 'Transaksi',
    component: TransaksiView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Transaksi - Finako'
    }
  },
  {
    path: '/produk',
    name: 'Produk',
    component: ProdukView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Produk - Finako'
    }
  },
  {
    path: '/pelanggan',
    name: 'Pelanggan',
    component: PelangganView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Pelanggan - Finako'
    }
  },
  {
    path: '/stok',
    name: 'Stok',
    component: StokView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Stok - Finako'
    }
  },
  {
    path: '/biaya',
    name: 'Biaya',
    component: BiayaView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Biaya - Finako'
    }
  },
  {
    path: '/kategori-biaya',
    name: 'KategoriBiaya',
    component: KategoriBiayaView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Kategori Biaya - Finako'
    }
  },
  {
    path: '/laporan',
    name: 'Laporan',
    component: LaporanView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Laporan - Finako'
    }
  },
  {
    path: '/pegawai',
    name: 'Pegawai',
    component: PegawaiView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Pegawai - Finako'
    }
  },
  {
    path: '/absensi',
    name: 'Absensi',
    component: AbsensiView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Absensi - Finako'
    }
  },
  {
    path: '/pengaturan',
    name: 'Pengaturan',
    component: PengaturanView,
    meta: {
      requiresAuth: true,
      requiresOnboarding: true,
      allowedStatus: ['active'],
      title: 'Pengaturan - Finako'
    }
  },

  // 404 Route
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: 'Halaman Tidak Ditemukan - Finako'
    }
  },
  {
    path: '/accept-invitation',
    name: 'AcceptInvitation',
    component: AcceptInvitationView,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards untuk SaaS Flow Control
router.beforeEach(async (to, from, next) => {
  // Gunakan store BARU
  const userStore = useUserStoreRefactored()

  document.title = to.meta.title || 'Finako POS'

  // Tunggu sampai store baru selesai memuat data sesi awal
  // Ini menggantikan `waitForReady` loop Anda dengan cara yang lebih bersih
  if (!userStore.isReady) {
    await new Promise(resolve => {
      const unwatch = watch(() => userStore.isReady, (ready) => {
        if (ready) {
          unwatch()
          resolve()
        }
      })
    })
  }

  const isLoggedIn = userStore.isLoggedIn
  const isOnboardingDone = userStore.isOnboardingCompleted
  const subscriptionStatus = userStore.currentSubscription?.status

  // === Logika Routing ===

   // Jika route butuh login, TAPI user belum login
   if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // Jika user sudah login TAPI mencoba akses halaman login/register
  if (isLoggedIn && ['Login', 'Register'].includes(to.name)) {
    return next({ name: 'Dashboard' });
  }

  // --- Alur SaaS Flow untuk user yang SUDAH Login (VERSI BARU) ---
  if (isLoggedIn && to.meta.requiresAuth) {
    
    // Ambil peran dari store
    const userRole = userStore.activeRole; 

    // Hanya Owner yang dicek alur langganan & onboarding
    if (userRole === 'Owner') {
        // 1. Cek Langganan
        if (subscriptionStatus !== 'active') {
            if (to.name !== 'PaymentInfo') return next({ name: 'PaymentInfo' });
        }
        // 2. Cek Onboarding
        else if (!isOnboardingDone) {
            if (to.name !== 'Onboarding') return next({ name: 'Onboarding' });
        }
        // 3. Jika Owner sudah selesai semua
        else {
            if (['Onboarding', 'PaymentInfo'].includes(to.name)) {
                return next({ name: 'Dashboard' });
            }
        }
    }
    // Kasus untuk non-Owner (misal, Kasir)
    else {
      // Cegah non-owner akses halaman saas flow secara manual
      if (['Onboarding', 'PaymentInfo'].includes(to.name)) {
         return next({ name: 'Dashboard' });
      }
    }
  }

  // Jika semua kondisi di atas lolos, izinkan akses
  next()
})

// Helper function to get redirect route based on next step
function getRedirectRoute(nextStep) {
  switch (nextStep) {
    case 'payment_info':
      return 'PaymentInfo'
    case 'onboarding':
      return 'Onboarding'
    case 'dashboard':
      return 'Dashboard'
    default:
      return 'Dashboard'
  }
}

export default router