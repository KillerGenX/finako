<script setup>

import { ref, computed, onMounted, watch } from 'vue';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';
import SalesChart from '@/components/SalesChart.vue';

const userStore = useUserStore();
const loading = ref(true);
const message = ref("");

const allTransactions = ref([]);
const salesDataLast7Days = ref([]);
const salesWithItems = ref([]); // Data penjualan + item bulan ini
const businessInfo = ref(null);

// --- Computed Properties for Dashboard ---
const totalIncome = computed(() => {
  return allTransactions.value
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
});

const totalExpense = computed(() => {
  return allTransactions.value
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
});

const finalBalance = computed(() => {
  return totalIncome.value - totalExpense.value;
});

// For BEP analysis, use businessInfo as businessProfile
const businessProfile = computed(() => businessInfo.value);

// Chart data for SalesChart
const chartData = computed(() => {
  if (!salesDataLast7Days.value || salesDataLast7Days.value.length === 0) return null;
  return {
    labels: salesDataLast7Days.value.map(item => item.date),
    datasets: [
      {
        label: 'Penjualan',
        data: salesDataLast7Days.value.map(item => item.total_sales),
        backgroundColor: '#4ade80',
        borderColor: '#22c55e',
        fill: true,
        tension: 0.4,
      },
    ],
  };
});

// Dummy BEP calculation (replace with real logic if needed)
const bepInUnits = computed(() => {
  const fixedCost = businessProfile.value?.fixed_cost || 0;
  const price = businessProfile.value?.average_price || 1;
  const variableCost = businessProfile.value?.variable_cost || 0;
  if (price - variableCost === 0) return 0;
  return Math.ceil(fixedCost / (price - variableCost));
});
const bepInRupiah = computed(() => {
  return bepInUnits.value * (businessProfile.value?.average_price || 0);
});
const bepProgressPercentage = computed(() => {
  if (!bepInRupiah.value) return 0;
  // Total penjualan bulan ini
  const monthIncome = salesWithItems.value.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  return Math.min(100, (monthIncome / bepInRupiah.value) * 100);
});
const bepEstimationDays = computed(() => {
  // Estimasi hari tercapai BEP bulan ini
  if (!bepInRupiah.value) return '-';
  const monthIncome = salesWithItems.value.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const days = new Date().getDate();
  if (monthIncome === 0 || days === 0) return '-';
  const daily = monthIncome / days;
  if (daily === 0) return '-';
  const remaining = bepInRupiah.value - monthIncome;
  if (remaining <= 0) return 'Target tercapai!';
  const est = Math.ceil(remaining / daily);
  return `Estimasi ${est} hari lagi`;
});

// Ambil data penjualan bulan ini beserta item dan nama produk dari Supabase
async function fetchSalesWithItems() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Query transactions bulan ini milik bisnis aktif
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*, product:product_id(name))')
      .eq('business_id', userStore.organization.id)
      .gte('created_at', startOfMonth.toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    // Mapping agar struktur konsisten
    return (transactions || []).map(tx => ({
      ...tx,
      items: (tx.transaction_items || []).map(item => ({
        ...item,
        product_name: item.product?.name || ''
      }))
    }));
  } catch (err) {
    message.value = err.message || 'Gagal memuat data penjualan.';
    return [];
  }
}

// --- Data Fetching ---
async function fetchDashboardData() {
  loading.value = true;
  try {
    // Fetch transactions (Penjualan & Biaya)
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', userStore.organization.id)
      .order('created_at', { ascending: false });
    if (txError) throw txError;
    allTransactions.value = transactions || [];

    // Fetch business info (tax, service charge, dsb)
    const { data: biz, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', userStore.organization.id)
      .single();
    if (bizError) throw bizError;
    businessInfo.value = biz;

    // Fetch sales with items (bulan ini)
    salesWithItems.value = await fetchSalesWithItems();

    // Fetch sales data for chart (7 hari terakhir)
    const { data: sales7, error: sales7Error } = await supabase
      .rpc('get_sales_last_7_days', { business_id: userStore.organization.id });
    salesDataLast7Days.value = sales7Error ? [] : (sales7 || []);
  } catch (error) {
    message.value = error.message || 'Gagal memuat data dashboard.';
  } finally {
    loading.value = false;
  }
}
// Top 3 produk terlaris bulan ini dari salesWithItems
const topSellingProducts = computed(() => {
  if (!salesWithItems.value.length) return [];
  const productMap = {};
  salesWithItems.value.forEach(tx => {
    (tx.items || []).forEach(item => {
      if (!item.product_name) return;
      productMap[item.product_name] = (productMap[item.product_name] || 0) + (item.quantity || 0);
    });
  });
  return Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, quantity]) => ({ name, quantity }));
});

onMounted(() => {
  if (userStore.organization?.id) fetchDashboardData();
});

watch(() => userStore.isReady, (ready) => {
  if (ready && userStore.organization?.id) fetchDashboardData();
});

</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
    
    <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
      <div class="stat">
        <div class="stat-title">Total Penjualan</div>
        <div class="stat-value text-success">{{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalIncome) }}</div>
        <div class="stat-desc">Dari seluruh riwayat</div>
      </div>
      <div class="stat">
        <div class="stat-title">Total Biaya Operasional</div>
        <div class="stat-value text-error">{{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalExpense) }}</div>
        <div class="stat-desc">Dari seluruh riwayat</div>
      </div>
      <div class="stat">
        <div class="stat-title">Profit / Rugi</div>
        <div class="stat-value">{{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(finalBalance) }}</div>
        <div class="stat-desc">(Penjualan - Biaya)</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div class="lg:col-span-2 space-y-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Tren Penjualan 7 Hari Terakhir</h2>
            <div class="h-80 mt-4">
              <div v-if="loading" class="flex justify-center items-center h-full"><span class="loading loading-spinner loading-lg"></span></div>
              <SalesChart v-else-if="chartData" :chart-data="chartData" />
              <div v-else class="flex justify-center items-center h-full"><p>Data penjualan tidak cukup untuk menampilkan grafik.</p></div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Aktivitas Keuangan Terbaru</h2>
             <div v-if="loading && allTransactions.length === 0" class="text-center p-4"><span class="loading loading-spinner"></span></div>
            <div v-else-if="allTransactions.length === 0" class="text-center p-4 text-gray-500">Belum ada aktivitas.</div>
            <div v-else class="overflow-x-auto">
              <table class="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Deskripsi</th>
                    <th>Jumlah</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tx in allTransactions.slice(0, 5)" :key="tx.id" class="hover">
                    <td>{{ tx.description }}</td>
                    <td :class="tx.type === 'income' ? 'text-success' : 'text-error'">
                      {{ tx.type === "income" ? "+" : "-" }} {{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(tx.amount) }}
                    </td>
                    <td>{{ new Date(tx.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' }) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Top 3 Produk Terlaris</h2>
            <p class="text-sm opacity-70">Bulan Ini</p>
            <div v-if="loading" class="skeleton h-24 w-full"></div>
            <ul v-else-if="topSellingProducts.length > 0" class="space-y-2 mt-2">
              <li v-for="(product, index) in topSellingProducts" :key="product.name" class="flex justify-between items-center text-sm">
                <span>{{ index + 1 }}. {{ product.name }}</span>
                <span class="font-bold badge badge-neutral">{{ product.quantity }} terjual</span>
              </li>
            </ul>
            <div v-else class="text-center text-sm text-gray-500 py-4">Belum ada penjualan bulan ini.</div>
          </div>
        </div>
        
        <div v-if="businessProfile" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Analisis Titik Impas (BEP)</h2>
            <p class="text-sm opacity-70 mb-4">Target bulanan agar bisnis Anda balik modal.</p>
            <div class="stats stats-vertical lg:stats-horizontal shadow w-full mb-4">
              <div class="stat px-2"><div class="stat-title text-xs">BEP (Unit)</div><div class="stat-value text-base">{{ bepInUnits.toLocaleString("id-ID") }}</div></div>
              <div class="stat px-2"><div class="stat-title text-xs">BEP (Rupiah)</div><div class="stat-value text-base">{{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(bepInRupiah) }}</div></div>
            </div>
            <div>
              <h3 class="font-semibold text-sm">Progress Bulan Ini</h3>
              <div class="flex items-center gap-4 mt-2">
                <progress class="progress progress-primary w-full" :value="bepProgressPercentage" max="100"></progress>
                <span class="font-bold text-primary text-sm">{{ bepProgressPercentage.toFixed(0) }}%</span>
              </div>
              <div class="text-right text-xs mt-1 opacity-80"><span>{{ bepEstimationDays }}</span></div>
            </div>
          </div>
        </div>
        <div v-else class="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span>Isi data di menu <router-link to="/pengaturan" class="font-bold underline">Pengaturan</router-link> untuk melihat analisis BEP.</span>
        </div>
      </div>

    </div>
  </div>
</template>