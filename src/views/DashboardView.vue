<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "@/supabase";

// --- State Management ---
const loading = ref(false);
const message = ref("");
const allTransactions = ref([]); // Sekarang menampung SEMUA transaksi
const businessProfile = ref(null);

// --- Computed Properties (Logika Diperbarui) ---

// Menghitung total pemasukan HANYA dari kategori 'Penjualan'
const totalIncome = computed(() => {
  return allTransactions.value.filter((tx) => tx.category === "Penjualan").reduce((sum, tx) => sum + tx.amount, 0);
});

// Menghitung total pengeluaran HANYA dari kategori 'Biaya Operasional'
const totalExpense = computed(() => {
  return allTransactions.value.filter((tx) => tx.category === "Biaya Operasional").reduce((sum, tx) => sum + tx.amount, 0);
});

const finalBalance = computed(() => {
  // Saldo sekarang dihitung dari total penjualan dikurangi total biaya operasional
  return totalIncome.value - totalExpense.value;
});

const bepInUnits = computed(() => {
  if (!businessProfile.value || businessProfile.value.avg_selling_price - businessProfile.value.avg_variable_cost <= 0) {
    return 0;
  }
  // Biaya tetap untuk BEP kita ambil dari profil usaha, bukan dari transaksi expense harian
  const fixedCostsForBEP = businessProfile.value.fixed_costs;
  const result = fixedCostsForBEP / (businessProfile.value.avg_selling_price - businessProfile.value.avg_variable_cost);
  return Math.ceil(result);
});

const bepInRupiah = computed(() => {
  if (!businessProfile.value || businessProfile.value.avg_selling_price <= 0) {
    return 0;
  }
  const fixedCostsForBEP = businessProfile.value.fixed_costs;
  const contributionMarginRatio = 1 - businessProfile.value.avg_variable_cost / businessProfile.value.avg_selling_price;
  if (contributionMarginRatio <= 0) {
    return 0;
  }
  return fixedCostsForBEP / contributionMarginRatio;
});

// --- Fungsi Logika ---

// Mengambil SEMUA transaksi milik pengguna
async function getAllTransactions() {
  try {
    const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    if (data) allTransactions.value = data;
  } catch (error) {
    message.value = `Error mengambil data: ${error.message}`;
  }
}

// Mengambil data profil usaha (tidak berubah)
async function getBusinessProfile() {
  try {
    const { data, error } = await supabase.from("business_profiles").select("*").single();
    if (error && error.code !== "PGRST116") throw error;
    if (data) businessProfile.value = data;
  } catch (error) {
    console.error("Error fetching business profile:", error.message);
  }
}

// Saat halaman dimuat, ambil semua data yang relevan
onMounted(async () => {
  loading.value = true;
  await Promise.all([getAllTransactions(), getBusinessProfile()]);
  loading.value = false;
});
</script>

<template>
  <div class="space-y-6">
    <div class="stats shadow w-full">
      <div class="stat">
        <div class="stat-title">Total Penjualan</div>
        <div class="stat-value text-success">{{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalIncome) }}</div>
        <div class="stat-desc">Dari halaman Transaksi Penjualan</div>
      </div>
      <div class="stat">
        <div class="stat-title">Total Biaya Operasional</div>
        <div class="stat-value text-error">{{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalExpense) }}</div>
        <div class="stat-desc">Dari halaman Biaya Operasional</div>
      </div>
      <div class="stat">
        <div class="stat-title">Profit / Rugi</div>
        <div class="stat-value">{{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(finalBalance) }}</div>
        <div class="stat-desc">(Penjualan - Biaya Operasional)</div>
      </div>
    </div>

    <div v-if="businessProfile" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Analisis Break-Even Point (BEP)</h2>
        <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div class="stat">
            <div class="stat-title">BEP (Unit)</div>
            <div class="stat-value">{{ bepInUnits.toLocaleString("id-ID") }}</div>
            <div class="stat-desc">Produk yg harus terjual/bulan</div>
          </div>
          <div class="stat">
            <div class="stat-title">BEP (Rupiah)</div>
            <div class="stat-value">{{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(bepInRupiah) }}</div>
            <div class="stat-desc">Penjualan/bulan u/ balik modal</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="alert alert-warning">
      <span>Data profil usaha belum diisi. Silakan isi di halaman <router-link to="/pengaturan" class="link link-primary">Pengaturan</router-link> untuk melihat kalkulasi BEP.</span>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Ringkasan Aktivitas Keuangan Terbaru</h2>
        <div v-if="loading && allTransactions.length === 0" class="text-center p-4"><span class="loading loading-lg loading-spinner"></span></div>
        <div v-else-if="allTransactions.length === 0" class="text-center p-4 text-gray-500">Belum ada aktivitas.</div>
        <div v-else class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in allTransactions" :key="tx.id" class="hover">
                <td>{{ tx.description }}</td>
                <td>
                  <div class="badge badge-neutral">{{ tx.category }}</div>
                </td>
                <td :class="tx.type === 'income' ? 'text-success' : 'text-error'">{{ tx.type === "income" ? "+" : "-" }} Rp {{ new Intl.NumberFormat("id-ID").format(tx.amount) }}</td>
                <td>{{ new Date(tx.created_at).toLocaleDateString("id-ID") }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="message" class="toast toast-top toast-center">
      <div class="alert alert-info">
        <span>{{ message }}</span>
      </div>
    </div>
  </div>
</template>
