<script setup>
import { ref } from 'vue';

defineProps({
  items: Array,
  total: Number,
  organizationName: String,
  saleId: Number,
});

const receiptElement = ref(null);
defineExpose({ receiptElement });

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
}
function getFormattedDateTime() {
  return new Date().toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}
</script>

<template>
  <div
    ref="receiptElement"
    class="p-4 bg-white text-gray-800 absolute top-0 left-0"
    style="width: 340px; font-family: 'Inter', sans-serif; transform: translateY(-9999px);"
  >
    <header class="text-center mb-4">
      <h1 class="text-xl font-bold uppercase">{{ organizationName || 'Toko Finako' }}</h1>
      <p class="text-xs text-gray-500 mt-1">{{ getFormattedDateTime() }}</p>
      <p class="text-xs text-gray-500">ID Transaksi: #{{ saleId || 'N/A' }}</p>
    </header>

    <div class="border-t border-dashed border-gray-400 my-2"></div>

    <div class="space-y-2 text-sm">
      <div class="flex font-bold">
        <div class="flex-grow">PRODUK</div>
        <div class="w-24 text-right">TOTAL</div>
      </div>
      <div v-for="item in items" :key="item.id" class="flex">
        <div class="flex-grow">
          <p class="font-medium">{{ item.name }}</p>
          <p class="text-xs text-gray-600">{{ item.quantity }} x {{ formatRupiah(item.price) }}</p>
        </div>
        <div class="w-24 text-right font-medium">{{ formatRupiah(item.price * item.quantity) }}</div>
      </div>
    </div>

    <div class="border-t border-dashed border-gray-400 my-2"></div>

    <div class="flex justify-end mt-3">
      <div class="w-48 space-y-1 text-sm">
        <div class="flex justify-between font-bold text-base">
          <span>TOTAL</span>
          <span>{{ formatRupiah(total) }}</span>
        </div>
      </div>
    </div>

    <footer class="text-center mt-6 text-xs text-gray-500">
      <p>Terima kasih telah berbelanja!</p>
      <p class="font-semibold">Powered by Finako</p>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
</style>