<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-2xl">
      <h3 class="text-xl font-bold mb-1">Detail Varian Produk</h3>
      <p class="text-base-content/70 mb-4">
        Produk: <span class="font-semibold">{{ product?.name || '' }}</span> | 
        Outlet: <span class="font-semibold">{{ outletName }}</span>
      </p>

      <div class="max-h-80 overflow-y-auto">
        <table class="table table-compact w-full">
          <thead>
            <tr>
              <th>Nama Varian</th>
              <th>SKU</th>
              <th>Harga di Outlet</th>
              <th>Stok di Outlet</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="variant in product?.product_variants || []" :key="variant.id">
              <td>{{ variant.name }}</td>
              <td>{{ variant.sku || '-' }}</td>
              <td>{{ formatCurrency(getVariantPrice(variant)) }}</td>
              <td>{{ getVariantStock(variant) }}</td>
            </tr>
            <tr v-if="!product?.product_variants?.length">
                <td colspan="4" class="text-center">Produk ini tidak memiliki varian.</td>
            </tr>
          </tbody>
        </table>
      </div>

       <!-- Tombol Tutup -->
       <div class="flex justify-end mt-6">
        <button class="btn" @click="$emit('close')">Tutup</button>
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