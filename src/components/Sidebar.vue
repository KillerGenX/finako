<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/supabase';
import { useSidebarMenu } from '@/composables/useSidebarMenu';
import { computed } from 'vue';

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

const plan = computed(() => userStore.organization?.subscription?.plan_name?.toLowerCase() || 'basic');
const role = computed(() => (userStore.userRole || 'staff').toLowerCase());
const sidebarMenu = computed(() => useSidebarMenu(plan.value, role.value));

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
      <RouterLink to="/" class="min-w-max flex items-center gap-2">
        <img src="/finako.svg" alt="Finako Logo" class="h-20 w-15" />
      </RouterLink>
    </div>

    <div class="flex-grow overflow-y-auto overflow-x-hidden">
      <ul class="menu p-2 space-y-1">
        <li v-for="menu in sidebarMenu" :key="menu.route">
          <RouterLink :to="menu.route" @mouseenter="showTooltip($event, menu.name)" @mouseleave="hideTooltip" class="items-center">
            <component :is="menu.icon" class="h-6 w-6 shrink-0" />
            <span v-if="!userStore.isSidebarCollapsed">{{ menu.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
    
    <ul class="menu p-2 sticky bottom-0 bg-base-100">
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