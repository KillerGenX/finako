<template>
  <div class="p-4 md:p-6">
    <!-- Header Halaman (Meniru Pola ProdukView) -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 class="text-3xl font-bold">Manajemen Bahan Baku</h1>
      <button class="btn btn-primary mt-4 md:mt-0" @click="openIngredientModal()">
        + Tambah Bahan Baku Baru
      </button>
    </div>

    <!-- Panel Filter (Meniru Pola ProdukView) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg mb-6">
      <div>
        <label class="label"><span class="label-text">Tampilkan Stok untuk Outlet</span></label>
        <select v-model="activeOutletId" class="select select-bordered w-full">
          <option v-for="outlet in productStore.outlets" :key="outlet.id" :value="outlet.id">
            {{ outlet.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="label"><span class="label-text">Cari Bahan Baku</span></label>
        <input v-model="searchQuery" type="text" placeholder="Ketik nama bahan baku..." class="input input-bordered w-full" />
      </div>
    </div>

    <!-- Kondisi Loading / Error (Meniru Pola ProdukView) -->
    <div v-if="stockStore.isLoading && !stockStore.ingredients.length" class="text-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
      <p>Sedang memuat data...</p>
    </div>
    <div v-else-if="stockStore.error" class="alert alert-error shadow-lg">
      <span>Error: {{ stockStore.error }}</span>
    </div>

    <!-- Tabel Utama (Meniru Pola ProdukView) -->
    <div v-else class="overflow-x-auto bg-base-100 rounded-lg shadow">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Nama Bahan Baku</th>
            <th>Stok di Outlet Aktif</th>
            <th>Satuan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredIngredients" :key="item.id" class="hover">
            <td><div class="font-bold">{{ item.name }}</div></td>
            <td>
              <span class="font-mono text-lg" :class="{ 'text-error': item.stock_quantity < item.min_stock && item.min_stock > 0 }">
                {{ item.stock_quantity }}
              </span>
            </td>
            <td><span class="badge badge-ghost">{{ item.unit }}</span></td>
            <td>
              <button class="btn btn-ghost btn-xs" @click="openIngredientModal(item)">Edit</button>
              <button class="btn btn-ghost btn-xs text-error" @click="handleDeleteIngredient(item.id)">Hapus</button>
            </td>
          </tr>
          <tr v-if="filteredIngredients.length === 0">
            <td colspan="4" class="text-center py-8 text-gray-400">
              Tidak ada bahan baku yang cocok dengan pencarian Anda.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Komponen Modal yang Sudah Diekstrak -->
    <IngredientFormModal 
      :show="isIngredientModalVisible"
      :ingredient-to-edit="ingredientToEdit"
      :is-loading="stockStore.isLoading"
      @close="isIngredientModalVisible = false"
      @save="handleSaveIngredient"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import { useProductStore } from '@/stores/productStore';
import { useStockStore } from '@/stores/stockStore';
import IngredientFormModal from '@/components/stock/IngredientFormModal.vue';

// Inisialisasi semua store yang dibutuhkan
const userStore = useUserStoreRefactored();
const productStore = useProductStore();
const stockStore = useStockStore();

// Ambil state dan getter reaktif dari stores
const { activeOutletId } = storeToRefs(userStore);
const { ingredientsWithStock } = storeToRefs(stockStore);

// State lokal khusus untuk UI halaman ini
const searchQuery = ref('');
const isIngredientModalVisible = ref(false);
const ingredientToEdit = ref(null);

// Data olahan (computed) untuk filter pencarian
const filteredIngredients = computed(() => {
  if (!searchQuery.value) return ingredientsWithStock.value;
  return ingredientsWithStock.value.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// POLA KONSISTEN: Mengambil data saat komponen dimuat, dengan guard
onMounted(() => {
  const fetchData = () => {
    // Pastikan data umum seperti outlet ada
    if (productStore.outlets.length === 0) {
      productStore.fetchInitialData();
    }
    // Panggil data spesifik untuk halaman ini
    stockStore.fetchStockPageData();
  };

  // Guard untuk memastikan businessId sudah siap sebelum fetch
  if (userStore.isReady) {
    fetchData();
  } else {
    const unwatch = watch(() => userStore.isReady, (ready) => {
      if (ready) {
        fetchData();
        unwatch(); // Hentikan watcher setelah selesai
      }
    });
  }
});

// Handler untuk membuka modal
function openIngredientModal(ingredient = null) {
  ingredientToEdit.value = ingredient;
  isIngredientModalVisible.value = true;
}

// Handler untuk menyimpan data dari modal, memanggil action di store
async function handleSaveIngredient(formData) {
  await stockStore.saveIngredient(formData);
  isIngredientModalVisible.value = false;
}

// Handler untuk menghapus, memanggil action di store
async function handleDeleteIngredient(ingredientId) {
    await stockStore.deleteIngredient(ingredientId);
}
</script>