<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';

// Impor semua ikon yang kita butuhkan
import {
  HomeIcon, Cog6ToothIcon, ShoppingCartIcon, BuildingStorefrontIcon,
  ArchiveBoxIcon, CubeIcon, ChartPieIcon, UsersIcon, ClockIcon,
  ArrowLeftOnRectangleIcon, QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline';

const userStore = useUserStore();
const router = useRouter();

// Fungsi logout tidak perlu diubah
async function handleLogout() {
  await supabase.auth.signOut();
  userStore.clearUserProfile();
  router.push("/login");
}
</script>

<template>
  <aside 
    class="bg-base-100 text-base-content flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shadow-lg"
    :class="userStore.isSidebarCollapsed ? 'w-20' : 'w-64'"
  >
    <div class="h-16 flex items-center justify-between p-4 sticky top-0 bg-base-100">
      <RouterLink to="/" v-if="!userStore.isSidebarCollapsed">
        <h2 class="text-2xl font-bold text-primary">Finako</h2>
      </RouterLink>
      <button @click="userStore.toggleSidebar" class="btn btn-square btn-ghost">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
      </button>
    </div>

    <div class="flex-grow overflow-y-auto overflow-x-hidden">
      <ul class="menu p-2 space-y-1">

        <li v-if="userStore.userRole === 'owner'">
          <RouterLink to="/" class="items-center">
            <HomeIcon class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">Dasbor</span>
          </RouterLink>
        </li>

        <li v-if="userStore.activeFeatures.includes('pos')">
          <RouterLink to="/transaksi" class="items-center">
            <ShoppingCartIcon class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">Kasir (POS)</span>
          </RouterLink>
        </li>
        
        <li v-if="userStore.activeFeatures.includes('expenses')">
          <RouterLink to="/biaya" class="items-center">
            <BuildingStorefrontIcon class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">Biaya Operasional</span>
          </RouterLink>
        </li>
        
        <template v-if="userStore.userRole === 'owner'">
          <div class="divider my-2" v-if="!userStore.isSidebarCollapsed"></div>
          
          <li>
            <RouterLink to="/produk" class="items-center">
              <ArchiveBoxIcon class="h-6 w-6 shrink-0" />
              <span v-if="!userStore.isSidebarCollapsed">Produk</span>
            </RouterLink>
          </li>

          <li v-if="userStore.activeFeatures.includes('stock_management')">
            <RouterLink to="/stok" class="items-center">
              <CubeIcon class="h-6 w-6 shrink-0" />
              <span v-if="!userStore.isSidebarCollapsed">Manajemen Stok</span>
            </RouterLink>
          </li>
          
          <li v-if="userStore.activeFeatures.includes('reports')">
            <RouterLink to="/laporan" class="items-center">
              <ChartPieIcon class="h-6 w-6 shrink-0" />
              <span v-if="!userStore.isSidebarCollapsed">Laporan</span>
            </RouterLink>
          </li>
        </template>
        
        <li v-if="userStore.activeFeatures.includes('employee_attendance')">
          <RouterLink to="/absensi" class="items-center">
            <ClockIcon class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">Absensi</span>
          </RouterLink>
        </li>
      </ul>
    </div>
    
    <ul class="menu p-2 sticky bottom-0 bg-base-100">
      <template v-if="userStore.userRole === 'owner'">
        <li v-if="userStore.activeFeatures.includes('employee_management')">
          <RouterLink to="/pegawai" class="items-center">
            <UsersIcon class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">Kelola Pegawai</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/pengaturan" class="items-center">
            <Cog6ToothIcon class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">Setting Usaha</span>
          </RouterLink>
        </li>
      </template>

      <li>
        <a @click="handleLogout" class="items-center">
          <ArrowLeftOnRectangleIcon class="h-6 w-6 shrink-0" />
          <span v-if="!userStore.isSidebarCollapsed">Logout</span>
        </a>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
/* Style agar link yang aktif memiliki background warna primary.
  `linkActiveClass: 'active'` di router/index.js akan otomatis menambahkan kelas 'active'
  ke <RouterLink> yang sesuai dengan halaman saat ini.
*/
.menu li > a.active {
  background-color: hsl(var(--p));
  color: hsl(var(--pc));
  font-weight: 600;
}
</style>