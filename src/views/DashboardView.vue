<template>
  <div class="bg-gray-50 min-h-screen p-4 sm:p-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Halo, {{ userStore.userFullName }}!</h1>
        <p v-if="userStore.activeRole === 'Owner'" class="text-gray-600">Ringkasan aktivitas bisnis Anda hari ini.</p>
        <p v-else class="text-gray-600">Selamat bekerja, semoga harimu menyenangkan.</p>
      </div>
      <div v-if="userStore.accessibleOutlets.length > 0" class="w-full md:w-64">
        <label for="outlet-select" class="text-sm font-medium text-gray-700">Outlet Aktif</label>
        <select 
          id="outlet-select"
          v-if="userStore.accessibleOutlets.length > 1"
          :value="userStore.activeOutletId"
          @change="handleOutletChange"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm"
          :disabled="!userStore.isReady"
        >
          <option v-for="outlet in userStore.accessibleOutlets" :key="outlet.id" :value="outlet.id">
            {{ outlet.name }}
          </option>
        </select>
        <div v-else class="mt-1 flex items-center w-full px-3 py-2 text-base border border-gray-200 bg-gray-100 text-gray-700 sm:text-sm rounded-md shadow-sm">
          {{ userStore.activeOutlet?.name }}
        </div>
      </div>
    </div>

    <!-- Loading / Error / Special States -->
    <div v-if="isLoading" class="text-center py-20">
      <span class="loading loading-spinner loading-lg text-teal-600"></span>
      <p class="mt-4 text-gray-600">Mengambil ringkasan data...</p>
    </div>
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">Gagal memuat data dasbor: {{ error }}</p>
        </div>
      </div>
    </div>
    <div v-else-if="(userStore.activeRole !== 'Owner' && userStore.accessibleOutlets.length === 0) || (userStore.activeRole === 'Owner' && userStore.accessibleOutlets.length === 0)" class="bg-white shadow-lg rounded-lg text-center p-8">
      <h2 class="text-xl font-semibold text-gray-800">{{ userStore.activeRole === 'Owner' ? 'Selamat Datang!' : 'Akun Anda Aktif!' }}</h2>
      <p class="mt-2 text-gray-600">{{ userStore.activeRole === 'Owner' ? 'Buat outlet pertama Anda untuk memulai.' : 'Hubungi pemilik bisnis untuk mendapatkan akses.' }}</p>
      <div v-if="userStore.activeRole === 'Owner'" class="mt-6">
        <router-link to="/pengaturan" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
          Ke Pengaturan
        </router-link>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else-if="dashboardData" class="space-y-6">
      
      <!-- Quick Actions for Employee -->
      <div v-if="userStore.activeRole !== 'Owner'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <router-link to="/transaksi" class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center gap-4 col-span-1 md:col-span-2">
            <div class="bg-teal-100 rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">Buka Kasir</h3>
              <p class="text-gray-500">Mulai buat transaksi baru</p>
            </div>
          </router-link>
          <div class="bg-white p-6 rounded-lg shadow-md flex items-center justify-center" :class="attendanceStore.currentStatus === 'CLOCKED_IN' ? 'border-green-400' : 'border-red-400'">
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500">Status Absensi</p>
              <p class="text-lg font-bold mt-1" :class="attendanceStore.currentStatus === 'CLOCKED_IN' ? 'text-green-600' : 'text-red-600'">
                {{ attendanceStore.currentStatus === 'CLOCKED_IN' ? 'SEDANG BEKERJA' : 'TIDAK BEKERJA' }}
              </p>
              <button @click="router.push('/absensi')" class="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-800">
                Lihat Absensi
              </button>
            </div>
          </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Card 1: Omzet -->
        <div v-if="userStore.activeRole === 'Owner'" class="bg-white shadow-lg rounded-lg border-l-4 border-teal-500 flex items-center p-5">
            <div class="bg-teal-100 rounded-full p-3 mr-4">
                <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Omzet Hari Ini</p>
                <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(dashboardData.daily_summary.total_revenue) }}</p>
            </div>
        </div>
        <!-- Card 2: Laba (Owner Only) -->
        <div v-if="userStore.activeRole === 'Owner'" class="bg-white shadow-lg rounded-lg border-l-4 border-green-500 flex items-center p-5">
            <div class="bg-green-100 rounded-full p-3 mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Laba Kotor Hari Ini</p>
                <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(dashboardData.daily_summary.total_profit) }}</p>
            </div>
        </div>
        <!-- Card 3: Transaksi -->
        <div class="bg-white shadow-lg rounded-lg border-l-4 border-blue-500 flex items-center p-5">
            <div class="bg-blue-100 rounded-full p-3 mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Transaksi Hari Ini</p>
                <p class="text-2xl font-bold text-gray-800">{{ dashboardData.daily_summary.transaction_count }}</p>
            </div>
        </div>
        <!-- Card 4: Rata-rata/Transaksi -->
        <div class="bg-white shadow-lg rounded-lg border-l-4 border-purple-500 flex items-center p-5">
            <div class="bg-purple-100 rounded-full p-3 mr-4">
                 <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Rata-rata/Transaksi</p>
                <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(dashboardData.daily_summary.avg_per_transaction) }}</p>
            </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Sales Chart (Owner) or Info -->
        <div class="lg:col-span-2">
            <div v-if="userStore.activeRole === 'Owner'" class="bg-white shadow-lg rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Grafik Penjualan 7 Hari Terakhir</h3>
                <div v-if="chartData.labels.length > 0" class="h-72">
                    <SalesChart :chartData="chartData" :chartOptions="chartOptions" />
                </div>
                <p v-else class="text-center h-72 flex items-center justify-center text-gray-500">
                    Data grafik belum cukup untuk ditampilkan.
                </p>
            </div>
             <div v-else class="bg-white shadow-lg rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Selamat Bekerja!</h3>
                <p class="text-gray-600">Fokus pada pelayanan terbaik untuk pelanggan. Lakukan transaksi melalui tombol "Buka Kasir" di atas dan pastikan Anda melakukan Clock-out sebelum mengakhiri jam kerja.</p>
            </div>
        </div>
        
        <!-- Right Column: Insights -->
        <div class="space-y-6">
            <div class="bg-white shadow-lg rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Produk Terlaris Hari Ini</h3>
                <div v-if="dashboardData.top_product_today" class="text-center">
                    <p class="text-xl font-bold text-teal-600">{{ dashboardData.top_product_today.name }}</p>
                    <p class="text-gray-500"><span class="font-bold">{{ dashboardData.top_product_today.quantity_sold }}</span> Terjual</p>
                </div>
                <p v-else class="text-center text-gray-500 py-4">Belum ada penjualan hari ini.</p>
            </div>
            <div v-if="userStore.activeRole === 'Owner'" class="bg-white shadow-lg rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Metode Pembayaran</h3>
                <ul v-if="dashboardData.payment_methods_today && dashboardData.payment_methods_today.length > 0" class="space-y-2">
                    <li v-for="pm in dashboardData.payment_methods_today" :key="pm.method" class="flex justify-between items-center">
                        <span class="font-medium text-gray-700">{{ pm.method }}</span>
                        <span class="font-semibold text-gray-500">{{ pm.count }}x</span>
                    </li>
                </ul>
                <p v-else class="text-center text-gray-500 py-4">Belum ada data pembayaran.</p>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import { supabase } from '@/supabase';
import SalesChart from '@/components/SalesChart.vue';
import { useAttendanceStore } from '@/stores/attendanceStore';
import { useRouter } from 'vue-router';

const userStore = useUserStoreRefactored();
const attendanceStore = useAttendanceStore();
const router = useRouter();

const dashboardData = ref(null);
const isLoading = ref(true);
const error = ref(null);

// ChartJS data and options, adapted for the new theme
const chartData = computed(() => {
  const emptyChart = { labels: [], datasets: [{ data: [] }] };
  if (!dashboardData.value || !dashboardData.value.sales_last_7_days) return emptyChart;
  
  const sortedData = [...dashboardData.value.sales_last_7_days].sort((a,b) => new Date(a.date) - new Date(b.date));
  const labels = sortedData.map(d => new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
  const data = sortedData.map(d => d.total);

  return {
    labels,
    datasets: [{
      label: 'Omzet Penjualan',
      backgroundColor: 'rgba(20, 184, 166, 0.2)', // Teal-500 with transparency
      borderColor: '#14B8A6', // Teal-500
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      data: data,
    }],
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#374151',
      bodyColor: '#374151',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      callbacks: {
        label: (context) => `Omzet: ${formatCurrency(context.parsed.y)}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#6b7280',
        callback: (value) => {
          if (value >= 1e6) return `${value / 1e6} Jt`;
          if (value >= 1e3) return `${value / 1e3} rb`;
          return value;
        }
      },
      grid: {
        drawBorder: false,
      }
    },
    x: {
        ticks: { color: '#6b7280' },
        grid: { display: false }
    }
  }
});

// Logic remains the same
onMounted(() => {
  if (userStore.isReady) {
    fetchInitialData();
  }
});

watch(() => userStore.isReady, (ready) => {
  if (ready && !dashboardData.value) {
    fetchInitialData();
  }
});

watch(() => userStore.activeOutletId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchDashboardData(newId);
  }
});

function fetchInitialData() {
  if (userStore.activeOutletId) {
    fetchDashboardData(userStore.activeOutletId);
  } else {
    // Handle case where there are no outlets yet
    isLoading.value = false;
  }
  if (userStore.activeRole !== 'Owner') {
    attendanceStore.fetchMyLastStatus();
  }
}

async function fetchDashboardData(outletId) {
  if (!outletId) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  error.value = null;

  try {
    const { data, error: rpcError } = await supabase.rpc('get_dashboard_raw_data', { p_outlet_id: outletId });
    if (rpcError) throw rpcError;
    dashboardData.value = processRawData(data);
  } catch (e) {
    console.error("Gagal mengambil data dasbor:", e.message);
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
}

function processRawData(rawData) {
    if (!rawData || !rawData.todays_transactions) {
        return {
            daily_summary: { total_revenue: 0, total_profit: 0, transaction_count: 0, avg_per_transaction: 0 },
            top_product_today: null,
            payment_methods_today: [],
            sales_last_7_days: rawData?.sales_last_7_days || []
        };
    }
    const { todays_transactions, sales_last_7_days } = rawData;
    let total_revenue = 0, total_cogs = 0;
    const payment_methods = {}, product_sales = {};

    todays_transactions.forEach(tx => {
        total_revenue += tx.final_amount;
        tx.items?.forEach(item => {
            total_cogs += item.quantity * (item.cost_price || 0);
            const key = item.product_name || 'Produk Dihapus';
            product_sales[key] = (product_sales[key] || 0) + item.quantity;
        });
        payment_methods[tx.payment_method] = (payment_methods[tx.payment_method] || 0) + 1;
    });

    const transaction_count = todays_transactions.length;
    return {
        daily_summary: {
            total_revenue,
            total_profit: total_revenue - total_cogs,
            transaction_count,
            avg_per_transaction: transaction_count > 0 ? total_revenue / transaction_count : 0
        },
        top_product_today: Object.entries(product_sales).map(([name, quantity_sold]) => ({ name, quantity_sold })).sort((a,b) => b.quantity_sold - a.quantity_sold)[0] || null,
        payment_methods_today: Object.entries(payment_methods).map(([method, count]) => ({ method, count })).sort((a, b) => b.count - a.count),
        sales_last_7_days: sales_last_7_days || []
    };
}

function handleOutletChange(event) {
    userStore.setActiveOutlet(event.target.value);
}

function formatCurrency(value) {
    if (typeof value !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}
</script>
