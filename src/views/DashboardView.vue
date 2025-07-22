<template>
  <div class="p-4 md:p-6">
    <!-- Header Dasbor dengan Pemilihan Outlet -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <!-- Sapaan yang dinamis berdasarkan nama -->
        <h1 class="text-2xl font-bold">Halo, {{ userStore.userFullName }}!</h1>
        <p v-if="userStore.activeRole === 'Owner'" class="text-base-content/70">Ringkasan aktivitas bisnis Anda.</p>
        <p v-else class="text-base-content/70">Selamat bekerja, semoga harimu menyenangkan.</p>
      </div>

      <!-- Blok Kanan: Pemilihan Outlet Cerdas -->
      <div v-if="userStore.accessibleOutlets.length > 0" class="w-full md:w-64">
        <label class="label py-1"><span class="label-text">Outlet Aktif</span></label>
        
        <select 
          v-if="userStore.accessibleOutlets.length > 1"
          :value="userStore.activeOutletId"
          @change="handleOutletChange"
          class="select select-bordered w-full"
          :disabled="!userStore.isReady"
        >
          <option v-for="outlet in userStore.accessibleOutlets" :key="outlet.id" :value="outlet.id">
            {{ outlet.name }}
          </option>
        </select>

        <div v-else class="input input-bordered flex items-center bg-base-200">
          {{ userStore.activeOutlet?.name }}
        </div>
      </div>
    </div>

    <!-- Tampilan Loading -->
    <div v-if="isLoading" class="text-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Mengambil ringkasan data...</p>
    </div>

    <!-- Tampilan Error -->
    <div v-else-if="error" class="alert alert-error shadow-lg">
      <div>
        <span>Gagal memuat data dasbor: {{ error }}</span>
      </div>
    </div>
    
    <!-- ===================================================================== -->
    <!-- === BLOK BARU: Tampilan khusus untuk pegawai yang menunggu akses === -->
    <!-- ===================================================================== -->
    <div v-else-if="userStore.activeRole !== 'Owner' && userStore.accessibleOutlets.length === 0" class="card bg-base-200 text-center p-8">
      <h2 class="text-xl font-semibold">Akun Anda Sudah Aktif!</h2>
      <p class="mt-2">Saat ini Anda belum memiliki akses ke outlet manapun. Mohon hubungi pemilik bisnis untuk memberikan Anda akses kerja.</p>
    </div>
    
    <!-- Tampilan untuk Owner yang belum punya outlet -->
    <div v-else-if="userStore.activeRole === 'Owner' && userStore.accessibleOutlets.length === 0" class="card bg-base-200 text-center p-8">
      <h2 class="text-xl font-semibold">Belum Ada Outlet</h2>
      <p class="mt-2">Anda belum membuat outlet. Silakan buat outlet pertama Anda di menu <router-link to="/pengaturan" class="link link-primary">Pengaturan</router-link>.</p>
    </div>

    <!-- Tampilan utama dasbor jika ada data -->
    <div v-else-if="dashboardData" class="space-y-6">
      <h2 class="text-xl font-bold">
        Ringkasan untuk: <span class="text-primary">{{ userStore.activeOutlet?.name }}</span>
      </h2>

      <!-- Kartu-kartu Ringkasan (Bagian ini sekarang dibedakan per peran) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Kartu Omzet (Owner & Kasir) -->
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-sm font-normal">Omzet Hari Ini</h3>
            <p class="text-3xl font-extrabold">{{ formatCurrency(dashboardData.daily_summary.total_revenue) }}</p>
          </div>
        </div>
        
        <!-- ========================================================== -->
        <!-- === KARTU LABA: Hanya untuk Owner === -->
        <!-- ========================================================== -->
        <div v-if="userStore.activeRole === 'Owner'" class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-sm font-normal">Laba Kotor Hari Ini</h3>
            <p class="text-3xl font-extrabold">{{ formatCurrency(dashboardData.daily_summary.total_profit) }}</p>
          </div>
        </div>

        <!-- Kartu Transaksi (Owner & Kasir) -->
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-sm font-normal">Transaksi Hari Ini</h3>
            <p class="text-3xl font-extrabold">{{ dashboardData.daily_summary.transaction_count }}</p>
          </div>
        </div>
        
        <!-- Kartu Rata-rata/Transaksi (Owner & Kasir) -->
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-sm font-normal">Rata-rata/Transaksi</h3>
            <p class="text-3xl font-extrabold">Rp {{ Math.round(dashboardData.daily_summary.avg_per_transaction).toLocaleString('id-ID') }}</p>
          </div>
        </div>
        <div v-if="userStore.activeRole !== 'Owner'" class="card bg-base-100 " :class="attendanceStore.currentStatus === 'CLOCKED_IN' ? 'border-success' : 'border-error'">
      <div class="card-body justify-center items-center">
        <div class="text-center">
          <h3 class="card-title text-sm font-normal">Status Absensi</h3>
          <p class="font-bold text-xl mt-1">
            {{ attendanceStore.currentStatus === 'CLOCKED_IN' ? 'SEDANG BEKERJA' : 'TIDAK BEKERJA' }}
          </p>
        </div>
        <div class="card-actions mt-4">
           <!-- Tombol ini akan mengarahkan ke halaman Absensi -->
           <button 
             @click="router.push('/absensi')" 
             class="btn"
             :class="{ 
               'btn-primary': attendanceStore.currentStatus === 'CLOCKED_OUT',
               'btn-secondary': attendanceStore.currentStatus === 'CLOCKED_IN'
             }"
           >
             {{ attendanceStore.currentStatus === 'CLOCKED_OUT' ? 'Lakukan Clock In' : 'Lakukan Clock Out' }}
           </button>
        </div>
      </div>
    </div>
      </div>
      
      <!-- Wawasan Tambahan -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h3 class="card-title">Produk Terlaris Hari Ini</h3>
              <div v-if="dashboardData.top_product_today" class="text-center p-4">
                <p class="text-2xl font-bold">{{ dashboardData.top_product_today.name }}</p>
                <p class="text-lg text-base-content/70">{{ dashboardData.top_product_today.quantity_sold }} terjual</p>
              </div>
              <p v-else class="text-center p-8 text-base-content/50">Belum ada penjualan hari ini.</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h3 class="card-title">Metode Pembayaran</h3>
              <div v-if="dashboardData.payment_methods_today && dashboardData.payment_methods_today.length > 0" class="p-4">
                <ul>
                  <li v-for="pm in dashboardData.payment_methods_today" :key="pm.method" class="flex justify-between items-center py-1">
                    <span class="font-semibold">{{ pm.method }}</span>
                    <span class="badge badge-primary">{{ pm.count }}</span>
                  </li>
                </ul>
              </div>
               <p v-else class="text-center p-8 text-base-content/50">Belum ada data pembayaran.</p>
            </div>
          </div>
      </div>

       <!-- Di sini nanti kita bisa tambahkan grafik -->
       <div v-if="userStore.activeRole === 'Owner'" class="card bg-base-100 shadow mt-6">
        <div class="card-body">
          <h3 class="card-title">Grafik Penjualan 7 Hari Terakhir</h3>
          <!-- Ganti placeholder dengan komponen SalesChart yang sudah Anda buat -->
          <div v-if="chartData.labels.length > 0" class="h-64 md:h-72">
            <!-- Panggil komponen Anda di sini -->
            <SalesChart :chartData="chartData" :chartOptions="chartOptions" />
          </div>
          <p v-else class="text-center p-8 text-base-content/50">
            Data grafik belum cukup untuk ditampilkan.
          </p>
        </div>
      </div>

    </div>

    <!-- Tampilan jika tidak ada transaksi sama sekali -->
    <div v-else class="card bg-base-200 text-center p-8">
        <h2 class="text-xl font-semibold">Data Belum Tersedia</h2>
        <p class="mt-2">Belum ada transaksi untuk outlet ini. Buat transaksi pertama Anda di menu kasir!</p>
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

const chartData = computed(() => {
  const emptyChart = { labels: [], datasets: [{ data: [] }] };

  if (!dashboardData.value || !dashboardData.value.sales_last_7_days) {
    return emptyChart;
  }
  
  // Urutkan data berdasarkan tanggal untuk memastikan grafik benar
  const sortedData = [...dashboardData.value.sales_last_7_days].sort((a,b) => new Date(a.date) - new Date(b.date));
  
  const labels = sortedData.map(d => 
    new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
  );
  
  const data = sortedData.map(d => d.total);

  return {
    labels,
    datasets: [
      {
        label: 'Omzet Penjualan',
        backgroundColor: 'rgba(87, 13, 248, 0.2)', // Warna primary dengan transparansi
        borderColor: '#570DF8', // Warna primary dari DaisyUI
        borderWidth: 2,
        tension: 0.4, // Membuat garis sedikit melengkung
        fill: true, // Beri warna di bawah garis
        data: data,
      },
    ],
  };
});

// Opsi untuk kustomisasi grafik (sedikit disempurnakan untuk grafik garis)
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
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
            if (value >= 1000000) return (value / 1000000).toFixed(1) + ' Jt';
            if (value >= 1000) return (value / 1000) + ' rb';
            return value;
        }
      }
    }
  }
});

const userStore = useUserStoreRefactored();
const attendanceStore = useAttendanceStore(); // <-- 3. INISIALISASI STORE BARU
const router = useRouter(); // <-- 4. INISIALISASI ROUTER

const dashboardData = ref(null);
const isLoading = ref(false);
const error = ref(null);

onMounted(() => {
  if (userStore.activeRole !== 'Owner') {
    attendanceStore.fetchMyLastStatus();
  }
});
// === FUNGSI PERHITUNGAN YANG SUDAH LENGKAP ===
function processRawData(rawData) {
    if (!rawData || !rawData.todays_transactions) {
        return {
            daily_summary: { total_revenue: 0, total_profit: 0, transaction_count: 0, avg_per_transaction: 0 },
            top_product_today: null,
            payment_methods_today: [],
            sales_last_7_days: rawData?.sales_last_7_days || []
        };
    }

    const transactions = rawData.todays_transactions;
    let total_revenue = 0;
    let total_cogs = 0;
    const payment_methods = {};
    const product_sales = {}; // Objek untuk menghitung penjualan produk

    transactions.forEach(tx => {
        total_revenue += tx.final_amount;
        
        if(tx.items) {
            tx.items.forEach(item => {
                total_cogs += item.quantity * item.cost_price;

                // Logika untuk menghitung produk terlaris
                if (product_sales[item.product_name]) {
                    product_sales[item.product_name] += item.quantity;
                } else {
                    product_sales[item.product_name] = item.quantity;
                }
            });
        }
        
        if (payment_methods[tx.payment_method]) {
            payment_methods[tx.payment_method]++;
        } else {
            payment_methods[tx.payment_method] = 1;
        }
    });

    const transaction_count = transactions.length;
    const total_profit = total_revenue - total_cogs;
    const avg_per_transaction = transaction_count > 0 ? total_revenue / transaction_count : 0;
    
    const payment_methods_today = Object.keys(payment_methods).map(method => ({
        method: method,
        count: payment_methods[method]
    }));

    // Cari produk terlaris dari objek product_sales
    let top_product_today = null;
    let max_quantity = 0;
    for (const productName in product_sales) {
        if (product_sales[productName] > max_quantity) {
            max_quantity = product_sales[productName];
            top_product_today = {
                name: productName,
                quantity_sold: max_quantity
            };
        }
    }

    return {
        daily_summary: { total_revenue, total_profit, transaction_count, avg_per_transaction },
        top_product_today,
        payment_methods_today,
        sales_last_7_days: rawData.sales_last_7_days
    };
}


// Fungsi fetchDashboardData (tidak berubah)
async function fetchDashboardData(outletId) {
  if (!outletId) return;
  isLoading.value = true;
  error.value = null;
  dashboardData.value = null;

  try {
    const { data, error: rpcError } = await supabase.rpc('get_dashboard_raw_data', {
      p_outlet_id: outletId
    });
    if (rpcError) throw rpcError;
    dashboardData.value = processRawData(data);
  } catch (e) {
    console.error("Gagal mengambil data dasbor:", e.message);
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
}

// Sisa script (handleOutletChange, watch, formatCurrency) tidak berubah
function handleOutletChange(event) {
    const selectedOutletId = event.target.value;
    userStore.setActiveOutlet(selectedOutletId);
}

watch(() => userStore.activeOutletId, (newId) => {
    if (newId) { fetchDashboardData(newId); } 
    else { dashboardData.value = null; }
}, { immediate: true });

function formatCurrency(value) {
    if (typeof value !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}
</script>