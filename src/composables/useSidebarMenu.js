import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';

// Impor ikon-ikon yang dibutuhkan
import {
  HomeIcon, Cog6ToothIcon, ShoppingCartIcon, BuildingStorefrontIcon,
  ArchiveBoxIcon, CubeIcon, ChartPieIcon, UsersIcon, ClockIcon,
  UserGroupIcon, TagIcon
} from '@heroicons/vue/24/outline';


// Daftar menu master tetap sama, tidak ada yang berubah di sini.
const allMenus = [
    { name: 'Dasbor', route: '/', icon: HomeIcon, plans: ['basic', 'pro', 'enterprise'], roles: ['owner', 'kasir', 'manager', 'staff'] },
    { name: 'Kasir (POS)', route: '/transaksi', icon: ShoppingCartIcon, plans: ['basic', 'pro', 'enterprise'], roles: ['owner', 'kasir', 'manager', 'staff'] },
    { name: 'Produk', route: '/produk', icon: ArchiveBoxIcon, plans: ['basic', 'pro', 'enterprise'], roles: ['owner', 'admin', 'manager'] },
    { name: 'Stok', route: '/stok', icon: CubeIcon, plans: ['basic', 'pro', 'enterprise'], roles: ['owner', 'admin', 'manager'] },
    { name: 'Biaya', route: '/biaya', icon: BuildingStorefrontIcon, plans: ['pro', 'enterprise'], roles: ['owner', 'admin', 'manager'] },
    { name: 'Kategori Biaya', route: '/kategori-biaya', icon: TagIcon, plans: ['pro', 'enterprise'], roles: ['owner', 'admin', 'manager'] },
    { name: 'Pelanggan', route: '/pelanggan', icon: UserGroupIcon, plans: ['pro', 'enterprise'], roles: ['owner', 'admin', 'manager'] },
    { name: 'Laporan', route: '/laporan', icon: ChartPieIcon, plans: ['basic', 'pro', 'enterprise'], roles: ['owner', 'admin'] },
    { name: 'Pegawai', route: '/pegawai', icon: UsersIcon, plans: ['pro', 'enterprise'], roles: ['owner', 'admin'] },
    { name: 'Absensi', route: '/absensi', icon: ClockIcon, plans: ['basic','pro', 'enterprise'], roles: ['owner', 'kasir', 'manager'] },
    { name: 'Pengaturan', route: '/pengaturan', icon: Cog6ToothIcon, plans: ['basic', 'pro', 'enterprise'], roles: ['owner'] }
];

// Composable baru kita sekarang tidak butuh parameter.
export function useSidebarMenu() {
    // 1. Ambil store yang benar.
    const userStore = useUserStoreRefactored();

    // 2. Gunakan storeToRefs agar kita bisa "mengawasi" perubahan di `activeRole` dan `currentSubscription`.
    const { activeRole, currentSubscription } = storeToRefs(userStore);

    // 3. Buat sebuah `computed` property.
    // Ini adalah KUNCINYA: `filteredMenu` akan secara OTOMATIS menghitung ulang dirinya sendiri
    // setiap kali `activeRole` atau `currentSubscription` di dalam store berubah.
    const filteredMenu = computed(() => {
        const role = activeRole.value?.toLowerCase() || '';
        const plan = currentSubscription.value?.plans?.name?.toLowerCase() || 'basic'; // Ambil dari data relasi, dengan fallback 'basic'
        
        if (!plan || !role) return []; // Jika belum ada data, kembalikan array kosong
        
        return allMenus.filter(menu => menu.plans.includes(plan) && menu.roles.includes(role));
    });

    // 4. Kembalikan menu yang sudah reaktif.
    return {
        filteredMenu
    };
}