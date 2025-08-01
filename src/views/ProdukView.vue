<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-full pb-20 md:pb-6">
    <!-- Header dengan Informasi Kuota Produk - Mobile Optimized -->
    <div class="mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div class="mb-4 md:mb-0">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Manajemen Produk</h1>
          <p v-if="isOwner" class="text-sm text-gray-500 mt-1">
            <span class="font-bold text-teal-600">{{ currentProductCount }}</span> dari <span class="font-bold">{{ productLimit }}</span> slot produk
          </p>
        </div>
        <div v-if="isOwner" class="w-full md:w-auto">
          <div class="tooltip" :data-tip="addButtonTooltip">
            <button 
              class="btn bg-teal-600 hover:bg-teal-700 text-white border-none w-full md:w-auto touch-target" 
              @click="openModalForNewProduct"
              :disabled="isAddButtonDisabled"
            >
              <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Tambah Produk
            </button>
          </div>
        </div>
      </div>
      
      <!-- Progress Bar Kuota Produk - Enhanced -->
      <div v-if="isOwner" class="bg-white rounded-xl p-4 border border-gray-200">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-600">Penggunaan Kuota Produk</span>
          <span class="text-sm font-bold text-gray-800">{{ Math.round((currentProductCount / productLimit) * 100) }}%</span>
        </div>
        <progress 
          class="progress w-full h-3" 
          :class="{
            'progress-success': (currentProductCount / productLimit) < 0.8,
            'progress-warning': (currentProductCount / productLimit) >= 0.8 && (currentProductCount / productLimit) < 1,
            'progress-error': (currentProductCount / productLimit) >= 1
          }"
          :value="currentProductCount" 
          :max="productLimit"
        ></progress>
      </div>
    </div>

    <!-- Panel Filter - Mobile Optimized -->
    <div class="bg-white rounded-xl border border-gray-200 mb-6 p-4">
      <div class="space-y-4 md:space-y-0 md:grid md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Outlet</label>
          <select v-model="activeOutletId" class="select select-bordered w-full touch-target no-zoom">
            <option v-for="outlet in productStore.outlets" :key="outlet.id" :value="outlet.id">{{ outlet.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter Kategori</label>
          <div class="flex items-center gap-2">
            <select v-model="filters.categoryId" class="select select-bordered w-full touch-target no-zoom">
              <option value="">Semua Kategori</option>
              <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <button @click="isCategoryModalVisible = true" class="btn btn-outline btn-square touch-target" title="Kelola Kategori">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Cari Produk</label>
          <input 
            v-model="filters.searchQuery" 
            type="text" 
            placeholder="Ketik nama atau SKU..." 
            class="input input-bordered w-full touch-target no-zoom" 
          />
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="productStore.isLoading" class="text-center py-12">
      <span class="loading loading-spinner loading-lg text-teal-600"></span>
      <p class="mt-2 text-gray-600">Sedang memuat data produk...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="productStore.error" class="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ productStore.error }}</p>
        </div>
      </div>
    </div>
    
    <!-- Product Display: Mobile-First Card Layout -->
    <div v-else>
      <!-- Mobile: Product Cards -->
      <div class="block md:hidden">
        <div v-if="filteredProducts.length === 0" class="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <p class="font-semibold text-gray-700 mb-1">Tidak Ada Produk</p>
          <p class="text-sm text-gray-500">Tidak ada produk yang cocok dengan filter Anda saat ini.</p>
        </div>
        
        <div v-else class="grid grid-cols-1 gap-4 pb-4">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <!-- Product Header -->
            <div class="flex items-start space-x-4 mb-4">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    :src="product.photo_url || '/finako.jpg'" 
                    alt="Foto Produk" 
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div class="flex-grow min-w-0">
                <h3 class="font-semibold text-gray-800 text-lg truncate">{{ product.name }}</h3>
                <p class="text-sm text-gray-500 mb-1">{{ product.categoryName }}</p>
                <div class="flex items-center space-x-2">
                  <span 
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="product.has_variants ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                  >
                    {{ product.has_variants ? '🔄 Punya Varian' : '📦 Produk Tunggal' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Product Info -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm text-gray-500 mb-1">Harga</p>
                <div v-if="product.has_variants">
                  <button 
                    @click="openViewVariantsModal(product)" 
                    class="text-teal-600 hover:text-teal-700 font-medium text-sm touch-target"
                  >
                    Lihat Varian →
                  </button>
                </div>
                <div v-else>
                  <p class="font-bold text-gray-800">{{ formatCurrency(product.price) }}</p>
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Stok di Outlet</p>
                <p class="font-bold text-gray-800">{{ product.stock }}</p>
              </div>
            </div>

            <!-- Action Buttons dengan proper spacing -->
            <div class="flex space-x-2 pt-2">
              <button 
                @click="openStockModal(product)" 
                class="flex-1 btn btn-outline btn-sm touch-target h-12"
                title="Kelola Stok"
              >
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"/>
                </svg>
                Stok
              </button>
              <button 
                @click="openModalForEdit(product)" 
                class="flex-1 btn btn-outline btn-sm touch-target h-12"
                title="Edit Produk"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
                Edit
              </button>
              <button 
                @click="productStore.deleteProduct(product.id)" 
                class="btn btn-outline btn-error btn-sm touch-target h-12 min-w-12"
                title="Hapus Produk"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: Enhanced Table -->
      <div class="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="table-auto w-full text-sm">
          <thead class="bg-gray-50 text-left text-gray-600">
            <tr>
              <th class="px-6 py-4 font-medium">Produk</th>
              <th class="px-6 py-4 font-medium">Kategori</th>
              <th class="px-6 py-4 font-medium">Harga</th>
              <th class="px-6 py-4 font-medium">Stok di Outlet</th>
              <th class="px-6 py-4 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center space-x-4">
                  <div class="avatar">
                    <div class="w-12 h-12 rounded-lg shadow-sm">
                      <img :src="product.photo_url || '/finako.jpg'" alt="Foto Produk" class="object-cover"/>
                    </div>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-800">{{ product.name }}</div>
                    <div class="text-xs text-gray-500">{{ product.has_variants ? 'Punya Varian' : 'Produk Tunggal' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-600">{{ product.categoryName }}</td>
              <td class="px-6 py-4">
                <button v-if="product.has_variants" class="text-teal-600 hover:underline font-medium" @click="openViewVariantsModal(product)">
                  Lihat Varian
                </button>
                <span v-else class="font-semibold text-gray-800">{{ formatCurrency(product.price) }}</span>
              </td>
              <td class="px-6 py-4 font-semibold text-gray-800">{{ product.stock }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center space-x-2">
                  <button @click="openStockModal(product)" class="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Kelola Stok">
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                      <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button @click="openModalForEdit(product)" class="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600" title="Edit Produk">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  </button>
                  <button @click="productStore.deleteProduct(product.id)" class="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600" title="Hapus Produk">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="5" class="text-center py-12 text-gray-500">
                <p class="font-semibold">Tidak Ada Produk</p>
                <p>Tidak ada produk yang cocok dengan filter Anda saat ini.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

<style scoped>
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

.no-zoom {
  font-size: 16px !important;
}

/* Mobile optimization untuk input fields */
@media (max-width: 768px) {
  input[type="text"], 
  select {
    font-size: 16px !important;
  }
  
  .input-bordered:focus,
  .select-bordered:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
  }
  
  /* Ensure buttons are fully visible dan tidak terpotong */
  .btn-sm {
    min-height: 48px !important;
    padding: 12px 16px !important;
  }
  
  /* Safe area untuk mobile bottom navigation */
  .pb-20 {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom)) !important;
  }
  
  /* Prevent content cut-off pada viewport kecil */
  .grid-cols-1 {
    padding-bottom: 2rem;
  }
}

/* Card hover effects */
.bg-white:hover {
  transform: translateY(-1px);
}

/* Smooth transitions */
.transition-shadow {
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}

/* Progress bar enhanced styling */
.progress {
  border-radius: 10px;
}

/* Button group spacing dengan proper height */
.space-x-2 > * + * {
  margin-left: 8px;
}

.space-x-2 .btn {
  flex-shrink: 0;
}

/* Truncate text properly */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Ensure full button visibility */
.btn.h-12 {
  height: 3rem;
  min-height: 3rem;
}

/* Prevent button text wrapping */
.btn {
  white-space: nowrap;
}
</style>
