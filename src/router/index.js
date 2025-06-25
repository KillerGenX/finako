// File: src/router/index.js (Versi dengan Halaman Baru)

import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/supabase";

import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import DashboardView from "@/views/DashboardView.vue";
import SettingsView from "@/views/SettingsView.vue";
import LoginView from "@/views/LoginView.vue";
// --- Impor Halaman Baru Kita ---
import SalesView from "@/views/SalesView.vue";
import OperationalView from "@/views/OperationalView.vue";
import ProductsView from "@/views/ProductsView.vue";
import ExpenseCategoryView from "@/views/ExpenseCategoryView.vue";
import UserManagementView from "@/views/UserManagementView.vue";

const routes = [
  {
    path: "/",
    component: LayoutAuthenticated,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: DashboardView,
      },
      {
        path: "pengaturan",
        name: "Pengaturan",
        component: SettingsView,
      },
      // --- RUTE BARU DITAMBAHKAN DI SINI ---
      {
        path: "penjualan", // URL-nya akan menjadi /penjualan
        name: "Penjualan",
        component: SalesView,
      },
      {
        path: "operasional", // URL-nya akan menjadi /operasional
        name: "Operasional",
        component: OperationalView,
      },
      {
        path: "produk", // URL-nya akan menjadi /produk
        name: "Produk",
        component: ProductsView, // Menunjuk ke file yang baru kita buat
        meta: { requiresAuth: true },
      },
      {
        path: "kategori-biaya", // URL-nya akan menjadi /kategori-biaya
        name: "KategoriBiaya",
        component: ExpenseCategoryView,
        meta: { requiresAuth: true },
      },
      {
        path: "pengguna", // URL-nya akan menjadi /pengguna
        name: "Pengguna",
        component: UserManagementView, // Menunjuk ke file yang baru kita buat
        meta: { requiresAuth: true }, // Halaman ini juga butuh login
      },
      // --- AKHIR RUTE BARU ---
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
];

// ... sisa file router tidak berubah ...
const router = createRouter({ history: createWebHistory(), routes });
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const { data } = await supabase.auth.getSession();
    if (data.session === null) {
      next({ name: "Login" });
    } else {
      next();
    }
  } else {
    next();
  }
});
export default router;
