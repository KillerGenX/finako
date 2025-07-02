<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/supabase';

// Impor semua ikon yang kita butuhkan
import {
  HomeIcon, Cog6ToothIcon, ShoppingCartIcon, BuildingStorefrontIcon,
  ArchiveBoxIcon, CubeIcon, ChartPieIcon, UsersIcon, ClockIcon,
  ArrowLeftOnRectangleIcon, UserGroupIcon, TagIcon
} from '@heroicons/vue/24/outline';
import { ChevronDoubleLeftIcon } from '@heroicons/vue/24/solid';

const emit = defineEmits(['show-tooltip', 'hide-tooltip']);
const userStore = useUserStore();
const router = useRouter();

// Fungsi untuk tooltip & logout (tidak berubah)
function showTooltip(event, text) {
  if (userStore.isSidebarCollapsed) {
    emit('show-tooltip', { event, text });
  }
}
function hideTooltip() {
  if (userStore.isSidebarCollapsed) {
    emit('hide-tooltip');
  }
}
async function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    await supabase.auth.signOut();
    userStore.clearUserProfile();
    router.push("/login");
  }
}
</script>

<template>
  <aside 
    class="bg-base-100 text-base-content flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shadow-lg"
    :class="userStore.isSidebarCollapsed ? 'w-20' : 'w-64'"
  >
    <div class="h-16 flex items-center justify-center p-4">
      <RouterLink to="/" class="min-w-max">
        <h2 v-if="!userStore.isSidebarCollapsed" class="text-2xl font-bold text-primary">Finako</h2>
        <h2 v-else class="text-3xl font-bold text-primary">F</h2>
      </RouterLink>
    </div>

    <div class="flex-grow overflow-y-auto overflow-x-hidden">
      <ul class="menu p-2 space-y-1">
        <li class="menu-title" v-if="!userStore.isSidebarCollapsed"><span>Harian</span></li>
        <li v-if="userStore.userRole === 'owner'">
          <RouterLink to="/" @mouseenter="showTooltip($event, 'Dasbor')" @mouseleave="hideTooltip" class="items-center">
            <HomeIcon class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">Dasbor</span>
          </RouterLink>
        </li>
        <li v-if="userStore.activeFeatures.includes('pos')">
          <RouterLink to="/transaksi" @mouseenter="showTooltip($event, 'Kasir (POS)')" @mouseleave="hideTooltip" class="items-center">
            <ShoppingCartIcon class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">Kasir (POS)</span>
          </RouterLink>
        </li>

        <template v-if="userStore.userRole === 'owner'">
          <div class="divider my-2" v-if="!userStore.isSidebarCollapsed"></div>
          <li class="menu-title" v-if="!userStore.isSidebarCollapsed"><span>Manajemen</span></li>
          <li>
            <RouterLink to="/produk" @mouseenter="showTooltip($event, 'Produk')" @mouseleave="hideTooltip" class="items-center">
              <ArchiveBoxIcon class="h-6 w-6 shrink-0" />
              <span v-if="!userStore.isSidebarCollapsed">Produk</span>
            </RouterLink>
          </li>
          <li v-if="userStore.activeFeatures.includes('stock_management')">
            <RouterLink to="/stok" @mouseenter="showTooltip($event, 'Stok')" @mouseleave="hideTooltip" class="items-center">
              <CubeIcon class="h-6 w-6 shrink-0" />
              <span v-if="!userStore.isSidebarCollapsed">Stok</span>
            </RouterLink>
          </li>
          <li v-if="userStore.activeFeatures.includes('expenses')">
            <RouterLink to="/biaya" @mouseenter="showTooltip($event, 'Biaya')" @mouseleave="hideTooltip" class="items-center">
              <BuildingStorefrontIcon class="h-6 w-6 shrink-0" />
              <span v-if="!userStore.isSidebarCollapsed">Biaya</span>
            </RouterLink>
          </li>

          <li v-if="userStore.activeFeatures.includes('kategori-biaya')">
            <RouterLink to="/kategori-biaya" @mouseenter="showTooltip($event, 'Kategori Biaya')" @mouseleave="hideTooltip" class="items-center">
              <TagIcon class="h-6 w-6 shrink-0" />
              <span v-if="!userStore.isSidebarCollapsed">Kategori Biaya</span>
            </RouterLink>
          </li>
           <li v-if="userStore.activeFeatures.includes('customer_data')">
            <RouterLink to="/pelanggan" @mouseenter="showTooltip($event, 'Pelanggan')" @mouseleave="hideTooltip" class="items-center">
              <UserGroupIcon class="h-6 w-6 shrink-0" />
              <span v-if="!userStore.isSidebarCollapsed">Pelanggan</span>
            </RouterLink>
          </li>
        </template>
        
        <template v-if="userStore.userRole === 'owner'">
            <div class="divider my-2" v-if="!userStore.isSidebarCollapsed && (userStore.activeFeatures.includes('reports') || userStore.activeFeatures.includes('employee_attendance'))"></div>
            <li v-if="userStore.activeFeatures.includes('reports')">
                <RouterLink to="/laporan" @mouseenter="showTooltip($event, 'Laporan')" @mouseleave="hideTooltip" class="items-center">
                    <ChartPieIcon class="h-6 w-6 shrink-0" />
                    <span v-if="!userStore.isSidebarCollapsed">Laporan</span>
                </RouterLink>
            </li>
            <li v-if="userStore.activeFeatures.includes('employee_management')">
              <RouterLink to="/pegawai" @mouseenter="showTooltip($event, 'Pegawai')" @mouseleave="hideTooltip" class="items-center">
                <UsersIcon class="h-6 w-6 shrink-0" />
                <span v-if="!userStore.isSidebarCollapsed">Pegawai</span>
              </RouterLink>
            </li>
        </template>
        
        <li v-if="userStore.activeFeatures.includes('employee_attendance')">
          <RouterLink to="/absensi" @mouseenter="showTooltip($event, 'Absensi')" @mouseleave="hideTooltip" class="items-center">
            <ClockIcon class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">Absensi</span>
          </RouterLink>
        </li>
      </ul>
    </div>
    
    <ul class="menu p-2 sticky bottom-0 bg-base-100">
       <li v-if="userStore.userRole === 'owner'">
          <RouterLink to="/pengaturan" @mouseenter="showTooltip($event, 'Pengaturan')" @mouseleave="hideTooltip" class="items-center">
            <Cog6ToothIcon class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">Pengaturan</span>
          </RouterLink>
        </li>
      <li>
        <a @click="handleLogout" @mouseenter="showTooltip($event, 'Logout')" @mouseleave="hideTooltip" class="items-center">
          <ArrowLeftOnRectangleIcon class="h-6 w-6 shrink-0" />
          <span v-if="!userStore.isSidebarCollapsed">Logout</span>
        </a>
      </li>
       <li>
        <a @click="userStore.toggleSidebar" class="items-center" @mouseenter="showTooltip($event, userStore.isSidebarCollapsed ? 'Perbesar' : 'Kecilkan')" @mouseleave="hideTooltip">
          <ChevronDoubleLeftIcon 
            class="h-6 w-6 shrink-0 transition-transform duration-300"
            :class="{ 'rotate-180': userStore.isSidebarCollapsed }"
          />
          <span v-if="!userStore.isSidebarCollapsed">Kecilkan</span>
        </a>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
/* Style ini tidak berubah dan sudah benar */
.menu li > a.router-link-active, .menu li > a.router-link-exact-active {
  background-color: hsl(var(--p));
  color: hsl(var(--pc));
  font-weight: 600;
}
.w-64 .tooltip::before, .w-64 .tooltip::after { display: none !important; }
.w-20 .tooltip::before, .w-20 .tooltip::after { display: revert !important; }
</style>