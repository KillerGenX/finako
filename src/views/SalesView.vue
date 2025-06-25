<script setup>
// --- Impor dari Pustaka ---
import { ref, onMounted, watch } from "vue";
import { supabase } from "@/supabase";
// Ikon tidak kita gunakan di tabel ini, jadi bisa dihapus agar bersih
// import { TrashIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

// --- State Management Halaman Ini ---
const loading = ref(false);
const message = ref("");
const sales = ref([]); // Untuk menampung riwayat penjualan
const products = ref([]); // Untuk menampung daftar produk dari katalog

// --- State untuk Form Input Penjualan ---
const selectedProductId = ref(null);
const quantity = ref(1);
const saleDescription = ref("");
const saleAmount = ref(0);

// --- Fungsi Logika ---

// Fungsi untuk mengambil daftar produk dari database
async function getProducts() {
  try {
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (error) throw error;
    if (data) products.value = data;
  } catch (error) {
    console.error("Error mengambil data produk:", error.message);
  }
}

// Fungsi untuk mengambil riwayat penjualan dari database
async function getSales() {
  loading.value = true;
  try {
    const { data, error } = await supabase.from("transactions").select("*").eq("category", "Penjualan").order("created_at", { ascending: false });

    if (error) throw error;
    if (data) sales.value = data;
  } catch (error) {
    message.value = `Error mengambil data: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// Fungsi untuk menambah data penjualan baru
async function addSale() {
  if (!selectedProductId.value || quantity.value <= 0) {
    message.value = "Silakan pilih produk dan isi jumlahnya.";
    return;
  }
  loading.value = true;
  message.value = "";
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("transactions").insert([
      {
        description: saleDescription.value,
        amount: saleAmount.value,
        type: "income",
        category: "Penjualan",
        user_id: user.id,
      },
    ]);
    if (error) throw error;
    message.value = "Transaksi penjualan berhasil ditambahkan!";
    // Reset form ke kondisi awal
    selectedProductId.value = null;
    quantity.value = 1;
    await getSales(); // Update tabel riwayat di layar
  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// "Pengawas" Cerdas: akan berjalan setiap kali produk atau kuantitas berubah
watch([selectedProductId, quantity], () => {
  if (!selectedProductId.value || quantity.value <= 0) {
    saleAmount.value = 0;
    saleDescription.value = "";
    return;
  }
  // Cari produk yang dipilih di dalam daftar produk kita
  const selectedProduct = products.value.find((p) => p.id === selectedProductId.value);

  // Jika ditemukan, hitung total dan buat deskripsi otomatis
  if (selectedProduct) {
    saleAmount.value = selectedProduct.price * quantity.value;
    saleDescription.value = `${selectedProduct.name} (x${quantity.value})`;
  }
});

// onMounted: Dijalankan saat halaman pertama kali dibuka
onMounted(() => {
  getSales(); // Ambil riwayat penjualan
  getProducts(); // Ambil daftar produk untuk dropdown
});
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Tambah Transaksi Penjualan</h2>
        <form @submit.prevent="addSale" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Pilih Produk/Menu</span></label>
            <select v-model="selectedProductId" class="select select-bordered" required>
              <option :value="null" disabled>-- Pilih Produk --</option>
              <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }} (Rp {{ new Intl.NumberFormat("id-ID").format(product.price) }})</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text">Jumlah (Qty)</span></label>
            <input type="number" v-model.number="quantity" placeholder="1" class="input input-bordered" min="1" required />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text">Total Pemasukan (Rp)</span></label>
            <input type="text" :value="new Intl.NumberFormat('id-ID').format(saleAmount)" class="input input-bordered" disabled />
          </div>

          <div class="card-actions justify-end">
            <button type="submit" :disabled="loading || !selectedProductId" class="btn btn-primary">
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? "Menyimpan..." : "Simpan Penjualan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Riwayat Penjualan</h2>
        <div v-if="loading && sales.length === 0" class="text-center p-4"><span class="loading loading-lg loading-spinner"></span></div>
        <div v-else-if="sales.length === 0" class="text-center p-4 text-gray-500">Belum ada transaksi penjualan.</div>
        <div v-else class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in sales" :key="sale.id" class="hover">
                <td>{{ sale.description }}</td>
                <td class="text-success font-semibold">+ Rp {{ new Intl.NumberFormat("id-ID").format(sale.amount) }}</td>
                <td>{{ new Date(sale.created_at).toLocaleDateString("id-ID") }}</td>
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
