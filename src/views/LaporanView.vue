<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';
import { ArrowPathIcon } from '@heroicons/vue/24/solid';

const userStore = useUserStore();
const loading = ref(true);
const salesData = ref([]);

// State untuk filter tanggal, defaultnya bulan ini
const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);

// Fungsi utama untuk mengambil data laporan
async function fetchSalesReport() {
  if (!userStore.organization?.id || !startDate.value || !endDate.value) return;
  
  loading.value = true;
  try {
    // Tambahkan jam 23:59:59 ke tanggal akhir agar mencakup semua transaksi di hari itu
    const endOfDay = `${endDate.value}T23:59:59`;

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('organization_id', userStore.organization.id)
      .gte('created_at', startDate.value)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false });

    if (error) throw error;
    salesData.value = data;
  } catch (error) {
    userStore.showNotification(`Error mengambil laporan: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
}

// --- Computed Properties untuk Statistik ---
const summary = computed(() => {
  if (salesData.value.length === 0) {
    return { totalOmzet: 0, totalProfit: 0, transactionCount: 0 };
  }
  
  const totalOmzet = salesData.value.reduce((sum, sale) => sum + sale.total, 0);
  const transactionCount = salesData.value.length;
  
  // Kalkulasi profit membutuhkan harga modal dari 'items'
  const totalCost = salesData.value.reduce((sum, sale) => {
    const itemsCost = sale.items.reduce((itemSum, item) => itemSum + ((item.cost_price || 0) * item.quantity), 0);
    return sum + itemsCost;
  }, 0);
  
  const totalProfit = totalOmzet - totalCost;
  
  return { totalOmzet, totalProfit, transactionCount };
});

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
}

// --- Lifecycle Hooks ---
onMounted(() => { if (userStore.isReady) fetchSalesReport(); });
watch(() => userStore.isReady, (ready) => { if (ready) fetchSalesReport(); });
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">Laporan Penjualan</h1>
        <p class="text-base-content/70">Analisis performa penjualan Anda berdasarkan periode.</p>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body flex-col sm:flex-row items-center gap-4">
        <div class="form-control">
          <label class="label pb-1"><span class="label-text text-xs">Dari Tanggal</span></label>
          <input type="date" v-model="startDate" class="input input-bordered input-sm" />
        </div>
        <div class="form-control">
          <label class="label pb-1"><span class="label-text text-xs">Sampai Tanggal</span></label>
          <input type="date" v-model="endDate" class="input input-bordered input-sm" />
        </div>
        <div class="form-control mt-auto">
          <button @click="fetchSalesReport" class="btn btn-primary btn-sm" :disabled="loading">
            <ArrowPathIcon v-if="!loading" class="h-5 w-5"/>
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>

    <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
      <div class="stat">
        <div class="stat-title">Total Omzet</div>
        <div class="stat-value text-success">{{ formatRupiah(summary.totalOmzet) }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Total Profit</div>
        <div class="stat-value text-info">{{ formatRupiah(summary.totalProfit) }}</div>
        <div class="stat-desc">Berdasarkan harga modal</div>
      </div>
      <div class="stat">
        <div class="stat-title">Jumlah Transaksi</div>
        <div class="stat-value">{{ summary.transactionCount }}</div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Rincian Transaksi</h2>
        <div v-if="loading" class="text-center p-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="table table-sm w-full">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>ID Struk</th>
                <th>Pelanggan</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in salesData" :key="sale.id" class="hover">
                <td>{{ new Date(sale.created_at).toLocaleString('id-ID') }}</td>
                <td>#{{ sale.id }}</td>
                <td>{{ sale.customer_name || '-' }}</td>
                <td class="text-right font-medium">{{ formatRupiah(sale.total) }}</td>
              </tr>
              <tr v-if="salesData.length === 0">
                <td colspan="4" class="text-center py-4">Tidak ada data penjualan pada periode ini.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>