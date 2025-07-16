<template>
    <div v-if="transaction" class="receipt-container font-mono text-xs text-black bg-white p-1" style="width: 280px;">
      <div class="text-center">
        <h2 class="text-sm font-bold uppercase">{{ businessName }}</h2>
        <p class="text-xs">{{ outletName }}</p>
        <p class="text-xs">{{ outletAddress }}</p>
      </div>
      
      <hr class="border-dashed border-black my-2">
      
      <table class="w-full text-xs">
        <tr>
          <td>ID:</td>
          <td class="text-right">{{ transaction?.id?.slice(-8).toUpperCase() }}</td>
        </tr>
        <tr>
          <td>Tanggal:</td>
          <td class="text-right">{{ new Date(transaction.created_at).toLocaleString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
        </tr>
        <tr>
          <td>Kasir:</td>
          <td class="text-right">{{ cashierName }}</td>
        </tr>
      </table>
      
      <hr class="border-dashed border-black my-2">
      
      <!-- =============================================== -->
      <!-- === BAGIAN DAFTAR ITEM YANG DIPERBAIKI === -->
      <!-- =============================================== -->
      <div v-for="item in transaction.items" :key="item.id" class="text-xs">
          <p class="font-semibold">{{ item.product_name }}</p>
          <p v-if="item.variant_name" class="pl-2">- {{ item.variant_name }}</p>
          <table class="w-full">
              <tr>
                  <td class="text-left">{{ item.quantity }} x {{ formatCurrency(item.price_per_item, false) }}</td>
                  <td class="text-right">{{ formatCurrency(item.total_price, false) }}</td>
              </tr>
          </table>
      </div>
      <!-- =============================================== -->
      
      <hr class="border-dashed border-black my-2">
  
      <!-- Ringkasan Biaya (juga menggunakan tabel) -->
      <table class="w-full text-xs">
          <tbody>
              <tr><td>Subtotal</td><td class="text-right">{{ formatCurrency(transaction.total_amount) }}</td></tr>
              <tr v-if="transaction.tax_amount > 0"><td>Pajak</td><td class="text-right">{{ formatCurrency(transaction.tax_amount) }}</td></tr>
              <tr v-if="transaction.service_charge_amount > 0"><td>Layanan</td><td class="text-right">{{ formatCurrency(transaction.service_charge_amount) }}</td></tr>
          </tbody>
      </table>
      
      <hr class="border-t-2 border-dashed border-black my-2">
  
      <table class="w-full font-bold text-sm">
          <tbody>
              <tr><td>TOTAL</td><td class="text-right">{{ formatCurrency(transaction.final_amount) }}</td></tr>
              <tr><td>BAYAR</td><td class="text-right">{{ formatCurrency(paymentDetails?.amount_paid || transaction.final_amount) }}</td></tr>
              <tr><td>KEMBALI</td><td class="text-right">{{ formatCurrency(paymentDetails?.change || 0) }}</td></tr>
          </tbody>
      </table>
  
      <div class="text-center mt-3">
        <p class="text-xs font-semibold">Terima Kasih!</p>
        <p class="text-xs">Powered by Finako</p>
      </div>
    </div>
  </template>
  
  <script setup>
  // Script setup tidak perlu diubah sama sekali
  defineProps({
    transaction: Object,
    paymentDetails: Object,
    businessName: String,
    outletName: String,
    outletAddress: String,
    cashierName: String,
  });
  
  function formatCurrency(value, usePrefix = true) {
    if (typeof value !== 'number') return '0';
    const prefix = usePrefix ? 'Rp ' : '';
    return prefix + new Intl.NumberFormat('id-ID').format(value);
  }
  </script>