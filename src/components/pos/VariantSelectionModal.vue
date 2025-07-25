<template>
    <dialog class="modal" :class="{ 'modal-open': show }" @close="emit('close')">
      <div class="modal-box">
        <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 class="font-bold text-lg text-gray-800">Pilih Varian untuk {{ product?.name }}</h3>
        
        <div class="py-4 space-y-2">
          <p v-if="variantsWithDetails.length === 0" class="text-gray-500 text-center py-8">
            Tidak ada varian yang tersedia untuk outlet ini.
          </p>
          
          <div 
            v-for="variant in variantsWithDetails" 
            :key="variant.id"
            @click="selectVariant(variant)"
            class="p-4 border rounded-lg flex justify-between items-center transition-all duration-200"
            :class="{ 
              'opacity-50 cursor-not-allowed bg-gray-100': variant.stock <= 0,
              'cursor-pointer hover:border-teal-500 hover:bg-teal-50': variant.stock > 0
            }"
          >
            <div>
              <p class="font-semibold text-gray-800">{{ variant.name }}</p>
              <p 
                class="text-sm font-medium"
                :class="{
                  'text-green-600': variant.stock > 5,
                  'text-yellow-600': variant.stock > 0 && variant.stock <= 5,
                  'text-red-600': variant.stock <= 0,
                }"
              >
                Stok: {{ variant.stock > 0 ? variant.stock : 'Habis' }}
              </p>
            </div>
            <p class="font-bold text-lg text-teal-600">{{ formatCurrency(variant.price) }}</p>
          </div>
        </div>
        <div class="modal-action">
            <button @click="emit('close')" class="btn">Tutup</button>
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
  </script>
  