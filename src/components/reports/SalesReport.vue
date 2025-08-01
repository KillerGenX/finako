<template>
    <div class="space-y-6 sm:space-y-8">
      <!-- Header Panel Laporan - Mobile Optimized -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h3 class="text-lg sm:text-xl font-bold text-gray-800">Laporan Penjualan</h3>
        <button 
          @click="handleExport" 
          class="btn btn-outline border-gray-300 btn-sm w-full sm:w-auto"
          :disabled="isLoading || (!summary && topProducts.length === 0)"
        >
          <span v-if="isExporting" class="loading loading-spinner loading-xs"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Ekspor ke Excel
        </button>
      </div>
  
      <!-- Tampilan Loading -->
      <div v-if="isLoading" class="text-center py-20">
        <span class="loading loading-spinner loading-lg text-teal-600"></span>
        <p class="mt-4 text-gray-600">Menghitung data penjualan...</p>
      </div>
  
      <!-- Tampilan Error -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
        <p class="text-sm text-red-700">Error: {{ error }}</p>
      </div>
  
      <!-- Konten Utama Laporan Penjualan -->
      <div v-else-if="summary" class="space-y-8">
        
        <!-- Kartu KPI Mobile Optimized -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div class="bg-white shadow-lg rounded-lg border-l-4 border-teal-500 flex items-center p-3 sm:p-4">
                <div class="bg-teal-100 rounded-full p-2 sm:p-3 mr-3 flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs sm:text-sm text-gray-500 font-medium truncate">Omzet Kotor</p>
                  <p class="text-lg sm:text-xl xl:text-2xl font-bold text-gray-800 truncate">{{ formatCurrency(summary.total_revenue) }}</p>
                </div>
            </div>
            <div class="bg-white shadow-lg rounded-lg border-l-4 border-green-500 flex items-center p-3 sm:p-4">
                <div class="bg-green-100 rounded-full p-2 sm:p-3 mr-3 flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs sm:text-sm text-gray-500 font-medium truncate">Laba Kotor</p>
                  <p class="text-lg sm:text-xl xl:text-2xl font-bold text-gray-800 truncate">{{ formatCurrency(summary.total_profit) }}</p>
                </div>
            </div>
            <div class="bg-white shadow-lg rounded-lg border-l-4 border-blue-500 flex items-center p-3 sm:p-4">
                <div class="bg-blue-100 rounded-full p-2 sm:p-3 mr-3 flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs sm:text-sm text-gray-500 font-medium truncate">Jml. Transaksi</p>
                  <p class="text-lg sm:text-xl xl:text-2xl font-bold text-gray-800">{{ summary.transaction_count }}</p>
                </div>
            </div>
            <div class="bg-white shadow-lg rounded-lg border-l-4 border-purple-500 flex items-center p-3 sm:p-4">
                <div class="bg-purple-100 rounded-full p-2 sm:p-3 mr-3 flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs sm:text-sm text-gray-500 font-medium truncate">Produk Terjual</p>
                  <p class="text-lg sm:text-xl xl:text-2xl font-bold text-gray-800">{{ summary.total_items_sold }} pcs</p>
                </div>
            </div>
        </div>

        <!-- Layout Mobile Optimized: Chart & Top Products -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            <!-- Produk Terlaris - Mobile First -->
            <div class="xl:col-span-1 order-2 xl:order-1">
                <h4 class="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Produk Terlaris</h4>
                
                <!-- Mobile: Card Layout -->
                <div class="block sm:hidden space-y-2">
                  <div v-if="!topProducts || topProducts.length === 0" class="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                    Tidak ada data produk
                  </div>
                  <div v-for="(product, index) in topProducts.slice(0, 5)" :key="product.product_id" 
                       class="bg-white rounded-lg border p-3 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="bg-teal-100 text-teal-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {{ index + 1 }}
                      </div>
                      <span class="font-medium text-gray-800 text-sm truncate">{{ product.product_name }}</span>
                    </div>
                    <span class="font-mono text-sm font-bold text-gray-600">{{ product.quantity_sold }}</span>
                  </div>
                </div>
                
                <!-- Desktop: Table Layout -->
                <div class="hidden sm:block overflow-x-auto bg-white rounded-lg border">
                  <table class="table-auto w-full text-sm">
                    <thead class="bg-gray-50 text-left text-gray-600">
                      <tr>
                        <th class="px-3 sm:px-4 py-2 font-medium">Produk</th>
                        <th class="px-3 sm:px-4 py-2 font-medium text-right">Terjual</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y">
                      <tr v-if="!topProducts || topProducts.length === 0">
                        <td colspan="2" class="p-4 text-center text-gray-500">Tidak ada data.</td>
                      </tr>
                      <tr v-for="product in topProducts.slice(0, 10)" :key="product.product_id">
                        <td class="px-3 sm:px-4 py-2 font-medium text-gray-800">{{ product.product_name }}</td>
                        <td class="px-3 sm:px-4 py-2 text-right font-mono">{{ product.quantity_sold }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            </div>
            
            <!-- Grafik - Mobile Responsive -->
            <div class="xl:col-span-2 order-1 xl:order-2">
                <h4 class="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Grafik Tren Penjualan</h4>
                <div class="p-3 sm:p-4 bg-white rounded-lg border">
                    <div class="h-64 sm:h-72 md:h-80">
                        <SalesChart v-if="!isLoading && chartData.labels.length > 0" :chart-data="chartData" :chart-options="chartOptions" />
                        <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm sm:text-base">
                          Data tidak cukup untuk menampilkan grafik.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Daftar Transaksi - Mobile Optimized -->
        <div>
            <h4 class="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Daftar Transaksi</h4>
            
            <!-- Mobile: Card Layout -->
            <div class="block lg:hidden space-y-3">
              <div v-if="!transactionList || transactionList.length === 0" class="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                Tidak ada transaksi dalam periode ini
              </div>
              <div v-for="tx in paginatedTransactions" :key="tx.id" 
                   class="bg-white rounded-lg border p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="text-xs text-gray-500">
                    {{ new Date(tx.created_at).toLocaleString('id-ID', {day: '2-digit', month: 'short', hour:'2-digit', minute:'2-digit'}) }}
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-gray-900 font-mono">{{ formatCurrency(tx.final_amount) }}</div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm font-medium text-gray-800">{{ tx.outlet_name }}</div>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                      {{ tx.payment_method }}
                    </span>
                  </div>
                  <button class="btn btn-xs btn-outline border-gray-300 flex-shrink-0" @click="showReceipt(tx)">
                    Lihat Struk
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Desktop: Table Layout -->
            <div class="hidden lg:block overflow-x-auto bg-white rounded-lg border">
              <table class="table-auto w-full text-sm">
                <thead class="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th class="px-4 sm:px-6 py-3 font-medium">Waktu</th>
                    <th class="px-4 sm:px-6 py-3 font-medium">Outlet</th>
                    <th class="px-4 sm:px-6 py-3 font-medium">Total</th>
                    <th class="px-4 sm:px-6 py-3 font-medium">Metode Bayar</th>
                    <th class="px-4 sm:px-6 py-3 font-medium text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-if="!transactionList || transactionList.length === 0">
                    <td colspan="5" class="p-10 text-center text-gray-500">Tidak ada transaksi.</td>
                  </tr>
                  <tr v-for="tx in paginatedTransactions" :key="tx.id">
                    <td class="px-4 sm:px-6 py-4">{{ new Date(tx.created_at).toLocaleString('id-ID', {day: '2-digit', month: 'short', hour:'2-digit', minute:'2-digit'}) }}</td>
                    <td class="px-4 sm:px-6 py-4">{{ tx.outlet_name }}</td>
                    <td class="px-4 sm:px-6 py-4 font-mono">{{ formatCurrency(tx.final_amount) }}</td>
                    <td class="px-4 sm:px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ tx.payment_method }}
                      </span>
                    </td>
                    <td class="px-4 sm:px-6 py-4 text-center">
                      <button class="btn btn-xs btn-outline border-gray-300" @click="showReceipt(tx)">Lihat Struk</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Paginasi Mobile Optimized -->
            <div class="flex justify-center mt-4" v-if="totalPages > 1">
                <div class="flex items-center gap-2">
                  <button class="btn btn-sm btn-outline border-gray-300" @click="currentPage--" :disabled="currentPage === 1">
                    <span class="hidden sm:inline">« Prev</span>
                    <span class="sm:hidden">«</span>
                  </button>
                  <span class="font-medium text-sm px-2">{{ currentPage }}/{{ totalPages }}</span>
                  <button class="btn btn-sm btn-outline border-gray-300" @click="currentPage++" :disabled="currentPage === totalPages">
                    <span class="hidden sm:inline">Next »</span>
                    <span class="sm:hidden">»</span>
                  </button>
                </div>
            </div>
        </div>

        <!-- Modal Struk -->
        <dialog class="modal" :class="{'modal-open': isReceiptModalOpen}">
          <div class="modal-box max-w-sm">
            <button @click="closeReceiptModal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <h3 class="font-bold text-lg mb-4">Detail Struk Transaksi</h3>
            <ThermalReceipt v-if="selectedTransaction" :transaction="selectedTransaction" />
            <div class="modal-action mt-6"><button class="btn" @click="closeReceiptModal">Tutup</button></div>
          </div>
          <form method="dialog" class="modal-backdrop"><button @click="closeReceiptModal">close</button></form>
        </dialog>
      </div>
      
      <!-- Tampilan jika tidak ada data -->
      <div v-else class="text-center p-12 bg-white rounded-lg border">
          <p class="font-semibold text-gray-600">Tidak Ada Data</p>
          <p class="text-sm text-gray-500">Tidak ada transaksi penjualan untuk filter yang Anda pilih.</p>
      </div>
    </div>
</template>
  
<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, watch, computed } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import SalesChart from '@/components/SalesChart.vue';
import { useExporter } from '@/composables/useExporter';
import ThermalReceipt from '@/components/receipts/ThermalReceipt.vue';
import * as XLSX from 'xlsx-js-style';

const props = defineProps({
  dateRange: { type: Array, required: true },
  outletId: { type: String, default: null },
});

const reportStore = useReportStore();
const { exportSalesReportExcel } = useExporter();
const isExporting = ref(false);

const isLoading = computed(() => reportStore.salesReport.loading);
const error = computed(() => reportStore.salesReport.error);
const summary = computed(() => reportStore.salesReport.summary);
const topProducts = computed(() => reportStore.salesReport.top_products);
const dailySalesTrend = computed(() => reportStore.salesReport.daily_sales_trend);
const transactionList = computed(() => reportStore.salesReport.transaction_list);

const chartData = computed(() => {
  if (!dailySalesTrend.value || dailySalesTrend.value.length === 0) return { labels: [], datasets: [] };
  const labels = dailySalesTrend.value.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
  const data = dailySalesTrend.value.map(d => d.total_revenue);
  return {
    labels,
    datasets: [{
      label: 'Omzet Penjualan',
      backgroundColor: 'rgba(20, 184, 166, 0.2)',
      borderColor: '#14B8A6',
      tension: 0.1,
      fill: true,
      data: data,
    }],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label || ''}: ${formatCurrency(ctx.parsed.y)}` } } },
  scales: { y: { beginAtZero: true, ticks: { callback: (val) => val >= 1e6 ? `${val / 1e6}Jt` : (val >= 1e3 ? `${val / 1e3}rb` : val) } } },
}));

const isReceiptModalOpen = ref(false);
const selectedTransaction = ref(null);

const showReceipt = (transaction) => {
  selectedTransaction.value = transaction;
  isReceiptModalOpen.value = true;
};

const closeReceiptModal = () => {
  isReceiptModalOpen.value = false;
  selectedTransaction.value = null;
};

const runReport = () => {
  if (Array.isArray(props.dateRange) && props.dateRange.length === 2) {
    reportStore.fetchSalesReport({
      startDate: props.dateRange[0],
      endDate: props.dateRange[1],
      outletId: props.outletId,
    });
  }
};

const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = computed(() => transactionList.value ? Math.ceil(transactionList.value.length / pageSize.value) : 1);
const paginatedTransactions = computed(() => {
  if (!transactionList.value) return [];
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return transactionList.value.slice(start, end);
});

watch(transactionList, () => { currentPage.value = 1; });
watch(() => [props.dateRange, props.outletId], runReport, { immediate: true, deep: true });

const handleExport = () => {
  if (isExporting.value || !summary.value) return;
  isExporting.value = true;
  try {
    const reportTitle = "Laporan Penjualan";
    const startDateStr = new Date(props.dateRange[0]).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const endDateStr = new Date(props.dateRange[1]).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const dateRangeStr = `Periode: ${startDateStr} - ${endDateStr}`;
    const fileName = `laporan-penjualan-${new Date(props.dateRange[0]).toISOString().split('T')[0]}_sd_${new Date(props.dateRange[1]).toISOString().split('T')[0]}.xlsx`;

    // Format data untuk ekspor sales report khusus
    const salesData = {
      summary: summary.value,
      topProducts: topProducts.value,
      transactions: transactionList.value
    };

    exportSalesReportExcel(salesData, reportTitle, dateRangeStr, fileName);
  } catch(e) { 
    console.error("Gagal ekspor:", e);
    alert("Gagal mengekspor data. Silakan coba lagi.");
  }
  finally { isExporting.value = false; }
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};
</script>
