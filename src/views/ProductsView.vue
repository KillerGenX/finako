<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase";
import { TrashIcon, PencilSquareIcon } from "@heroicons/vue/24/outline";

// --- State Management Halaman Ini ---
const loading = ref(false);
const message = ref("");
const products = ref([]); // Untuk menampung daftar produk dari database

// --- State untuk Form Tambah Produk ---
const newProduct = ref({
  name: "",
  price: 0,
  cost: 0,
});

// --- State untuk Modal Edit ---
const isEditModalOpen = ref(false);
const editingProduct = ref(null);

// --- Fungsi Logika (CRUD) ---

// CREATE: Fungsi untuk menambah produk baru
async function addProduct() {
  loading.value = true;
  message.value = "";
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("products").insert([
      {
        name: newProduct.value.name,
        price: newProduct.value.price,
        cost: newProduct.value.cost,
        user_id: user.id,
      },
    ]);

    if (error) throw error;

    message.value = `Produk '${newProduct.value.name}' berhasil ditambahkan!`;
    // Kosongkan form
    newProduct.value = { name: "", price: 0, cost: 0 };
    // Muat ulang daftar produk
    await getProducts();
  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// READ: Fungsi untuk mengambil semua produk
async function getProducts() {
  loading.value = true;
  try {
    const { data, error } = await supabase.from("products").select("*").order("created_at");
    if (error) throw error;
    if (data) products.value = data;
  } catch (error) {
    message.value = `Error mengambil data produk: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// UPDATE: Fungsi untuk membuka modal edit
function openEditModal(product) {
  editingProduct.value = { ...product }; // Salin data produk ke state edit
  isEditModalOpen.value = true; // Buka modal
}

// UPDATE: Fungsi untuk menyimpan perubahan dari modal
async function handleUpdateProduct() {
  loading.value = true;
  message.value = "";
  try {
    const { id, name, price, cost } = editingProduct.value;
    const { error } = await supabase.from("products").update({ name, price, cost }).eq("id", id);

    if (error) throw error;

    message.value = "Produk berhasil diperbarui!";
    isEditModalOpen.value = false; // Tutup modal
    await getProducts(); // Muat ulang daftar produk
  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// DELETE: Fungsi untuk menghapus produk
async function deleteProduct(productId, productName) {
  if (confirm(`Apakah Anda yakin ingin menghapus produk '${productName}'?`)) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      message.value = "Produk berhasil dihapus.";
      await getProducts(); // Muat ulang daftar produk
    } catch (error) {
      message.value = `Error: ${error.message}`;
    }
  }
}

// Jalankan getProducts() saat halaman pertama kali dimuat
onMounted(() => {
  getProducts();
});
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Tambah Produk / Menu Baru</h2>
        <form @submit.prevent="addProduct" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div class="form-control md:col-span-2">
            <label class="label"><span class="label-text">Nama Produk</span></label>
            <input type="text" v-model="newProduct.name" placeholder="Contoh: Baju Koko Premium" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Harga Jual (Rp)</span></label>
            <input type="number" v-model.number="newProduct.price" placeholder="150000" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Harga Modal (Rp)</span></label>
            <input type="number" v-model.number="newProduct.cost" placeholder="90000" class="input input-bordered" required />
          </div>
          <div class="card-actions justify-end md:col-start-4">
            <button type="submit" :disabled="loading" class="btn btn-primary w-full">
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? "..." : "Tambah" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Daftar Produk Anda</h2>
        <div v-if="loading && products.length === 0" class="text-center p-4"><span class="loading loading-lg loading-spinner"></span></div>
        <div v-else-if="products.length === 0" class="text-center p-4 text-gray-500">Anda belum memiliki produk.</div>
        <div v-else class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>Harga Modal</th>
                <th>Harga Jual</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id" class="hover">
                <td class="font-semibold">{{ product.name }}</td>
                <td>{{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.cost) }}</td>
                <td>{{ new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price) }}</td>
                <td class="flex items-center gap-2">
                  <button @click="openEditModal(product)" class="btn btn-ghost btn-sm btn-circle" title="Edit"><PencilSquareIcon class="h-5 w-5" /></button>
                  <button @click="deleteProduct(product.id, product.name)" class="btn btn-ghost btn-sm btn-circle text-error" title="Hapus"><TrashIcon class="h-5 w-5" /></button>
                </td>
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

    <dialog class="modal" :class="{ 'modal-open': isEditModalOpen }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Edit Produk</h3>
        <form v-if="editingProduct" @submit.prevent="handleUpdateProduct" class="space-y-4 mt-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Nama Produk</span></label>
            <input type="text" v-model="editingProduct.name" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Harga Jual (Rp)</span></label>
            <input type="number" v-model.number="editingProduct.price" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Harga Modal (Rp)</span></label>
            <input type="number" v-model.number="editingProduct.cost" class="input input-bordered" required />
          </div>
          <div class="modal-action">
            <button type="button" class="btn" @click="isEditModalOpen = false">Batal</button>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? "Menyimpan..." : "Simpan Perubahan" }}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>
