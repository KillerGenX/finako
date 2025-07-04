// File: src/router/index.js - Enhanced Multi-Tenant Router

import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import apiService from '@/services/api';

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

// --- Enhanced Navigation Guard dengan Multi-Tenant Validation ---
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // Initialize user profile if not ready
  if (!userStore.isReady) {
    try {
      console.log('🔄 Initializing user profile...');
      await Promise.race([
        userStore.fetchUserProfile(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 15000)
        )
      ]);
      console.log('✅ User profile initialized successfully');
    } catch (error) {
      console.error('❌ Profile initialization error:', error);
      userStore.isReady = true; // Prevent infinite loop
    }
  }

  const isLoggedIn = userStore.isLoggedIn;
  const userRole = userStore.userRole;
  const activeFeatures = userStore.activeFeatures || [];
  const organization = userStore.organization;
  const businessProfile = userStore.businessProfile;

  // Enhanced debug logs
  console.log('🔍 Navigation Guard Debug:', {
    to: to.name,
    from: from.name,
    isLoggedIn,
    hasValidMembership: userStore.hasValidMembership,
    organizationId: userStore.organizationId,
    organizationStatus: organization?.status,
    hasBusinessProfile: !!businessProfile,
    userRole,
    activeFeatures: activeFeatures.slice(0, 3) // Show first 3 features
  });

  // Public routes that don't require auth
  const publicRoutes = ['Login', 'Register', 'PaymentInfo', 'Test', 'NotFound'];
  const isPublicRoute = publicRoutes.includes(to.name);

  // Enhanced authentication check
  if (to.meta.requiresAuth && !isLoggedIn) {
    console.log('🔒 Redirecting to Login: Authentication required');
    return next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } // Save intended destination
    });
  }

  // Enhanced multi-tenant organization validation
  if (isLoggedIn && to.meta.requiresAuth) {
    try {
      // Validate organization membership
      if (!userStore.hasValidMembership) {
        console.log('⚠️ Invalid membership detected');
        userStore.showNotification('Akses organisasi tidak valid. Silakan login ulang.', 'error');
        await userStore.logout();
        return next({ name: 'Login' });
      }

      // Validate organization status
      if (organization?.status === 'suspended') {
        console.log('🚫 Organization suspended');
        userStore.showNotification('Organisasi Anda telah disuspend. Hubungi support.', 'error');
        return next({ name: 'Login' });
      }

      if (organization?.status === 'deleted') {
        console.log('🗑️ Organization deleted');
        userStore.showNotification('Organisasi Anda telah dihapus.', 'error');
        await userStore.logout();
        return next({ name: 'Login' });
      }

    } catch (error) {
      console.error('❌ Organization validation error:', error);
      userStore.showNotification('Error validasi organisasi', 'error');
      return next({ name: 'Login' });
    }
  }

  // Handle logged-in user accessing login page
  if (to.name === 'Login' && isLoggedIn) {
    const redirect = to.query.redirect;
    
    // Check organization flow
    if (organization?.status === 'pending') {
      console.log('💳 Redirecting to PaymentInfo: Organization pending');
      return next({ name: 'PaymentInfo' });
    } 
    
    if (organization?.status === 'active' && !businessProfile) {
      console.log('⚙️ Redirecting to Onboarding: Setup required');
      return next({ name: 'Onboarding' });
    }
    
    // Redirect to intended destination or default based on role
    const defaultRoute = userRole === 'owner' ? { name: 'Dashboard' } : { name: 'Transaksi' };
    const destination = redirect ? { path: redirect } : defaultRoute;
    
    console.log('🏠 Redirecting to:', destination);
    return next(destination);
  }

  // Multi-tenant organization flow validation
  if (isLoggedIn && organization) {
    // Pending payment flow
    if (organization.status === 'pending' && to.name !== 'PaymentInfo') {
      console.log('💳 Enforcing payment info: Organization pending');
      return next({ name: 'PaymentInfo' });
    }

    // Onboarding flow
    if (organization.status === 'active' && !businessProfile && to.name !== 'Onboarding') {
      console.log('⚙️ Enforcing onboarding: Business profile required');
      return next({ name: 'Onboarding' });
    }

    // Prevent accessing onboarding when already completed
    if (organization.status === 'active' && businessProfile && to.name === 'Onboarding') {
      console.log('✅ Onboarding already completed, redirecting');
      const defaultRoute = userRole === 'owner' ? { name: 'Dashboard' } : { name: 'Transaksi' };
      return next(defaultRoute);
    }
  }

  // Enhanced role-based access control
  if (to.meta.requiresAuth && isLoggedIn) {
    const requiredRoles = to.meta.roles;
    if (requiredRoles && !userStore.hasRole(requiredRoles[0])) {
      console.log('🚫 Access denied: Insufficient role');
      userStore.showNotification('Akses tidak diizinkan untuk role Anda', 'error');
      const fallbackRoute = userRole === 'owner' ? { name: 'Dashboard' } : { name: 'Transaksi' };
      return next(fallbackRoute);
    }
    
    // Enhanced feature-based access control
    const requiredFeatures = to.meta.features;
    if (requiredFeatures) {
      const hasFeatureAccess = requiredFeatures.every(feature => userStore.hasFeature(feature));
      if (!hasFeatureAccess) {
        console.log('🚫 Access denied: Missing required features:', requiredFeatures);
        userStore.showNotification('Fitur tidak tersedia dalam paket Anda', 'error');
        const fallbackRoute = userRole === 'owner' ? { name: 'Dashboard' } : { name: 'Transaksi' };
        return next(fallbackRoute);
      }
    }
  }

  // Health check for protected routes (optional)
  if (to.meta.requiresAuth && isLoggedIn && to.name !== 'Test') {
    try {
      // Periodic API health check (every 10 minutes)
      const lastHealthCheck = localStorage.getItem('lastHealthCheck');
      const now = Date.now();
      if (!lastHealthCheck || (now - parseInt(lastHealthCheck)) > 600000) {
        apiService.healthCheck()
          .then(() => {
            localStorage.setItem('lastHealthCheck', now.toString());
          })
          .catch(error => {
            console.warn('⚠️ API health check failed:', error);
            // Don't block navigation, just log
          });
      }
    } catch (error) {
      console.warn('⚠️ Health check error:', error);
      // Don't block navigation
    }
  }

  console.log('✅ Navigation allowed to:', to.name);
  return next();
});

export default router;