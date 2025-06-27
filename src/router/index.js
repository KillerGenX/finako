// File: src/router/index.js (VERSI FINAL & BERSIH)
import { supabase } from '@/supabase'
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import DashboardView from '@/views/DashboardView.vue'
import SettingsView from '@/views/SettingsView.vue'
import LoginView from '@/views/LoginView.vue'
import SalesView from '@/views/SalesView.vue'
import OperationalView from '@/views/OperationalView.vue'
import ProductsView from '@/views/ProductsView.vue'
import ExpenseCategoryView from '@/views/ExpenseCategoryView.vue'
import UserManagementView from '@/views/UserManagementView.vue'

const routes = [
  {
    path: '/',
    component: LayoutAuthenticated,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: DashboardView },
      { path: 'pengaturan', name: 'Pengaturan', component: SettingsView },
      { path: 'penjualan', name: 'Penjualan', component: SalesView },
      { path: 'operasional', name: 'Operasional', component: OperationalView },
      { path: 'produk', name: 'Produk', component: ProductsView },
      { path: 'kategori-biaya', name: 'KategoriBiaya', component: ExpenseCategoryView },
      { path: 'pengguna', name: 'Pengguna', component: UserManagementView },
    ]
  },
  { path: '/login', name: 'Login', component: LoginView }
]

const router = createRouter({
  history: createWebHistory(), // Pastikan ini kosong
  routes,
})

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isLoggedIn = !!session;

  const userStore = useUserStore();
  // Pastikan profil user udah di-load biar role-nya bisa dipakai
  if (isLoggedIn && !userStore.isReady) {
    await userStore.fetchUserProfile();
  }

  if (requiresAuth && !isLoggedIn) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && isLoggedIn) {
    // Pegawai login langsung ke Penjualan
    if (userStore.userRole === 'pegawai') {
      next({ name: 'Penjualan' });
    } else {
      next({ name: 'Dashboard' });
    }
  } else if (isLoggedIn && userStore.userRole === 'pegawai') {
    // Kalau pegawai, hanya boleh akses Penjualan dan Operasional
    if (['Penjualan', 'Operasional'].includes(to.name)) {
      next();
    } else {
      // Arahkan ke Penjualan kalau maksa buka halaman lain
      next({ name: 'Penjualan' });
    }
  } else {
    next();
  }
});


export default router