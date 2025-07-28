<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    
    <!-- Kolom Kiri: Katalog Produk -->
    <div class="flex flex-col w-3/5">
      <!-- Header Katalog -->
      <div class="flex-shrink-0 p-4 bg-white border-b border-gray-200">
        <div class="flex items-center space-x-4">
          <!-- LOGIKA v-model="searchQuery" TIDAK DIUBAH -->
          <input type="text" placeholder="Cari produk (nama atau SKU)..." class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" v-model="searchQuery" />
          <!-- LOGIKA v-model="selectedCategoryId" TIDAK DIUBAH -->
          <select class="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md" v-model="selectedCategoryId">
            <option value="">Semua Kategori</option>
            <!-- LOGIKA v-for TIDAK DIUBAH -->
            <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>

      <!-- Grid Produk (dengan scroll dan padding) -->
      <div class="flex-grow overflow-y-auto p-4">
        <!-- LOGIKA v-if="productStore.isLoading" TIDAK DIUBAH -->
        <div v-if="productStore.isLoading" class="flex justify-center items-center h-full pt-16">
            <span class="loading loading-spinner loading-lg text-teal-600"></span>
        </div>
        <!-- LOGIKA v-else-if="filteredProducts.length > 0" TIDAK DIUBAH -->
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <!-- LOGIKA v-for, :key, @click, dan :class TIDAK DIUBAH SAMA SEKALI -->
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="bg-white rounded-lg shadow-md hover:shadow-xl hover:border-teal-500 border-2 border-transparent transition-all duration-200 cursor-pointer group"
            @click="product.has_variants ? openVariantModal(product) : cartStore.addProductToCart(product)"
          >
            <figure class="relative">
              <img :src="product.photo_url || '/finako.jpg'" alt="Product" class="h-32 w-full object-cover rounded-t-lg" />
              <div v-if="product.stock <= 0" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                  <span class="badge badge-error font-semibold text-white">STOK HABIS</span>
              </div>
            </figure>
            <div class="p-3">
              <h2 class="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{{ product.name }}</h2>
              <p class="text-teal-600 font-bold mt-1">{{ formatCurrency(product.price) }}</p>
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
    <div class="w-2/5 flex flex-col bg-white shadow-lg border-l border-gray-200">
      <!-- Header Keranjang -->
      <div class="flex-shrink-0 p-4 border-b-2 border-gray-100 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">Pesanan Saat Ini ({{ cartStore.totalItems }} item)</h2>
          <!-- LOGIKA @click dan :disabled TIDAK DIUBAH -->
          <button @click="cartStore.clearCart()" class="btn btn-ghost btn-sm text-red-500 hover:bg-red-50" :disabled="!cartStore.items.length">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Kosongkan
          </button>
      </div>
      
      <!-- Daftar Item Keranjang (area scroll) -->
      <div class="flex-grow overflow-y-auto">
        <!-- LOGIKA v-if TIDAK DIUBAH -->
        <div v-if="!cartStore.items.length" class="flex flex-col justify-center items-center h-full text-gray-400 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <p class="mt-4 text-lg font-semibold">Keranjang Kosong</p>
            <p class="text-sm text-center">Silakan pilih produk dari katalog di sebelah kiri.</p>
        </div>
        
        <!-- LOGIKA v-else, v-for, dan :key TIDAK DIUBAH -->
        <ul v-else class="divide-y divide-gray-100">
            <li v-for="item in cartStore.items" :key="item.cartItemId" class="flex items-center p-4">
                <img :src="item.photo_url || '/finako.svg'" class="w-16 h-16 rounded-lg object-cover shadow-sm">
                <div class="ml-4 flex-grow">
                    <p class="font-semibold text-gray-800 text-sm line-clamp-1">{{ item.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatCurrency(item.price) }}</p>
                </div>
                <div class="flex items-center gap-2">
                    <!-- LOGIKA @click TIDAK DIUBAH -->
                    <button @click="cartStore.decrementQuantity(item.cartItemId)" class="btn btn-sm btn-outline">-</button>
                    <!-- LOGIKA :value dan @change TIDAK DIUBAH -->
                    <input type="number" :value="item.quantity" @change="e => cartStore.updateQuantity(item.cartItemId, parseInt(e.target.value))" class="input input-bordered input-sm w-16 text-center" />
                    <!-- LOGIKA @click TIDAK DIUBAH -->
                    <button @click="cartStore.incrementQuantity(item.cartItemId)" class="btn btn-sm btn-outline">+</button>
                </div>
                <p class="w-28 text-right font-semibold text-gray-700 text-sm">{{ formatCurrency(item.price * item.quantity) }}</p>
            </li>
        </ul>
      </div>
      
      <!-- Ringkasan Biaya & Tombol Bayar -->
      <div class="flex-shrink-0 p-5 bg-gray-50 border-t-2 border-gray-200 space-y-4">
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

        <div class="flex justify-between items-center text-xl font-bold text-gray-900">
          <span>Total</span>
          <span class="text-2xl text-teal-600">{{ formatCurrency(cartStore.grandTotal) }}</span>
        </div>

        <!-- LOGIKA @click dan :disabled TIDAK DIUBAH -->
        <button @click="isPaymentModalVisible = true" :disabled="!cartStore.items.length" class="btn btn-primary bg-teal-600 hover:bg-teal-700 border-none text-white w-full h-14 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
