<template>
  <div class="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
    
    <!-- Mobile Tab Navigation (Hidden on Desktop) -->
    <div class="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
      <div class="flex space-x-1">
        <button 
          @click="activeTab = 'products'" 
          :class="activeTab === 'products' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'"
          class="flex-1 py-3 px-4 rounded-lg font-medium transition-colors touch-target"
        >
          Produk
          <span v-if="filteredProducts.length > 0" class="ml-1 text-xs opacity-75">
            ({{ filteredProducts.length }})
          </span>
        </button>
        <button 
          @click="activeTab = 'cart'" 
          :class="activeTab === 'cart' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'"
          class="flex-1 py-3 px-4 rounded-lg font-medium transition-colors touch-target relative"
        >
          Keranjang
          <!-- Badge untuk jumlah item di keranjang -->
          <span 
            v-if="cartStore.totalItems > 0" 
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
          >
            {{ cartStore.totalItems }}
          </span>
        </button>
      </div>
    </div>
    
    <!-- Kolom Kiri: Katalog Produk -->
    <div class="flex flex-col" 
         :class="[
           'md:w-3/5',
           activeTab === 'products' ? 'flex-1' : 'hidden md:flex md:flex-col'
         ]">
      <!-- Header Katalog -->
      <div class="flex-shrink-0 p-3 md:p-4 bg-white border-b border-gray-200">
        <div class="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <!-- LOGIKA v-model="searchQuery" TIDAK DIUBAH -->
          <input 
            type="text" 
            placeholder="Cari produk (nama atau SKU)..." 
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm md:text-sm no-zoom touch-target" 
            v-model="searchQuery" 
          />
          <!-- LOGIKA v-model="selectedCategoryId" TIDAK DIUBAH -->
          <select 
            class="block w-full md:w-64 pl-3 pr-10 py-2 text-sm md:text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 rounded-md touch-target" 
            v-model="selectedCategoryId"
          >
            <option value="">Semua Kategori</option>
            <!-- LOGIKA v-for TIDAK DIUBAH -->
            <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>

      <!-- Grid Produk (dengan scroll dan padding) -->
      <div class="flex-grow overflow-y-auto p-3 md:p-4" 
           :class="cartStore.items.length > 0 ? 'pb-20 md:pb-4' : 'pb-4'">
        <!-- LOGIKA v-if="productStore.isLoading" TIDAK DIUBAH -->
        <div v-if="productStore.isLoading" class="flex justify-center items-center h-full pt-16">
            <span class="loading loading-spinner loading-lg text-teal-600"></span>
        </div>
        <!-- LOGIKA v-else-if="filteredProducts.length > 0" TIDAK DIUBAH -->
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          <!-- LOGIKA v-for, :key, @click, dan :class TIDAK DIUBAH SAMA SEKALI -->
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="bg-white rounded-xl md:rounded-lg shadow-sm md:shadow-md hover:shadow-lg hover:border-teal-500 border-2 border-transparent transition-all duration-200 cursor-pointer group touch-target"
            @click="product.has_variants ? openVariantModal(product) : cartStore.addProductToCart(product)"
          >
            <figure class="relative">
              <img 
                :src="product.photo_url || '/finako.jpg'" 
                alt="Product" 
                class="h-28 md:h-32 w-full object-cover rounded-t-xl md:rounded-t-lg" 
              />
              <div v-if="product.stock <= 0" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-xl md:rounded-t-lg">
                  <span class="text-white font-bold text-xs px-2 py-1 bg-red-500 rounded">HABIS</span>
              </div>
            </figure>
            <div class="p-2 md:p-3">
              <h2 class="font-semibold text-gray-800 text-xs md:text-sm leading-tight line-clamp-2 mb-1">{{ product.name }}</h2>
              <p class="text-teal-600 font-bold text-sm md:text-base">{{ formatCurrency(product.price) }}</p>
            </div>
          </div>
        </div>
        <!-- LOGIKA v-else TIDAK DIUBAH -->
        <div v-else class="text-center py-16 text-gray-400">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p class="mt-2">Tidak ada produk yang ditemukan.</p>
        </div>
      </div>
    </div>

    <!-- Kolom Kanan: Keranjang (dengan styling Green Teal) -->
    <div class="flex flex-col bg-white shadow-lg border-l border-gray-200" 
         :class="[
           'md:w-2/5',
           activeTab === 'cart' ? 'flex-1' : 'hidden md:flex md:flex-col'
         ]">
      <!-- Header Keranjang -->
      <div class="flex-shrink-0 p-3 md:p-4 border-b-2 border-gray-100 bg-white">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg md:text-xl font-bold text-gray-800">Pesanan</h2>
            <p class="text-sm text-gray-500">{{ cartStore.totalItems }} item</p>
          </div>
          <!-- LOGIKA @click dan :disabled TIDAK DIUBAH -->
          <button 
            @click="cartStore.clearCart()" 
            class="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 touch-target" 
            :disabled="!cartStore.items.length"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span class="hidden md:inline ml-1">Kosongkan</span>
          </button>
        </div>
      </div>
      
      <!-- Daftar Item Keranjang (area scroll) -->
      <div class="flex-grow overflow-y-auto" 
           :class="cartStore.items.length > 0 ? 'pb-20 md:pb-0' : ''">
        <!-- LOGIKA v-if TIDAK DIUBAH -->
        <div v-if="!cartStore.items.length" class="flex flex-col justify-center items-center h-full text-gray-400 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 md:h-20 w-16 md:w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p class="mt-3 md:mt-4 text-base md:text-lg font-semibold">Keranjang Kosong</p>
            <p class="text-xs md:text-sm text-center mt-1">Silakan pilih produk dari katalog</p>
        </div>
        
        <!-- LOGIKA v-else, v-for, dan :key TIDAK DIUBAH -->
        <ul v-else class="divide-y divide-gray-100">
            <li v-for="item in cartStore.items" :key="item.cartItemId" class="flex items-center p-3 md:p-4">
                <img :src="item.photo_url || '/finako.svg'" class="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover shadow-sm flex-shrink-0">
                <div class="ml-3 md:ml-4 flex-grow min-w-0">
                    <p class="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{{ item.name }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatCurrency(item.price) }}</p>
                </div>
                <div class="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <!-- LOGIKA @click TIDAK DIUBAH -->
                    <button @click="cartStore.decrementQuantity(item.cartItemId)" class="btn btn-sm btn-outline touch-target">-</button>
                    <!-- LOGIKA :value dan @change TIDAK DIUBAH -->
                    <input 
                      type="number" 
                      :value="item.quantity" 
                      @change="e => cartStore.updateQuantity(item.cartItemId, parseInt(e.target.value))" 
                      class="input input-bordered input-sm w-12 md:w-16 text-center no-zoom" 
                    />
                    <!-- LOGIKA @click TIDAK DIUBAH -->
                    <button @click="cartStore.incrementQuantity(item.cartItemId)" class="btn btn-sm btn-outline touch-target">+</button>
                </div>
                <p class="w-20 md:w-28 text-right font-semibold text-gray-700 text-xs md:text-sm ml-2 md:ml-0">{{ formatCurrency(item.price * item.quantity) }}</p>
            </li>
        </ul>
      </div>
      
      <!-- Ringkasan Biaya & Tombol Bayar -->
      <div class="flex-shrink-0 p-4 md:p-5 bg-gray-50 border-t-2 border-gray-200 space-y-4">
        <div class="space-y-1 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span class="font-medium text-gray-800">{{ formatCurrency(cartStore.subtotal) }}</span>
            </div>
            <!-- LOGIKA v-if TIDAK DIUBAH -->
            <div v-if="cartStore.taxAmount > 0" class="flex justify-between text-gray-600">
              <span>Pajak ({{ userStore.business?.tax_percent }}%)</span>
              <span class="font-medium text-gray-800">{{ formatCurrency(cartStore.taxAmount) }}</span>
            </div>
            <!-- LOGIKA v-if TIDAK DIUBAH -->
            <div v-if="cartStore.serviceChargeAmount > 0" class="flex justify-between text-gray-600">
              <span>Biaya Layanan ({{ userStore.business?.service_charge_percent }}%)</span>
              <span class="font-medium text-gray-800">{{ formatCurrency(cartStore.serviceChargeAmount) }}</span>
            </div>
        </div>
      
        <div class="pt-2 border-t border-dashed"></div>

        <div class="flex justify-between items-center text-lg md:text-xl font-bold text-gray-900">
          <span>Total</span>
          <span class="text-xl md:text-2xl text-teal-600">{{ formatCurrency(cartStore.grandTotal) }}</span>
        </div>

        <!-- LOGIKA @click dan :disabled TIDAK DIUBAH -->
        <button 
          @click="isPaymentModalVisible = true" 
          :disabled="!cartStore.items.length" 
          class="btn btn-primary bg-teal-600 hover:bg-teal-700 border-none text-white w-full h-12 md:h-14 text-base md:text-lg touch-target"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Bayar
        </button>
      </div>
    </div>
  
  <!-- Mobile Floating Payment Button (muncul ketika ada item di keranjang) -->
  <div 
    v-if="cartStore.items.length > 0" 
    class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 safe-area-bottom shadow-lg"
  >
    <div class="flex items-center gap-3">
      <!-- Quick Cart Summary dengan tab switcher -->
      <button 
        @click="activeTab = 'cart'"
        class="flex-1 min-w-0 text-left touch-target py-2 px-3 rounded-lg transition-colors"
        :class="activeTab === 'cart' ? 'bg-gray-100' : 'hover:bg-gray-50'"
      >
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-600">{{ cartStore.totalItems }} item</span>
          <span class="text-lg font-bold text-teal-600">{{ formatCurrency(cartStore.grandTotal) }}</span>
        </div>
        <div class="text-xs text-gray-400 mt-1">Tap untuk lihat keranjang</div>
      </button>
      <!-- Payment Button -->
      <button 
        @click="isPaymentModalVisible = true" 
        class="btn btn-primary bg-teal-600 hover:bg-teal-700 border-none text-white px-6 h-12 text-base touch-target flex-shrink-0 shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Bayar
      </button>
    </div>
  </div>

  <!-- SEMUA PEMANGGILAN MODAL DAN LOGIKANYA TIDAK DIUBAH -->
  <VariantSelectionModal
    :show="isVariantModalVisible"
    :product="productForVariantSelection"
    :active-outlet-id="userStore.activeOutletId"
    @close="isVariantModalVisible = false"
    @variant-selected="handleVariantSelected"
  />

  <PaymentModal
        :show="isPaymentModalVisible"
        :cart="cartStore" 
        :is-submitting="transactionStore.isSubmitting"
        @close="isPaymentModalVisible = false"
        @submit="handlePaymentSubmit"
      />

  <TransactionSuccessModal
    :show="isSuccessModalVisible"
    :transaction-id="lastTransactionId"
    :payment-details="lastPaymentDetails"
    :customerName="lastPaymentDetails?.customer_name"
    :customerPhone="lastPaymentDetails?.customer_phone"
    @new-transaction="handleNewTransaction"
  />

</div>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, computed, onMounted, watch } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/stores/cartStore';
import { storeToRefs } from 'pinia';
import VariantSelectionModal from '@/components/pos/VariantSelectionModal.vue';
import PaymentModal from '@/components/pos/PaymentModal.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import TransactionSuccessModal from '@/components/pos/TransactionSuccessModal.vue';
import { useUserStoreRefactored, useUIStore } from '@/stores/userStoreRefactored';

const productStore = useProductStore();
const cartStore = useCartStore();
const userStore = useUserStoreRefactored();
const isVariantModalVisible = ref(false);
const productForVariantSelection = ref(null);
const transactionStore = useTransactionStore();
const isPaymentModalVisible = ref(false);
const isSuccessModalVisible = ref(false);
const lastTransactionId = ref(null);
const lastPaymentDetails = ref(null);
const uiStore = useUIStore();

const { categories } = storeToRefs(productStore);

const searchQuery = ref('');
const selectedCategoryId = ref('');

// Mobile navigation state (tidak mengubah logika yang ada)
const activeTab = ref('products');

onMounted(() => {
  if (userStore.isReady) {
    productStore.fetchInitialData(userStore.activeOutletId);
  } else {
    const unwatch = watch(() => userStore.isReady, (ready) => {
      if (ready) {
        productStore.fetchInitialData(userStore.activeOutletId);
        unwatch();
      }
    });
  }
});

const filteredProducts = computed(() => {
  let products = productStore.productsForSale;

  if (!products) return [];

  if (searchQuery.value) {
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(lowerCaseQuery) ||
      (p.sku && p.sku.toLowerCase().includes(lowerCaseQuery))
    );
  }
  if (selectedCategoryId.value) {
    products = products.filter(p => p.category_id === selectedCategoryId.value);
  }

  return products;
});

function formatCurrency(value) {
  if (value === 0) return 'Rp 0';
  if (!value || typeof value !== 'number') return 'Pilih Varian';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

function openVariantModal(product) {
  productForVariantSelection.value = product;
  isVariantModalVisible.value = true;
}

function handleVariantSelected(variant) {
  const enrichedVariant = {
    ...variant,
    product_id: productForVariantSelection.value.id,
    has_variants: true,
    photo_url: productForVariantSelection.value?.photo_url,
  };
  cartStore.addVariantToCart(enrichedVariant);
  isVariantModalVisible.value = false;
}

async function handlePaymentSubmit(paymentDetails) {
  const { success, transactionId, error } = await transactionStore.submitTransaction(paymentDetails);
  if (success) {
    isPaymentModalVisible.value = false;
    lastTransactionId.value = transactionId;
    lastPaymentDetails.value = paymentDetails;
    isSuccessModalVisible.value = true;
  } else {
    uiStore.showNotification(error || 'Transaksi Gagal', 'error');
  }
}

function handleNewTransaction() {
    isSuccessModalVisible.value = false;
    lastTransactionId.value = null;
    lastPaymentDetails.value = null;
}
</script>
