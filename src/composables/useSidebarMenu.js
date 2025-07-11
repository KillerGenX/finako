// src/composables/useSidebarMenu.js
import {
  HomeIcon, Cog6ToothIcon, ShoppingCartIcon, BuildingStorefrontIcon,
  ArchiveBoxIcon, CubeIcon, ChartPieIcon, UsersIcon, ClockIcon,
  ArrowLeftOnRectangleIcon, UserGroupIcon, TagIcon
} from '@heroicons/vue/24/outline';

import { ChevronDoubleLeftIcon } from '@heroicons/vue/24/solid';

// Menu master list
const allMenus = [
  {
    name: 'Dasbor',
    route: '/',
    icon: HomeIcon,
    plans: ['basic', 'pro', 'enterprise'],
    roles: ['owner', 'admin', 'manager', 'staff']
  },
  {
    name: 'Kasir (POS)',
    route: '/transaksi',
    icon: ShoppingCartIcon,
    plans: ['basic', 'pro', 'enterprise'],
    roles: ['owner', 'admin', 'manager', 'staff']
  },
  {
    name: 'Produk',
    route: '/produk',
    icon: ArchiveBoxIcon,
    plans: ['basic', 'pro', 'enterprise'],
    roles: ['owner', 'admin', 'manager']
  },
  {
    name: 'Stok',
    route: '/stok',
    icon: CubeIcon,
    plans: ['basic', 'pro', 'enterprise'],
    roles: ['owner', 'admin', 'manager']
  },
  {
    name: 'Biaya',
    route: '/biaya',
    icon: BuildingStorefrontIcon,
    plans: ['pro', 'enterprise'],
    roles: ['owner', 'admin', 'manager']
  },
  {
    name: 'Kategori Biaya',
    route: '/kategori-biaya',
    icon: TagIcon,
    plans: ['pro', 'enterprise'],
    roles: ['owner', 'admin', 'manager']
  },
  {
    name: 'Pelanggan',
    route: '/pelanggan',
    icon: UserGroupIcon,
    plans: ['pro', 'enterprise'],
    roles: ['owner', 'admin', 'manager']
  },
  {
    name: 'Laporan',
    route: '/laporan',
    icon: ChartPieIcon,
    plans: ['basic', 'pro', 'enterprise'],
    roles: ['owner', 'admin']
  },
  {
    name: 'Pegawai',
    route: '/pegawai',
    icon: UsersIcon,
    plans: ['pro', 'enterprise'],
    roles: ['owner', 'admin']
  },
  {
    name: 'Absensi',
    route: '/absensi',
    icon: ClockIcon,
    plans: ['pro', 'enterprise'],
    roles: ['owner', 'admin', 'manager']
  },
  {
    name: 'Pengaturan',
    route: '/pengaturan',
    icon: Cog6ToothIcon,
    plans: ['basic', 'pro', 'enterprise'],
    roles: ['owner']
  }
];

export function useSidebarMenu(plan, role) {
  // plan: 'basic' | 'pro' | 'enterprise'
  // role: 'owner' | 'admin' | 'manager' | 'staff'
  if (!plan || !role) return [];
  return allMenus.filter(menu => menu.plans.includes(plan) && menu.roles.includes(role));
}
