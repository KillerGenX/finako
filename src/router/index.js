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
  // Dapatkan status sesi terbaru langsung dari Supabase
  const { data: { session } } = await supabase.auth.getSession();

  // Cek apakah rute yang dituju memerlukan autentikasi
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Cek apakah pengguna sudah login berdasarkan ada atau tidaknya sesi
  const isLoggedIn = !!session;

  if (requiresAuth && !isLoggedIn) {
    // KASUS 1: Pengguna mencoba akses halaman terproteksi TAPI belum login.
    // Solusi: Paksa ke halaman Login.
    next({ name: 'Login' });
  } else if (to.name === 'Login' && isLoggedIn) {
    // KASUS 2: Pengguna SUDAH login TAPI mencoba akses halaman Login.
    // Solusi: Arahkan ke Dashboard.
    next({ name: 'Dashboard' });
  } else {
    // KASUS 3: Semua kondisi lain (misal: akses halaman terproteksi & sudah login).
    // Solusi: Izinkan navigasi.
    next();
  }
});

export default router