<template>
    <dialog class="modal" :class="{ 'modal-open': show }" @close="emit('close')">
      <div class="modal-box w-full max-w-md mx-4 md:max-w-lg">
        <!-- Mobile: Bigger close button dengan touch target -->
        <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 touch-target">✕</button>
        
        <h3 class="font-bold text-lg md:text-xl text-gray-800 pr-8 mb-4">
          Pilih Varian untuk {{ product?.name }}
        </h3>
        
        <div class="py-2 space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
          <p v-if="variantsWithDetails.length === 0" class="text-gray-500 text-center py-12">
            <svg class="mx-auto h-12 w-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Tidak ada varian yang tersedia untuk outlet ini.
          </p>
          
          <div 
            v-for="variant in variantsWithDetails" 
            :key="variant.id"
            @click="selectVariant(variant)"
            class="p-4 border-2 rounded-xl flex justify-between items-center transition-all duration-200 touch-target"
            :class="{ 
              'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200': variant.stock <= 0,
              'cursor-pointer hover:border-teal-500 hover:bg-teal-50 border-gray-200 hover:shadow-md': variant.stock > 0
            }"
          >
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 text-base md:text-lg truncate">{{ variant.name }}</p>
              <div class="flex items-center mt-1 space-x-2">
                <p class="text-sm font-medium" :class="getStockColorClass(variant.stock)">
                  <span class="inline-block w-2 h-2 rounded-full mr-1" :class="getStockDotClass(variant.stock)"></span>
                  {{ variant.stock > 0 ? `Stok: ${variant.stock}` : 'Stok Habis' }}
                </p>
              </div>
            </div>
            <div class="flex-shrink-0 ml-4">
              <p class="font-bold text-lg md:text-xl text-teal-600">{{ formatCurrency(variant.price) }}</p>
              <div v-if="variant.stock > 0" class="text-xs text-gray-400 text-right mt-1">Tap untuk pilih</div>
            </div>
          </div>
        </div>
        
        <div class="modal-action pt-4">
            <button @click="emit('close')" class="btn btn-outline w-full md:w-auto touch-target">
              Batal
            </button>
        </div>
      </div>
    </dialog>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    show: Boolean,
    product: Object,
    activeOutletId: String,
  });
  
  const emit = defineEmits(['close', 'variant-selected']);
  
  const variantsWithDetails = computed(() => {
    if (!props.product?.product_variants || !props.activeOutletId) return [];
    
    return props.product.product_variants.map(variant => {
      const outletInfo = variant.product_variant_outlets.find(
        pvo => pvo.outlet_id === props.activeOutletId
      );
      return {
        ...variant,
        product_name: props.product.name,
        price: outletInfo?.price ?? 0,
        stock: outletInfo?.stock_quantity ?? 0,
      };
    });
  });
  
  function selectVariant(variant) {
    if (variant.stock <= 0) {
      return;
    }
    emit('variant-selected', variant);
  }
  
  function formatCurrency(value) {
    if (!value) return 'Gratis';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }
  
  function getStockColorClass(stock) {
    if (stock <= 0) return 'text-red-600';
    if (stock <= 5) return 'text-yellow-600';
    return 'text-green-600';
  }
  
  function getStockDotClass(stock) {
    if (stock <= 0) return 'bg-red-500';
    if (stock <= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  }
  </script>
  