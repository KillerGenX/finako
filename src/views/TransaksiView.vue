<template>
  <div class="flex h-screen bg-base-200 overflow-hidden">
    
    <!-- Kolom Kiri: Katalog Produk -->
    <div class="flex flex-col w-3/5">
      <!-- Header Katalog -->
      <div class="flex-shrink-0 p-4 bg-base-100 border-b">
        <div class="flex items-center space-x-4">
          <input type="text" placeholder="Cari produk (nama atau SKU)..." class="input input-bordered w-full" v-model="searchQuery" />
          <select class="select select-bordered w-64" v-model="selectedCategoryId">
            <option value="">Semua Kategori</option>
            <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>

      <!-- Grid Produk (dengan scroll dan padding) -->
      <div class="flex-grow overflow-y-auto p-4">
        <div v-if="productStore.isLoading" class="flex justify-center items-center h-full pt-16">
            <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="card bg-base-100 shadow-md hover:shadow-xl hover:border-primary border-2 border-transparent transition-all duration-200 cursor-pointer"
            @click="product.has_variants ? openVariantModal(product) : cartStore.addProductToCart(product)"
          >
            <figure class="relative">
              <img :src="product.photo_url || '/finako.svg'" alt="Product" class="h-32 w-full object-cover" />
              <div v-if="product.stock <= 0" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span class="badge badge-error">STOK HABIS</span>
              </div>
            </figure>
            <div class="card-body p-3">
              <h2 class="card-title text-sm leading-tight line-clamp-2">{{ product.name }}</h2>
              <p class="text-primary font-bold mt-1">{{ formatCurrency(product.price) }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16 text-gray-400">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p class="mt-2">Tidak ada produk yang ditemukan.</p>
        </div>
      </div>
    </div>

    <!-- Kolom Kanan: Keranjang (dengan styling Green Teal) -->
    <div class="w-2/5 flex flex-col bg-white border-l-2 border-base-300">
      <!-- Header Keranjang -->
      <div class="flex-shrink-0 p-4 border-b-2 border-base-300 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">Pesanan Saat Ini ({{ cartStore.totalItems }} item)</h2>
          <button @click="cartStore.clearCart()" class="btn btn-ghost btn-sm text-error" :disabled="!cartStore.items.length">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Kosongkan
          </button>
      </div>
      
      <!-- Daftar Item Keranjang (area scroll) -->
      <div class="flex-grow overflow-y-auto p-4">
        <!-- Jika keranjang kosong -->
        <div v-if="!cartStore.items.length" class="flex flex-col justify-center items-center h-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <p class="mt-4">Pilih produk dari katalog</p>
        </div>
        
        <!-- Jika ada item di keranjang -->
        <div v-else class="space-y-3">
            <div v-for="item in cartStore.items" :key="item.cartItemId" class="flex items-center space-x-3 bg-base-100 p-2 rounded-lg">
                <img :src="item.photo_url || '/finako.svg'" class="w-16 h-16 rounded-md object-cover">
                <div class="flex-grow">
                    <p class="font-semibold text-sm line-clamp-1">{{ item.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatCurrency(item.price) }}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button @click="cartStore.decrementQuantity(item.cartItemId)" class="btn btn-xs btn-square btn-ghost">-</button>
                    <input type="number" :value="item.quantity" @change="e => cartStore.updateQuantity(item.cartItemId, parseInt(e.target.value))" class="input input-xs w-12 text-center" />
                    <button @click="cartStore.incrementQuantity(item.cartItemId)" class="btn btn-xs btn-square btn-ghost">+</button>
                </div>
                <p class="w-24 text-right font-semibold text-sm">{{ formatCurrency(item.price * item.quantity) }}</p>
            </div>
        </div>
      </div>
      
      <!-- Ringkasan Biaya & Tombol Bayar -->
      <div class="flex-shrink-0 p-6 bg-base-100 border-t-2 border-base-300 space-y-2">
      <!-- Subtotal -->
      <div class="flex justify-between text-md">
        <span class="text-gray-600">Subtotal</span>
        <span class="font-medium">{{ formatCurrency(cartStore.subtotal) }}</span>
      </div>

      <!-- Pajak (hanya tampil jika ada) -->
      <div v-if="cartStore.taxAmount > 0" class="flex justify-between text-md">
        <span class="text-gray-600">Pajak ({{ userStore.business?.tax_percent }}%)</span>
        <span class="font-medium">{{ formatCurrency(cartStore.taxAmount) }}</span>
      </div>

      <!-- Biaya Layanan (hanya tampil jika ada) -->
      <div v-if="cartStore.serviceChargeAmount > 0" class="flex justify-between text-md">
        <span class="text-gray-600">Biaya Layanan ({{ userStore.business?.service_charge_percent }}%)</span>
        <span class="font-medium">{{ formatCurrency(cartStore.serviceChargeAmount) }}</span>
      </div>
      
      <!-- Garis Pemisah -->
      <div class="pt-2 border-t border-dashed"></div>

      <!-- Total Akhir -->
      <div class="flex justify-between text-2xl font-bold text-teal-600 pt-1">
        <span>Total</span>
        <span>{{ formatCurrency(cartStore.grandTotal) }}</span>
      </div>

      <!-- Tombol Bayar -->
      <button @click="isPaymentModalVisible = true" class="btn btn-primary ...">Bayar</button>
    </div>
  </div>
  
  <VariantSelectionModal
  :show="isVariantModalVisible"
  :product="productForVariantSelection"
  :active-outlet-id="activeOutletId"
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
import { ref, computed, onMounted, watch } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/stores/cartStore';
//import { useUserStoreRefactored } from '@/stores/userStoreRefactored';//
import { storeToRefs } from 'pinia'; // Impor storeToRefs
import VariantSelectionModal from '@/components/pos/VariantSelectionModal.vue';
import PaymentModal from '@/components/pos/PaymentModal.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import TransactionSuccessModal from '@/components/pos/TransactionSuccessModal.vue';
import { useUserStoreRefactored, useUIStore } from '@/stores/userStoreRefactored';

// Inisialisasi Stores
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

// Gunakan storeToRefs untuk mendapatkan state reaktif
const { categories, productsForSale, isLoading } = storeToRefs(productStore);
const { outlets } = storeToRefs(productStore); // Kita butuh daftar outlet juga

// State Lokal
const searchQuery = ref('');
const selectedCategoryId = ref('');
const activeOutletId = ref(null); // State lokal untuk outlet aktif

// Ambil data saat komponen dimuat
onMounted(() => {
  if (productStore.products.length === 0) {
    productStore.fetchInitialData().then(() => {
      productStore.fetchProducts();
    });
  }
});

// ========================================================
// === INI BAGIAN PERBAIKANNYA ===
// ========================================================

// 1. Watcher untuk mengatur outlet default secara otomatis
watch(outlets, (newOutlets) => {
  // Jika daftar outlet sudah ada DAN outlet aktif lokal belum terpilih,
  // set outlet pertama sebagai default.
  if (newOutlets && newOutlets.length > 0 && !activeOutletId.value) {
    activeOutletId.value = newOutlets[0].id;
  }
}, { immediate: true });

// 2. Watcher untuk memberitahu userStore tentang outlet yang aktif
watch(activeOutletId, (newId) => {
  // Setiap kali outlet lokal berubah, update juga store global
  // agar halaman lain (jika ada) ikut sinkron.
  if (newId) {
    userStore.activeOutletId = newId;
  }
});

// 3. Computed untuk memfilter produk (sekarang sudah aman)
const filteredProducts = computed(() => {
  // Guard clause: Jangan lakukan apa-apa jika getter belum siap
  if (!productsForSale.value) return [];
  
  let products = productsForSale.value;

  if (searchQuery.value) {
    products = products.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
  }
  if (selectedCategoryId.value) {
    products = products.filter(p => p.category_id === selectedCategoryId.value);
  }

  return products;
});
// ========================================================


// Helper untuk format mata uang
function formatCurrency(value) {
  if (value === 0) return 'Rp 0';
  if (!value || typeof value !== 'number') return 'Pilih Varian'; // Diperbarui untuk kasus varian
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}
function openVariantModal(product) {
  productForVariantSelection.value = product;
  isVariantModalVisible.value = true;
}

function handleVariantSelected(variant) {
  // `variant` adalah objek varian dari modal.
  // `productForVariantSelection.value` adalah objek produk induk lengkap.

  // Buat objek baru yang diperkaya dengan SEMUA data yang kita butuhkan.
  const enrichedVariant = {
    ...variant, // Data varian (id, name, price, stock)
    
    // === INI PERBAIKANNYA ===
    product_id: productForVariantSelection.value.id, // Ambil ID produk dari induknya
    has_variants: true, // Tambahkan flag ini secara eksplisit
    // ========================

    photo_url: productForVariantSelection.value?.photo_url, // URL foto dari induknya
  };

  // Kirim objek yang sudah super lengkap ini ke store.
  cartStore.addVariantToCart(enrichedVariant);
  
  isVariantModalVisible.value = false;
}

async function handlePaymentSubmit(paymentDetails) {
  const { success, transactionId, error } = await transactionStore.submitTransaction(paymentDetails);
  if (success) {
    isPaymentModalVisible.value = false; // Tutup modal pembayaran
    lastTransactionId.value = transactionId; // Simpan ID transaksi
    lastPaymentDetails.value = paymentDetails; // Simpan detail pembayaran
    isSuccessModalVisible.value = true; // Buka modal sukses
  } else {
    uiStore.showNotification(error || 'Transaksi Gagal', 'error');
  }
}

function handleNewTransaction() {
    isSuccessModalVisible.value = false;
    lastTransactionId.value = null;
    lastPaymentDetails.value = null;
    // Keranjang sudah otomatis dibersihkan oleh store
}



</script>