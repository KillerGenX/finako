<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-full">
    <!-- Header dengan Informasi Kuota Produk -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Manajemen Produk</h1>
        <p v-if="isOwner" class="text-sm text-gray-500 mt-1">
          Anda telah menggunakan <span class="font-bold text-teal-600">{{ currentProductCount }}</span> dari <span class="font-bold">{{ productLimit }}</span> slot produk yang tersedia.
        </p>
      </div>
      <div v-if="isOwner" class="tooltip mt-4 md:mt-0" :data-tip="addButtonTooltip">
        <button 
          class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" 
          @click="openModalForNewProduct"
          :disabled="isAddButtonDisabled"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk Baru
        </button>
      </div>
    </div>
    <!-- Progress Bar Kuota Produk -->
    <progress 
        v-if="isOwner"
        class="progress progress-primary w-full mb-6" 
        :class="{'progress-success': !isAddButtonDisabled, 'progress-warning': isAddButtonDisabled}"
        :value="currentProductCount" 
        :max="productLimit"
    ></progress>

    <!-- Panel Filter -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Outlet</label>
        <select v-model="activeOutletId" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm">
          <option v-for="outlet in productStore.outlets" :key="outlet.id" :value="outlet.id">{{ outlet.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Filter Kategori</label>
        <div class="flex items-center gap-2">
            <select v-model="filters.categoryId" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm">
              <option value="">Semua Kategori</option>
              <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <button @click="isCategoryModalVisible = true" class="btn btn-outline border-gray-300 btn-square" title="Kelola Kategori">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Cari Produk</label>
        <input v-model="filters.searchQuery" type="text" placeholder="Ketik nama atau SKU..." class="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
      </div>
    </div>
    
    <div v-if="productStore.isLoading" class="text-center py-12"><span class="loading loading-spinner loading-lg text-teal-600"></span><p class="mt-2 text-gray-600">Sedang memuat data produk...</p></div>
    <div v-else-if="productStore.error" class="bg-red-50 border-l-4 border-red-400 p-4"></div>
    <div v-else class="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table class="table-auto w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-600">
          <tr>
            <th class="px-6 py-3 font-medium">Produk</th><th class="px-6 py-3 font-medium">Kategori</th><th class="px-6 py-3 font-medium">Harga</th><th class="px-6 py-3 font-medium">Stok di Outlet</th><th class="px-6 py-3 font-medium text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="product in filteredProducts" :key="product.id">
            <td class="px-6 py-4"><div class="flex items-center space-x-4"><div class="avatar"><div class="w-12 h-12 rounded-lg shadow-sm"><img :src="product.photo_url || '/finako.svg'" alt="Foto Produk" class="object-cover" /></div></div><div><div class="font-semibold text-gray-800">{{ product.name }}</div><div class="text-xs text-gray-500">{{ product.has_variants ? 'Punya Varian' : 'Produk Tunggal' }}</div></div></div></td>
            <td class="px-6 py-4 text-gray-600">{{ product.categoryName }}</td>
            <td class="px-6 py-4"><button v-if="product.has_variants" class="text-teal-600 hover:underline font-medium" @click="openViewVariantsModal(product)">Lihat Varian</button><span v-else class="font-semibold text-gray-800">{{ formatCurrency(product.price) }}</span></td>
            <td class="px-6 py-4 font-semibold text-gray-800">{{ product.stock }}</td>
            <td class="px-6 py-4"><div class="flex items-center justify-center space-x-2"><button @click="openStockModal(product)" class="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Kelola Stok"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button><button @click="openModalForEdit(product)" class="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600" title="Edit Produk"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button><button @click="productStore.deleteProduct(product.id)" class="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600" title="Hapus Produk"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div></td>
          </tr>
          <tr v-if="filteredProducts.length === 0"><td colspan="5" class="text-center py-12 text-gray-500"><p class="font-semibold">Tidak Ada Produk</p><p>Tidak ada produk yang cocok dengan filter Anda saat ini.</p></td></tr>
        </tbody>
      </table>
    </div>
    <ProductFormModal :show="isModalVisible" :product-to-edit="productBeingEdited" @close="closeModal" @save="handleSave" />
    <CategoryManagementModal :show="isCategoryModalVisible" @close="isCategoryModalVisible = false" />
    <ViewVariantsModal :show="isViewVariantsModalVisible" :product="productForViewingVariants" :active-outlet-id="activeOutletId" :outlets="productStore.outlets" @close="isViewVariantsModalVisible = false" />
    <StockManagementModal :show="isStockModalVisible" :product="productForStockManagement" :active-outlet-id="activeOutletId" :outlets="productStore.outlets" @close="isStockModalVisible = false" />
</div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/stores/productStore';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import ProductFormModal from '@/components/ProductFormModal.vue';
import CategoryManagementModal from '@/components/CategoryManagementModal.vue';
import ViewVariantsModal from '@/components/ViewVariantsModal.vue';
import StockManagementModal from '@/components/StockManagementModal.vue';

const productStore = useProductStore();
const userStore = useUserStoreRefactored();

const { filteredProducts, activeOutletId, filters } = storeToRefs(productStore);
const isViewVariantsModalVisible = ref(false);
const productForViewingVariants = ref(null);
const isModalVisible = ref(false);
const productBeingEdited = ref(null);
const isCategoryModalVisible = ref(false);
const isStockModalVisible = ref(false);
const productForStockManagement = ref(null);

const isOwner = computed(() => userStore.activeRole === 'Owner');

// --- LOGIKA BARU YANG AMAN UNTUK LIMITASI PRODUK ---
const currentProductCount = computed(() => productStore.products?.length || 0);
const productLimit = computed(() => userStore.currentSubscription?.plans?.product_limit || 1);
const isAddButtonDisabled = computed(() => currentProductCount.value >= productLimit.value);

const addButtonTooltip = computed(() => {
    return isAddButtonDisabled.value 
      ? `Anda telah mencapai batas ${productLimit.value} produk untuk paket saat ini.`
      : 'Tambah produk baru';
});
// --- AKHIR DARI LOGIKA BARU ---

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
    closeModal();
    if (payload.formData.id) {
        await productStore.updateProduct(payload);
    } else {
        await productStore.addProduct(payload);
    }
}

function formatCurrency(value) {
  if (typeof value === 'string') return value;
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}
</script>
