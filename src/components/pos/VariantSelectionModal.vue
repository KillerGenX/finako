<template>
    <dialog class="modal" :class="{ 'modal-open': show }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Pilih Varian untuk {{ product?.name }}</h3>
        <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        
        <div class="py-4 space-y-2">
          <p v-if="variantsWithDetails.length === 0" class="text-gray-500">Tidak ada varian yang tersedia untuk outlet ini.</p>
          
          <div 
            v-for="variant in variantsWithDetails" 
            :key="variant.id"
            @click="selectVariant(variant)"
            class="p-4 border rounded-lg flex justify-between items-center cursor-pointer hover:border-primary hover:bg-primary-content"
            :class="{ 'opacity-50 cursor-not-allowed': variant.stock <= 0 }"
          >
            <div>
              <p class="font-semibold">{{ variant.name }}</p>
              <p class="text-sm text-gray-500">Stok: {{ variant.stock }}</p>
            </div>
            <p class="font-bold text-primary">{{ formatCurrency(variant.price) }}</p>
          </div>
        </div>
      </div>
    </dialog>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    show: Boolean,
    product: Object, // Produk master yang punya varian
    activeOutletId: String,
  });
  
  const emit = defineEmits(['close', 'variant-selected']);
  
  // Olah data varian untuk mendapatkan harga & stok di outlet aktif
  const variantsWithDetails = computed(() => {
    if (!props.product?.product_variants || !props.activeOutletId) return [];
    
    return props.product.product_variants.map(variant => {
      const outletInfo = variant.product_variant_outlets.find(
        pvo => pvo.outlet_id === props.activeOutletId
      );
      return {
        ...variant, // data asli varian (id, name, dll)
        product_name: props.product.name, // bawa nama produk masternya
        price: outletInfo?.price ?? 0,
        stock: outletInfo?.stock_quantity ?? 0,
      };
    });
  });
  
  function selectVariant(variant) {
    if (variant.stock <= 0) {
      // Bisa tambahkan notifikasi di sini
      return;
    }
    emit('variant-selected', variant);
  }
  
  function formatCurrency(value) {
    if (!value) return 'Gratis';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }
  </script>