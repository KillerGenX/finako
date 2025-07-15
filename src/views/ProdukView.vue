<template>
  <div class="p-4 md:p-6">
    <!-- Judul dan Tombol Utama -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 class="text-3xl font-bold">Manajemen Produk</h1>
      <button v-if="isOwner" class="btn btn-primary mt-4 md:mt-0" @click="openModalForNewProduct">
        + Tambah Produk Baru
      </button>
    </div>

    <!-- Panel Filter -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-base-200 rounded-lg mb-6">
      <div>
        <label class="label"><span class="label-text">Pilih Outlet</span></label>
        <select v-model="activeOutletId" class="select select-bordered w-full">
          <!-- Gunakan `productStore.outlets` langsung, karena ini array sederhana -->
          <option v-for="outlet in productStore.outlets" :key="outlet.id" :value="outlet.id">
            {{ outlet.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="label"><span class="label-text">Filter Kategori</span></label>
        <select v-model="filters.categoryId" class="select select-bordered w-full">
          <option value="">Semua Kategori</option>
          <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
         <button @click="isCategoryModalVisible = true" class="btn btn-square btn-outline btn-sm" title="Kelola Kategori">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    </button>
      </div>
      <div>
        <label class="label"><span class="label-text">Cari Produk</span></label>
        <input v-model="filters.searchQuery" type="text" placeholder="Ketik nama produk..." class="input input-bordered w-full" />
      </div>
    </div>
    
    <!-- Tampilan Loading atau Error -->
    <div v-if="productStore.isLoading" class="text-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
      <p>Sedang memuat data...</p>
    </div>
    <div v-else-if="productStore.error" class="alert alert-error shadow-lg">
      <div>
        <span class="material-icons">error</span>
        <span>Error: {{ productStore.error }}</span>
      </div>
    </div>
    
    <!-- Tabel Produk -->
    <div v-else class="overflow-x-auto bg-base-100 rounded-lg shadow">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Produk</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Stok di Outlet</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Gunakan `filteredProducts` yang sudah reaktif -->
          <tr v-for="product in filteredProducts" :key="product.id" class="hover">
            <td>
              <div class="flex items-center space-x-3">
                <div class="avatar">
                  <div class="mask mask-squircle w-12 h-12">
                    <img :src="product.photo_url || '/finako.svg'" alt="Foto Produk" />
                  </div>
                </div>
                <div>
                  <div class="font-bold">{{ product.name }}</div>
                  <div class="text-sm opacity-50">{{ product.has_variants ? 'Punya Varian' : 'Produk Tunggal' }}</div>
                </div>
              </div>
            </td>
            <td>{{ product.categoryName }}</td>
            <td>
  <!-- Jika produk punya varian, tampilkan tombol -->
  <button 
    v-if="product.has_variants" 
    class="btn btn-link btn-xs p-0"
    @click="openViewVariantsModal(product)"
  >
    Lihat Varian
  </button>
  <!-- Jika tidak, tampilkan harga seperti biasa -->
  <span v-else>
    {{ formatCurrency(product.price) }}
  </span>
</td>
            <td>{{ product.stock }}</td>
            <td>
            <button class="btn btn-ghost btn-xs" @click="openStockModal(product)">Stok</button>
  <button class="btn btn-ghost btn-xs" @click="openModalForEdit(product)">Edit</button>
  <button class="btn btn-ghost btn-xs text-error" @click="productStore.deleteProduct(product.id)">Hapus</button>
            </td>
          </tr>
          <!-- Kondisi jika tidak ada produk yang tampil setelah difilter -->
          <tr v-if="filteredProducts.length === 0">
              <td colspan="5" class="text-center py-8 text-gray-400">
                  Tidak ada produk yang cocok dengan filter Anda.
              </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Panggil Komponen Modal -->
    <ProductFormModal 
      :show="isModalVisible" 
      :product-to-edit="productBeingEdited"
      @close="closeModal"
      @save="handleSave"
    />
  </div>

  <CategoryManagementModal
  :show="isCategoryModalVisible"
  @close="isCategoryModalVisible = false"
/>

<ViewVariantsModal
  :show="isViewVariantsModalVisible"
  :product="productForViewingVariants"
  :active-outlet-id="activeOutletId"
  :outlets="productStore.outlets"
  @close="isViewVariantsModalVisible = false"
/>

<StockManagementModal
  :show="isStockModalVisible"
  :product="productForStockManagement"
  :active-outlet-id="activeOutletId"
  :outlets="productStore.outlets"
  @close="isStockModalVisible = false"
/>


</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia'; // <-- INILAH PERBAIKANNYA!
import { useProductStore } from '@/stores/productStore';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import ProductFormModal from '@/components/ProductFormModal.vue';
import CategoryManagementModal from '@/components/CategoryManagementModal.vue';
import ViewVariantsModal from '@/components/ViewVariantsModal.vue';
import StockManagementModal from '@/components/StockManagementModal.vue';

const productStore = useProductStore();
const userStore = useUserStoreRefactored();

// Ambil state dan getter yang kita butuhkan dengan cara yang REAKTIF
const { filteredProducts, activeOutletId, filters } = storeToRefs(productStore);
const isViewVariantsModalVisible = ref(false);
const productForViewingVariants = ref(null);
const isModalVisible = ref(false);
const productBeingEdited = ref(null);
const isCategoryModalVisible = ref(false);
const isStockModalVisible = ref(false);
const productForStockManagement = ref(null);

const isOwner = computed(() => userStore.activeRole === 'Owner');

// `watch` pada activeOutletId sekarang tidak lagi diperlukan karena
// getter di dalam store sudah reaktif terhadap perubahannya.
// Ini membuat kode komponen lebih bersih.

onMounted(() => {
    if (userStore.isReady) {
        productStore.fetchInitialData();
    } else {
        const unwatch = watch(() => userStore.isReady, (ready) => {
            if (ready) {
                productStore.fetchInitialData();
                unwatch();
            }
        });
    }
});

function openModalForNewProduct() {
  productBeingEdited.value = null;
  isModalVisible.value = true;
}

function openModalForEdit(product) {
  productBeingEdited.value = product;
  isModalVisible.value = true;
}

function closeModal() {
  isModalVisible.value = false;
}

function openViewVariantsModal(product) {
    productForViewingVariants.value = product;
    isViewVariantsModalVisible.value = true;
}

function openStockModal(product) {
    productForStockManagement.value = product;
    isStockModalVisible.value = true;
}


async function handleSave(payload) {
    // payload sekarang adalah objek { formData, photoFile }
    closeModal();
    if (payload.formData.id) {
        // Jika ada ID, ini mode edit
        await productStore.updateProduct(payload);
    } else {
        // Jika tidak ada ID, ini mode tambah baru
        await productStore.addProduct(payload);
    }
}

function formatCurrency(value) {
  if (typeof value === 'string') return value;
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}
</script>