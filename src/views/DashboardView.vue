<script setup>
// --- Impor dari Library ---
import { ref, onMounted, computed, watch } from "vue";
import { useUserStore } from "@/stores/userStore";
import SalesChart from '@/components/SalesChart.vue';

// --- State Management ---
const userStore = useUserStore();
const loading = ref(true);
const message = ref("");
const allTransactions = ref([]);
const businessProfile = ref(null);
const salesDataLast7Days = ref([]);
const salesWithItems = ref([]); // State baru untuk menampung data penjualan detail

// --- Computed Properties ---

const totalIncome = computed(() => 
  allTransactions.value
    .filter(tx => tx.category === "Penjualan")
    .reduce((sum, tx) => sum + tx.amount, 0)
);

const totalExpense = computed(() => 
  allTransactions.value
    .filter(tx => tx.category === "Biaya Operasional")
    .reduce((sum, tx) => sum + tx.amount, 0)
);

const finalBalance = computed(() => totalIncome.value - totalExpense.value);

const bepInUnits = computed(() => {
  if (!businessProfile.value || !businessProfile.value.avg_selling_price || !businessProfile.value.avg_variable_cost || (businessProfile.value.avg_selling_price - businessProfile.value.avg_variable_cost <= 0)) return 0;
  const fixedCostsForBEP = businessProfile.value.fixed_costs || 0;
  const result = fixedCostsForBEP / (businessProfile.value.avg_selling_price - businessProfile.value.avg_variable_cost);
  return Math.ceil(result);
});

const bepInRupiah = computed(() => {
  if (!businessProfile.value || !businessProfile.value.avg_selling_price || businessProfile.value.avg_selling_price <= 0) return 0;
  const fixedCostsForBEP = businessProfile.value.fixed_costs || 0;
  const contributionMarginRatio = 1 - (businessProfile.value.avg_variable_cost || 0) / businessProfile.value.avg_selling_price;
  if (contributionMarginRatio <= 0) return 0;
  return fixedCostsForBEP / contributionMarginRatio;
});

const monthlyIncome = computed(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return allTransactions.value
        .filter(tx => 
            tx.category === "Penjualan" && 
            new Date(tx.created_at) >= startOfMonth
        )
        .reduce((sum, tx) => sum + tx.amount, 0);
});

const bepProgressPercentage = computed(() => {
    if (!bepInRupiah.value || bepInRupiah.value === 0) return 0;
    const percentage = (monthlyIncome.value / bepInRupiah.value) * 100;
    return Math.min(percentage, 100);
});

const bepEstimationDays = computed(() => {
    if (!bepInRupiah.value || bepInRupiah.value <= 0) return 'Data BEP belum lengkap';
    if (monthlyIncome.value >= bepInRupiah.value) return 'Target BEP Bulan Ini Tercapai!';
    if (monthlyIncome.value <= 0) return 'Belum ada penjualan bulan ini';
    
    const now = new Date();
    const currentDay = now.getDate();
    const avgDailySales = monthlyIncome.value / currentDay;
    if (avgDailySales <= 0) return 'Menunggu penjualan...';

    const remainingBEP = bepInRupiah.value - monthlyIncome.value;
    const daysNeeded = Math.ceil(remainingBEP / avgDailySales);

    return `Estimasi ${daysNeeded} hari lagi`;
});

const chartData = computed(() => {
  if (!salesDataLast7Days.value || salesDataLast7Days.value.length === 0) return null;
  const labels = salesDataLast7Days.value.map(item => new Date(item.sale_day).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
  const data = salesDataLast7Days.value.map(item => item.total_amount);
  return {
    labels: labels,
    datasets: [{
      label: 'Penjualan',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2, fill: true, data: data, tension: 0.3
    }]
  };
});

// Kalkulasi Top 3 Produk yang sudah diperbaiki
const topSellingProducts = computed(() => {
  if (salesWithItems.value.length === 0) return [];

  const productQuantities = {};

  salesWithItems.value.forEach(sale => {
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach(item => {
        if(item.name && item.quantity) {
           productQuantities[item.name] = (productQuantities[item.name] || 0) + item.quantity;
        }
      });
    }
  });

  return Object.entries(productQuantities)
    .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
    .slice(0, 3)
    .map(([name, quantity]) => ({ name, quantity }));
});

// --- Fungsi Logika Pengambilan Data ---

async function fetchAllDashboardData() {
  if (!userStore.organization?.id) { loading.value = false; return; }
  loading.value = true;
  try {
    await Promise.all([
      getAllTransactions(), 
      getSalesWithItems(),
      fetchSalesDataForChart()
      // getBusinessProfile(),
    ]);
  } catch (error) {
    console.error("Terjadi error saat mengambil data dashboard:", error);
    message.value = "Gagal memuat data dashboard.";
  } finally {
    loading.value = false;
  }
}

async function getAllTransactions() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transactions`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Mapping agar selalu ada field created_at untuk kebutuhan frontend
    allTransactions.value = data.map(tx => ({
      ...tx,
      created_at: tx.created_at || tx.date // fallback ke date jika created_at tidak ada
    }));
  } catch (error) {
    throw error;
  }
}

// Fungsi baru untuk mengambil data dari tabel 'sales'
async function getSalesWithItems() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter data bulan ini di frontend untuk sementara
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const filteredData = data.filter(sale => 
      new Date(sale.created_at) >= startOfMonth
    );
    
    // Mapping agar selalu ada field created_at
    salesWithItems.value = filteredData.map(sale => ({
      ...sale,
      created_at: sale.created_at || sale.date
    }));
  } catch (error) {
    throw error;
  }
}

// TODO: Migrasi setelah endpoint ready
async function getBusinessProfile() {
  // Sementara set null agar tidak error
  businessProfile.value = null;
  
  // Original Supabase code (commented):
  // const { data, error } = await supabase.from("business_profiles").select("*").eq('organization_id', userStore.organization.id).single();
  // if (error && error.code !== "PGRST116") throw error;
  // if (data) businessProfile.value = data;
}


// Ambil data penjualan 7 hari terakhir dari backend
async function fetchSalesDataForChart() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard`);
    if (!response.ok) throw new Error('Gagal mengambil data dashboard');
    const data = await response.json();
    // Mapping agar selalu ada field sale_day
    salesDataLast7Days.value = (data.sales_last_7_days || []).map(item => ({
      ...item,
      sale_day: item.sale_day || item.date
    }));
  } catch (error) {
    salesDataLast7Days.value = [];
  }
}

// --- Lifecycle Hooks ---
onMounted(fetchAllDashboardData);

watch(() => userStore.isReady, (ready) => {
  if(ready && allTransactions.value.length === 0) {
    fetchAllDashboardData();
  }
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