// File: src/router/index.js (FINAL DENGAN PENAMAAN INDONESIA YANG BENAR)

import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

// --- Impor Komponen dengan Nama File yang Sudah Benar ---
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import DashboardView from '@/views/DashboardView.vue';
import TransaksiView from '@/views/TransaksiView.vue';
import ProdukView from '@/views/ProdukView.vue';
import StokView from '@/views/StokView.vue';
import BiayaView from '@/views/BiayaView.vue';
import LaporanView from '@/views/LaporanView.vue';
import AbsensiView from '@/views/AbsensiView.vue';
import PelangganView from '@/views/PelangganView.vue';
import PegawaiView from '@/views/PegawaiView.vue';
import PengaturanView from '@/views/PengaturanView.vue'; // <-- PERBAIKAN NAMA IMPORT
import LoginView from '@/views/LoginView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import KategoriBiayaView from '@/views/KategoriBiayaView.vue';
import TestView from '@/views/TestView.vue';

const routes = [
  {
    path: '/',
    component: LayoutAuthenticated,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: DashboardView, meta: { roles: ['owner'] } },
      { path: 'transaksi', name: 'Transaksi', component: TransaksiView, meta: { features: ['pos'] } },
      { path: 'biaya', name: 'Biaya', component: BiayaView, meta: { features: ['expenses'] } },
      { path: 'produk', name: 'Produk', component: ProdukView, meta: { roles: ['owner'] } },
      { path: 'stok', name: 'Stok', component: StokView, meta: { roles: ['owner'], features: ['stock_management'] } },
      { path: 'laporan', name: 'Laporan', component: LaporanView, meta: { roles: ['owner'], features: ['reports'] } },
      { path: 'absensi', name: 'Absensi', component: AbsensiView, meta: { features: ['employee_attendance'] } },
      { path: 'pegawai', name: 'Pegawai', component: PegawaiView, meta: { roles: ['owner'], features: ['employee_management'] } },
      { path: 'kategori-biaya', name: 'KategoriBiaya', component: KategoriBiayaView, meta: { roles: ['owner'] } },
      { path: 'pelanggan', name: 'Pelanggan', component: PelangganView, meta: { roles: ['owner'], features: ['customer_data'] } },
      
      // --- PERBAIKAN DI SINI ---
      // Path diubah agar sesuai dengan sidebar ('/pengaturan')
      // Nama diubah agar konsisten
      // Komponen sekarang menunjuk ke `PengaturanView` yang benar
      { path: 'pengaturan', name: 'Pengaturan', component: PengaturanView, meta: { roles: ['owner'] } },
    ]
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: LoginView 
  },
  // Tambahkan route register
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue')
  },
  // Tambahkan route payment-info
  {
    path: '/payment-info',
    name: 'PaymentInfo',
    component: () => import('@/views/PaymentInfoView.vue')
  },
  // Tambahkan route onboarding
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/views/OnboardingView.vue')
  },
  // Test route
  {
    path: '/test',
    name: 'Test',
    component: TestView
  },
  { 
    path: '/:pathMatch(.*)*', 
    name: 'NotFound', 
    component: NotFoundView 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
});

// --- Navigation Guard dengan Alur SaaS Multi-Tenant ---
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // Fetch user profile jika belum ready
  if (!userStore.isReady) {
    try {
      console.log('Fetching user profile...');
      // Tambahkan timeout untuk menghindari hang
      await Promise.race([
        userStore.fetchUserProfile(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]);
      console.log('User profile fetched successfully');
    } catch (error) {
      console.error('fetchUserProfile error:', error);
      // Jika error, set ready true dan lanjutkan ke login
      userStore.isReady = true;
    }
  }

  const isLoggedIn = userStore.isLoggedIn;
  const userRole = userStore.userRole;
  const activeFeatures = userStore.activeFeatures || [];
  const organization = userStore.organization;
  const businessProfile = userStore.businessProfile;

  // Debug logs
  console.log('Navigation Guard Debug:', {
    to: to.name,
    isLoggedIn,
    organizationStatus: organization?.status,
    hasBusinessProfile: !!businessProfile,
    userRole
  });

  // Jika route memerlukan auth dan user belum login
  if (to.meta.requiresAuth && !isLoggedIn) {
    console.log('Redirecting to Login: Not authenticated');
    return next({ name: 'Login' });
  }

  // Jika user sudah login dan akses halaman login
  if (to.name === 'Login' && isLoggedIn) {
    // Cek status organization untuk redirect yang tepat
    if (organization?.status === 'pending') {
      console.log('Redirecting to PaymentInfo: Organization status pending');
      return next({ name: 'PaymentInfo' });
    } else if (organization?.status === 'active' && !businessProfile) {
      console.log('Redirecting to Onboarding: Organization active but no business profile');
      return next({ name: 'Onboarding' });
    }
    console.log('Redirecting to Dashboard/Transaksi: Normal login flow');
    return userRole === 'owner' ? next({ name: 'Dashboard' }) : next({ name: 'Transaksi' });
  }

  // Logic untuk tenant dengan organization status pending
  if (isLoggedIn && organization?.status === 'pending' && to.name !== 'PaymentInfo') {
    console.log('Redirecting to PaymentInfo: Organization still pending');
    return next({ name: 'PaymentInfo' });
  }

  // Logic untuk tenant dengan organization status active tapi belum setup business_profile
  if (isLoggedIn && organization?.status === 'active' && !businessProfile && to.name !== 'Onboarding') {
    console.log('Redirecting to Onboarding: Need to setup business profile');
    return next({ name: 'Onboarding' });
  }

  // ✅ NEW: Logic untuk tenant yang sudah punya business profile
  if (isLoggedIn && organization?.status === 'active' && businessProfile && to.name === 'Onboarding') {
    console.log('Redirecting to Dashboard: Business profile already exists');
    return userRole === 'owner' ? next({ name: 'Dashboard' }) : next({ name: 'Transaksi' });
  }

  // Cek role dan feature access untuk protected routes
  if (to.meta.requiresAuth && isLoggedIn) {
    const requiredRoles = to.meta.roles;
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      console.log('Redirecting: Insufficient role access');
      return userRole === 'owner' ? next({ name: 'Dashboard' }) : next({ name: 'Transaksi' });
    }
    
    const requiredFeatures = to.meta.features;
    if (requiredFeatures) {
      const hasAccess = requiredFeatures.every(feature => activeFeatures.includes(feature));
      if (!hasAccess) {
        console.log('Redirecting: Insufficient feature access');
        return userRole === 'owner' ? next({ name: 'Dashboard' }) : next({ name: 'Transaksi' });
      }
    }
  }

  console.log('Navigation allowed to:', to.name);
  return next();
});

export default router;