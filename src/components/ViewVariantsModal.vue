<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
    <div class="bg-white rounded-t-2xl md:rounded-lg shadow-xl w-full max-w-full md:max-w-3xl h-[95vh] md:max-h-[90vh] flex flex-col">
      
      <!-- Sticky Header -->
      <div class="flex-shrink-0 bg-white border-b border-gray-100 px-4 md:px-6 py-4 rounded-t-2xl md:rounded-t-lg">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg md:text-xl font-bold text-gray-800">Detail Varian Produk</h3>
          <button 
            @click="$emit('close')"
            class="btn btn-ghost btn-sm btn-circle touch-target"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-sm text-gray-600">
            <span class="font-semibold text-teal-600">{{ product?.name || '' }}</span>
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Outlet: <span class="font-medium text-teal-600">{{ outletName }}</span>
          </p>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        <!-- Mobile: Card Layout -->
        <div class="block md:hidden space-y-3">
          <div v-for="variant in product?.product_variants || []" :key="variant.id" 
               class="bg-white border border-gray-200 rounded-xl p-4">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4 class="font-semibold text-gray-800 mb-1">{{ variant.name }}</h4>
                <p class="text-xs text-gray-500">SKU: {{ variant.sku || '-' }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-teal-600">{{ formatCurrency(getVariantPrice(variant)) }}</p>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Stok Tersedia</span>
                <span class="font-semibold text-gray-800">{{ getVariantStock(variant) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Empty State untuk Mobile -->
          <div v-if="!product?.product_variants?.length" class="text-center py-8">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <p class="text-gray-500">Produk ini tidak memiliki varian</p>
          </div>
        </div>

        <!-- Desktop: Table Layout -->
        <div class="hidden md:block">
          <div class="overflow-x-auto border border-gray-200 rounded-xl">
            <table class="table w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left font-medium text-gray-600">Nama Varian</th>
                  <th class="text-left font-medium text-gray-600">SKU</th>
                  <th class="text-right font-medium text-gray-600">Harga di Outlet</th>
                  <th class="text-center font-medium text-gray-600">Stok di Outlet</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="variant in product?.product_variants || []" :key="variant.id" class="hover:bg-gray-50">
                  <td class="font-semibold text-gray-800">{{ variant.name }}</td>
                  <td class="text-gray-600">{{ variant.sku || '-' }}</td>
                  <td class="text-right font-semibold text-teal-600">{{ formatCurrency(getVariantPrice(variant)) }}</td>
                  <td class="text-center font-semibold text-gray-800">{{ getVariantStock(variant) }}</td>
                </tr>
                <tr v-if="!product?.product_variants?.length">
                  <td colspan="4" class="text-center py-8 text-gray-500">
                    Produk ini tidak memiliki varian
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="flex-shrink-0 bg-white border-t border-gray-100 px-4 md:px-6 py-4 pb-safe rounded-b-2xl md:rounded-b-lg">
        <button 
          class="btn btn-outline w-full touch-target" 
          @click="$emit('close')"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'; // <-- INILAH PERBAIKANNYA!

const props = defineProps({
  show: Boolean,
  product: Object,
  activeOutletId: String,
  outlets: Array,
});

defineEmits(['close']);

const outletName = computed(() => {
    // Tambahkan pengecekan untuk props.outlets agar tidak error saat pertama kali render
    if (!props.outlets || !props.activeOutletId) return 'Memuat...';
    return props.outlets.find(o => o.id === props.activeOutletId)?.name || 'Tidak Diketahui';
});

function getVariantStock(variant) {
    if (!variant || !variant.product_variant_outlets) return 0;
    const outletInfo = variant.product_variant_outlets.find(pvo => pvo.outlet_id === props.activeOutletId);
    return outletInfo?.stock_quantity ?? 0;
}

function getVariantPrice(variant) {
    if (!variant) return 0;
    const outletInfo = variant.product_variant_outlets?.find(pvo => pvo.outlet_id === props.activeOutletId);
    return outletInfo?.price ?? variant.price ?? 0;
}

function formatCurrency(value) {
    if (typeof value !== 'number') return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}
</script>

<style scoped>
/* Mobile-first responsive styles */
.touch-target {
  min-height: 44px; /* iOS touch target minimum */
  touch-action: manipulation;
}

/* Safe area handling for mobile devices */
.pb-safe {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

/* Responsive modal sizing */
@media (max-width: 768px) {
  .modal-box {
    margin: 0;
    border-radius: 16px 16px 0 0;
    height: 95vh;
  }
}

/* Enhanced mobile styling */
@media (max-width: 640px) {
  .btn {
    padding: 12px 20px;
    font-size: 16px;
    font-weight: 600;
  }
  
  /* Better spacing for mobile */
  .space-y-3 > * + * {
    margin-top: 12px;
  }
}

/* Improved styling */
.border-gray-100 {
  border-color: rgb(243 244 246);
}

.border-gray-200 {
  border-color: rgb(229 231 235);
}

.bg-gray-50 {
  background-color: rgb(249 250 251);
}

.hover\:bg-gray-50:hover {
  background-color: rgb(249 250 251);
}

.text-teal-600 {
  color: rgb(13 148 136);
}
</style>