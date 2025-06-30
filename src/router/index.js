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
import PegawaiView from '@/views/PegawaiView.vue';
import PengaturanView from '@/views/PengaturanView.vue'; // <-- PERBAIKAN NAMA IMPORT
import LoginView from '@/views/LoginView.vue';
import NotFoundView from '@/views/NotFoundView.vue';

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

// --- Navigation Guard (Tidak ada perubahan, logika sudah benar) ---
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isReady) {
    await userStore.fetchUserProfile();
  }

  const isLoggedIn = userStore.isLoggedIn;
  const userRole = userStore.userRole;
  const activeFeatures = userStore.activeFeatures || [];

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: 'Login' });
  }

  if (to.name === 'Login' && isLoggedIn) {
    return userRole === 'owner' ? next({ name: 'Dashboard' }) : next({ name: 'Transaksi' });
  }
  
  if (to.meta.requiresAuth && isLoggedIn) {
    const requiredRoles = to.meta.roles;
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      return userRole === 'owner' ? next({ name: 'Dashboard' }) : next({ name: 'Transaksi' });
    }
    
    const requiredFeatures = to.meta.features;
    if (requiredFeatures) {
      const hasAccess = requiredFeatures.every(feature => activeFeatures.includes(feature));
      if (!hasAccess) {
        return userRole === 'owner' ? next({ name: 'Dashboard' }) : next({ name: 'Transaksi' });
      }
    }
  }

  return next();
});

export default router;