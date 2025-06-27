<script setup>
// --- Impor dari Library ---
import { ref, watch } from 'vue';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';

// --- Impor Ikon untuk Tombol Aksi ---
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';

// --- State Utama ---
const userStore = useUserStore();
const loading = ref(false);
const message = ref('');
const sales = ref([]);
const products = ref([]);

// --- State untuk Form Tambah Data ---
const selectedProductId = ref(null);
const quantity = ref(1);
const saleDescription = ref('');
const saleAmount = ref(0);

// --- State untuk Modal Edit ---
// 'editModal' adalah referensi ke elemen <dialog> di template
const editModal = ref(null); 
// 'editingSale' akan menampung data transaksi yang sedang diedit
const editingSale = ref(null); 

// --- Fungsi-Fungsi untuk Mengambil Data ---

async function getProducts() {
  if (!userStore.organization?.id) return;
  try {
    const { data, error } = await supabase.from('products').select('*').eq('organization_id', userStore.organization.id).order('name');
    if (error) throw error;
    products.value = data;
  } catch (error) {
    console.error("Error mengambil data produk:", error.message);
  }
}

async function getSales() {
  if (!userStore.organization?.id) return;
  loading.value = true;
  try {
    const { data, error } = await supabase.from('transactions').select('*').eq('category', 'Penjualan').eq('organization_id', userStore.organization.id).order('created_at', { ascending: false });
    if (error) throw error;
    sales.value = data;
  } catch (error) {
    message.value = `Error mengambil data: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// Watcher untuk otomatis menghitung total pemasukan di form tambah
watch([selectedProductId, quantity], () => {
  if (!selectedProductId.value || quantity.value <= 0) {
    saleAmount.value = 0;
    saleDescription.value = '';
    return;
  }
  const selectedProduct = products.value.find(p => p.id === selectedProductId.value);
  if (selectedProduct) {
    saleAmount.value = selectedProduct.price * quantity.value;
    saleDescription.value = `${selectedProduct.name} (x${quantity.value})`;
  }
});


// --- Fungsi untuk Aksi CRUD (Create, Read, Update, Delete) ---

async function addSale() {
  // ... (Fungsi addSale Anda tidak berubah, sudah bagus)
  if (!userStore.organization?.id) { message.value = "Data organisasi tidak ditemukan. Coba refresh halaman."; return; }
  if (!selectedProductId.value || quantity.value <= 0) { message.value = 'Silakan pilih produk dan isi jumlahnya.'; return; }
  loading.value = true; message.value = '';
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('transactions').insert([{
      description: saleDescription.value, amount: saleAmount.value, type: 'income', category: 'Penjualan', user_id: user.id, organization_id: userStore.organization.id
    }]);
    if (error) throw error;
    message.value = 'Transaksi penjualan berhasil ditambahkan!';
    selectedProductId.value = null; quantity.value = 1;
    await getSales(); // Refresh daftar penjualan
  } catch (error) { 
    message.value = `Error: ${error.message}`; 
  } finally { 
    loading.value = false; 
    setTimeout(() => message.value = '', 3000);
  }
}

// --- FUNGSI BARU: Hapus Penjualan ---
async function deleteSale(saleId) {
  // Tampilkan dialog konfirmasi sebelum menghapus
  if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini? Aksi ini tidak dapat dibatalkan.')) {
    return;
  }
  try {
    const { error } = await supabase.from('transactions').delete().eq('id', saleId);
    if (error) throw error;
    message.value = 'Transaksi berhasil dihapus!';
    await getSales(); // Refresh daftar penjualan
  } catch (error) {
    message.value = `Error menghapus data: ${error.message}`;
  } finally {
    setTimeout(() => message.value = '', 3000);
  }
}

// --- FUNGSI BARU: Buka Modal Edit ---
function openEditModal(sale) {
  // Salin data 'sale' yang dipilih ke state 'editingSale'
  // Untuk penjualan, kita tidak bisa langsung edit deskripsi/amount,
  // karena itu turunan dari produk & kuantitas.
  // Di sini, kita akan contohkan edit deskripsi secara manual.
  editingSale.value = { ...sale }; // Salin data agar tidak mengubah data asli secara langsung
  editModal.value.showModal(); // Tampilkan modal
}

// --- FUNGSI BARU: Simpan Perubahan (Update) ---
async function updateSale() {
  if (!editingSale.value) return;
  loading.value = true;
  try {
    // Ambil data yang diubah dari form di dalam modal
    const { error } = await supabase
      .from('transactions')
      .update({
        description: editingSale.value.description,
        amount: editingSale.value.amount,
      })
      .eq('id', editingSale.value.id);

    if (error) throw error;
    message.value = 'Transaksi berhasil diperbarui!';
    await getSales(); // Refresh daftar penjualan
    editModal.value.close(); // Tutup modal
  } catch (error) {
    message.value = `Error memperbarui data: ${error.message}`;
  } finally {
    loading.value = false;
    setTimeout(() => message.value = '', 3000);
  }
}


// Watcher untuk mengambil data saat komponen pertama kali dimuat
watch(() => userStore.organization, (newOrgValue) => {
  if (newOrgValue) {
    getSales();
    getProducts();
  } else {
    sales.value = [];
    products.value = [];
  }
}, { immediate: true });
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
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }} (Rp {{ new Intl.NumberFormat('id-ID').format(product.price) }})
              </option>
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
              {{ loading ? 'Menyimpan...' : 'Simpan Penjualan' }}
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
                <th v-if="userStore.userRole === 'owner'">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in sales" :key="sale.id" class="hover">
                <td>{{ sale.description }}</td>
                <td class="text-success font-semibold">+ Rp {{ new Intl.NumberFormat('id-ID').format(sale.amount) }}</td>
                <td>{{ new Date(sale.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}</td>
                
                <td v-if="userStore.userRole === 'owner'">
                  <div class="flex items-center gap-2">
                    <button @click="openEditModal(sale)" class="btn btn-ghost btn-sm btn-circle" title="Edit">
                      <PencilSquareIcon class="h-5 w-5" />
                    </button>
                    <button @click="deleteSale(sale.id)" class="btn btn-ghost btn-sm btn-circle text-error" title="Hapus">
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="message" class="toast toast-top toast-center">
      <div class="alert alert-info shadow-lg"><span>{{ message }}</span></div>
    </div>

    <dialog ref="editModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Edit Transaksi Penjualan</h3>
        <form @submit.prevent="updateSale" class="space-y-4 py-4" v-if="editingSale">
          <div class="form-control">
            <label class="label"><span class="label-text">Deskripsi</span></label>
            <input type="text" v-model="editingSale.description" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Jumlah (Rp)</span></label>
            <input type="number" v-model.number="editingSale.amount" class="input input-bordered" required />
          </div>
          <div class="modal-action">
            <button type="button" class="btn" @click="editModal.close()">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner"></span>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>