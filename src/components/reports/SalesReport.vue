<template>
    <div>
      <!-- Header Panel Laporan -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h3 class="text-lg font-bold">Ringkasan Laporan Penjualan</h3>
        <button 
    @click="handleExport" 
    class="btn btn-outline btn-sm"
    :disabled="isLoading || (!summary && topProducts.length === 0)"
  >
    <span v-if="isExporting" class="loading loading-spinner loading-xs"></span>
    Ekspor ke Excel
  </button>
        <!-- Tombol Ekspor bisa kita tambahkan di sini nanti -->
      </div>
  
      <!-- Tampilan Loading -->
      <div v-if="isLoading" class="text-center py-20">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-4">Menghitung data penjualan...</p>
      </div>
  
      <!-- Tampilan Error -->
      <div v-else-if="error" class="alert alert-error">
        <span>Error: {{ error }}</span>
      </div>
  
      <!-- Konten Utama Laporan Penjualan -->
      <div v-else-if="summary" class="space-y-8">
        
        <!-- Kartu KPI (Key Performance Indicators) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat bg-base-200 rounded-lg shadow">
            <div class="stat-title">Omzet Kotor</div>
            <div class="stat-value text-primary">{{ formatCurrency(summary.total_revenue) }}</div>
            <div class="stat-desc">{{ summary.transaction_count }} transaksi</div>
          </div>
          <div class="stat bg-base-200 rounded-lg shadow">
            <div class="stat-title">Rata-rata/Transaksi</div>
            <div class="stat-value">{{ formatCurrency(summary.avg_per_transaction) }}</div>
            <div class="stat-desc">Dari {{ summary.transaction_count }} transaksi</div>
          </div>
          <div class="stat bg-base-200 rounded-lg shadow">
  <div class="stat-title">Laba Kotor</div>
  <!-- Tampilkan data dari summary, format sebagai mata uang -->
  <div class="stat-value text-accent">{{ formatCurrency(summary.total_profit) }}</div>
  <!-- (Opsional) Tampilkan persentase margin -->
  <div class="stat-desc">Margin: {{ profitMargin }}%</div>
</div>
          <div class="stat bg-base-200 rounded-lg shadow">
            <div class="stat-title">Produk Terjual</div>
            <div class="stat-value">{{ summary.total_items_sold }} pcs</div>
            <div class="stat-desc">Total barang terjual</div>
          </div>
        </div>
  
        <!-- Tabel Produk Terlaris -->
        <div>
          <h4 class="text-md font-bold mb-4">Produk Terlaris</h4>
          <div class="overflow-x-auto bg-base-100 rounded-lg shadow">
            <table class="table w-full">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Produk</th>
                  <th class="text-right">Jumlah Terjual</th>
                  <th class="text-right">Total Omzet</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!topProducts || topProducts.length === 0">
                  <td colspan="4" class="text-center h-24">Tidak ada penjualan produk pada periode ini.</td>
                </tr>
                <tr v-for="(product, index) in topProducts" :key="product.product_id" class="hover">
                  <th>{{ index + 1 }}</th>
                  <td>{{ product.product_name }}</td>
                  <td class="text-right font-mono">{{ product.quantity_sold }}</td>
                  <td class="text-right font-mono">{{ formatCurrency(product.total_revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
       <!-- Grafik Tren Penjualan Harian -->
<div>
    <h4 class="text-md font-bold mb-4">Grafik Tren Penjualan</h4>
    <div class="p-4 bg-base-100 rounded-lg shadow h-80">
        <SalesChart 
           v-if="!isLoading && chartData.labels.length > 0"
           :chart-data="chartData" 
           :chart-options="chartOptions" 
        />
        <div v-else-if="!isLoading && chartData.labels.length === 0" class="flex items-center justify-center h-full text-base-content/50">
            <p>Data tidak cukup untuk menampilkan grafik.</p>
        </div>
        <!-- State loading ditangani oleh spinner utama di atas -->
    </div>
</div>

<!-- Tabel Daftar Transaksi -->
<div>
    <h4 class="text-md font-bold mb-4 mt-8">Daftar Transaksi</h4>
    <div class="overflow-x-auto bg-base-100 rounded-lg shadow">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Outlet</th>
            <th>Total Transaksi</th>
            <th>Metode Bayar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in paginatedTransactions" :key="tx.id" class="hover">
            <!-- ... (isi baris tabel не изменился) ... -->
          </tr>
          <tr v-if="!transactionList || transactionList.length === 0">
            <td colspan="5" class="text-center h-24">Tidak ada transaksi pada periode ini.</td>
          </tr>
          <tr v-for="tx in paginatedTransactions" :key="tx.id" class="hover">
            <td>{{ new Date(tx.created_at).toLocaleString('id-ID', {day: '2-digit', month: 'short', hour:'2-digit', minute:'2-digit'}) }}</td>
            <td>{{ tx.outlet_name }}</td>
            <td class="font-mono">{{ formatCurrency(tx.final_amount) }}</td>
            <td><div class="badge badge-ghost">{{ tx.payment_method }}</div></td>
            <td>
              <button class="btn btn-sm btn-outline" @click="showReceipt(tx)">
                Lihat Struk
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
</div>

<div class="flex justify-center mt-4" v-if="totalPages > 1">
    <div class="join">
      <button 
        class="join-item btn" 
        @click="currentPage--" 
        :disabled="currentPage === 1"
      >«</button>
      <button class="join-item btn">Halaman {{ currentPage }} dari {{ totalPages }}</button>
      <button 
        class="join-item btn" 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
      >»</button>
    </div>
  </div>

<!-- ============================================= -->
<!-- === MODAL UNTUK MENAMPILKAN STRUK DETAIL === -->
<!-- ============================================= -->
<dialog class="modal" :class="{'modal-open': isReceiptModalOpen}">
  <div class="modal-box max-w-sm">
    <button @click="closeReceiptModal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    <h3 class="font-bold text-lg mb-4">Detail Struk Transaksi</h3>
    
    <!-- Render komponen struk di sini, lewatkan data transaksi yang dipilih -->
    <ThermalReceipt 
      v-if="selectedTransaction" 
      :transaction="selectedTransaction"
    />
    
    <div class="modal-action mt-6">
      <!-- Tombol print atau aksi lain bisa ditambahkan di sini -->
      <button class="btn" @click="closeReceiptModal">Tutup</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button @click="closeReceiptModal">close</button>
  </form>
</dialog>
  
      </div>
      
      <!-- Tampilan jika tidak ada data sama sekali -->
      <div v-else class="text-center p-12 bg-base-200 rounded-lg">
          <p class="font-semibold">Tidak Ada Data</p>
          <p class="text-sm text-base-content/70">Tidak ada transaksi penjualan untuk filter yang Anda pilih.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import SalesChart from '@/components/SalesChart.vue';
import { useExporter } from '@/composables/useExporter';
import ThermalReceipt from '@/components/receipts/ThermalReceipt.vue';
import * as XLSX from 'xlsx-js-style';

const props = defineProps({
  // Terima satu prop 'dateRange' yang merupakan array
  dateRange: { type: Array, required: true },
  outletId: { type: String, default: null },
});

const reportStore = useReportStore();
const isExporting = ref(false);

// Computed properties (tidak berubah)
const isLoading = computed(() => reportStore.salesReport.loading);
const error = computed(() => reportStore.salesReport.error);
const summary = computed(() => reportStore.salesReport.summary);
const topProducts = computed(() => reportStore.salesReport.top_products);

// ========================================================
// === LOGIKA BARU UNTUK GRAFIK ===
// ========================================================

// 2. Ambil data tren dari store
const dailySalesTrend = computed(() => reportStore.salesReport.daily_sales_trend);

// 3. Buat chartData yang reaktif
const chartData = computed(() => {
  if (!dailySalesTrend.value || dailySalesTrend.value.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = dailySalesTrend.value.map(d => 
    new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  );
  const data = dailySalesTrend.value.map(d => d.total_revenue);

  return {
    labels,
    datasets: [
      {
        label: 'Omzet Penjualan',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: true,
        data: data,
      },
    ],
  };
});

// 4. Siapkan chartOptions
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
          callback: function(value) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'Jt';
            if (value >= 1000) return (value / 1000) + 'rb';
            return value;
          }
      }
    }
  }
}));

const transactionList = computed(() => reportStore.salesReport.transaction_list);
watch(transactionList, (newList) => {
  console.log(`[SalesReport] transactionList di computed property berubah. Jumlah: ${newList?.length}`);
});

// === STATE BARU UNTUK MODAL STRUK ===
const isReceiptModalOpen = ref(false);
const selectedTransaction = ref(null);

const showReceipt = (transaction) => {
  selectedTransaction.value = transaction;
  isReceiptModalOpen.value = true;
};

const closeReceiptModal = () => {
  isReceiptModalOpen.value = false;
  selectedTransaction.value = null; // Reset setelah ditutup
};

// Fungsi untuk memanggil action di store (disesuaikan)
const runReport = () => {
  if (Array.isArray(props.dateRange) && props.dateRange.length === 2) {
    reportStore.fetchSalesReport({
      startDate: props.dateRange[0], // Ambil dari array
      endDate: props.dateRange[1],   // Ambil dari array
      outletId: props.outletId,
    });
  }
};

const currentPage = ref(1);
const pageSize = ref(10); // Tampilkan 10 transaksi per halaman

const totalPages = computed(() => {
  if (!transactionList.value || transactionList.value.length === 0) return 1;
  return Math.ceil(transactionList.value.length / pageSize.value);
});

// Ini adalah computed property yang "memotong" data untuk halaman saat ini
const paginatedTransactions = computed(() => {
  if (!transactionList.value || transactionList.value.length === 0) return [];
  
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  
  return transactionList.value.slice(start, end);
});

// Watcher untuk mereset ke halaman 1 jika data berubah
watch(transactionList, () => {
  currentPage.value = 1;
});

// Watcher sekarang mengamati dateRange (array)
watch(() => [props.dateRange, props.outletId], runReport, { immediate: true, deep: true });


const handleExport = () => {
  if (isExporting.value || !summary.value) return;
  isExporting.value = true;

  try {
    // Definisikan variabel judul, rentang tanggal, dan nama file
    const reportTitle = "Laporan Penjualan";
    const startDateStr = new Date(props.dateRange[0]).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const endDateStr = new Date(props.dateRange[1]).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const dateRangeStr = `Periode: ${startDateStr} - ${endDateStr}`;
    const fileName = `laporan-penjualan-${new Date(props.dateRange[0]).toISOString().split('T')[0]}_sd_${new Date(props.dateRange[1]).toISOString().split('T')[0]}.xlsx`;

    // 1. Definisikan semua style yang akan kita gunakan
    const titleStyle = { font: { bold: true, sz: 18 }, alignment: { horizontal: "center" } };
    const subtitleStyle = { font: { italic: true, sz: 11 }, alignment: { horizontal: "center" } };
    const sectionTitleStyle = { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" } };
    const headerStyle = { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: "E9E9E9" } } };
    const kpiLabelStyle = { font: { bold: true } };
    const moneyStyle = { numFmt: '"Rp"#,##0', t: 'n' };
    const numberStyle = { numFmt: '#,##0', t: 'n' };
    const textStyle = { t: 's' };

    // 2. Siapkan data KPI dengan fallback yang aman
    const kpiData = [
        ["OMZET KOTOR:", summary.value.total_revenue || 0],
        ["LABA KOTOR:", summary.value.total_profit !== undefined ? summary.value.total_profit : "N/A"],
        ["PRODUK TERJUAL:", summary.value.total_items_sold || 0],
        ["JUMLAH TRANSAKSI:", summary.value.transaction_count || 0],
    ];

    // 3. Siapkan data Riwayat Transaksi
    const transactionHeaders = ["Tanggal", "ID Transaksi", "Outlet", "Kasir", "Pelanggan", "No. Telepon", "Metode Bayar", "Total (Rp)"];
    const transactionRows = transactionList.value.map(tx => [
        new Date(tx.created_at).toLocaleString('id-ID', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        tx.id.slice(-8).toUpperCase(),
        tx.outlet_name || '-',
        tx.cashier_name || '-',
        tx.customer_name || '-',
        tx.customer_phone || '-',
        tx.payment_method,
        tx.final_amount
    ]);

    // 4. Gabungkan semua bagian menjadi satu array besar
    const ws_data = [
        [reportTitle],
        [dateRangeStr],
        [],
        ...kpiData,
        [],
        ["Riwayat Transaksi"],
        transactionHeaders,
        ...transactionRows
    ];
    
    // 5. Buat Worksheet dari array data
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // 6. Terapkan Merge, Style, dan Lebar Kolom
    const columnCount = transactionHeaders.length;
    ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } }, // Judul utama
        { s: { r: 1, c: 0 }, e: { r: 1, c: columnCount - 1 } }, // Rentang Tanggal
        { s: { r: 8, c: 0 }, e: { r: 8, c: columnCount - 1 } }, // Judul Riwayat Transaksi (Perhatikan barisnya berubah)
    ];

    // Style Judul dan Subjudul
    ws['A1'].s = titleStyle;
    ws['A2'].s = subtitleStyle;
    // (Judul tabel riwayat sekarang di baris 9, indeks 8)
    ws['A9'].s = sectionTitleStyle;

    // Style KPI (baris 4 sampai 7, indeks 3-6)
    ws['A4'].s = ws['A5'].s = ws['A6'].s = ws['A7'].s = kpiLabelStyle;
    if (ws['B4']) ws['B4'].s = moneyStyle;  // Omzet Kotor
    if (ws['B5']) ws['B5'].s = moneyStyle;  // Laba Kotor (sudah menangani "N/A" karena tidak akan diberi style angka)
    if (ws['B6']) ws['B6'].s = numberStyle; // Produk Terjual (sekarang menjadi angka)
    if (ws['B7']) ws['B7'].s = numberStyle; // Jumlah Transaksi (angka)

    // Style Header Tabel (sekarang di baris 10, indeks 9)
    transactionHeaders.forEach((h, i) => {
        const cellRef = XLSX.utils.encode_cell({c: i, r: 9});
        if (ws[cellRef]) ws[cellRef].s = headerStyle;
    });

    // Format kolom Rupiah di riwayat (sekarang di kolom H, indeks 7)
    transactionRows.forEach((row, rowIndex) => {
        // Data dimulai dari baris 11 (indeks 10)
        const cellRef = XLSX.utils.encode_cell({c: 7, r: rowIndex + 10});
        if (ws[cellRef]) ws[cellRef].s = moneyStyle;
    });

    // Atur Lebar Kolom
    ws["!cols"] = [
        { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 18 }
    ];

    // 7. Buat Workbook dan download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");
    XLSX.writeFile(wb, fileName);

  } catch(e) {
    console.error("Gagal melakukan ekspor:", e);
    alert("Terjadi kesalahan saat mengekspor data.");
  } finally {
    isExporting.value = false;
  }
};

const profitMargin = computed(() => {
  if (!summary.value || !summary.value.total_revenue || summary.value.total_revenue === 0) {
    return '0.0';
  }
  const margin = (summary.value.total_profit / summary.value.total_revenue) * 100;
  return margin.toFixed(1); // Tampilkan satu angka di belakang koma
});

  // Helper function untuk format mata uang
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  </script>