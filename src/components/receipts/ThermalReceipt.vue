<template>
  <div v-if="transaction" class="receipt-container font-mono text-xs text-black bg-white p-1" style="width: 280px;">
    <!-- Bagian Header -->
    <div class="text-center">
      <h2 class="text-sm font-bold uppercase">{{ businessName }}</h2>
      <p class="text-xs">{{ outletName }}</p>
      <p class="text-xs">{{ outletAddress }}</p>
    </div>
    
    <!-- Kembali menggunakan <hr> dengan class untuk styling yang kuat -->
    <hr class="separator">
    
    <table class="w-full text-xs">
      <tbody>
        <tr>
          <td class="text-left">ID:</td>
          <td class="text-right">{{ transaction?.id?.slice(-8).toUpperCase() }}</td>
        </tr>
        <tr>
          <td class="text-left">Tanggal:</td>
          <td class="text-right">{{ new Date(transaction.created_at).toLocaleString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
        </tr>
        <tr>
          <td class="text-left">Kasir:</td>
          <td class="text-right">{{ cashierName }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="customerName">
      <hr class="separator">
      <table class="w-full text-xs">
        <tbody>
          <tr>
            <td class="text-left">Pelanggan:</td>
            <td class="text-right font-semibold">{{ customerName }}</td>
          </tr>
          <tr v-if="customerPhone">
            <td class="text-left">Telepon:</td>
            <td class="text-right">{{ customerPhone }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <hr class="separator">
    
    <!-- Struktur Tabel Utama untuk Item dan Ringkasan -->
    <table class="w-full text-xs">
      <!-- Bagian Daftar Item -->
      <tbody>
        <template v-for="item in transaction.items" :key="item.id">
          <tr>
            <td colspan="2" class="font-semibold">{{ item.product_name }}</td>
          </tr>
          <tr v-if="item.variant_name">
            <td colspan="2" class="pl-2">- {{ item.variant_name }}</td>
          </tr>
          <tr>
            <td class="text-left">{{ item.quantity }} x {{ formatCurrency(item.price_per_item, false) }}</td>
            <td class="text-right">{{ formatCurrency(item.total_price) }}</td>
          </tr>
        </template>
      </tbody>

      <!-- Pemisah antara Item dan Ringkasan -->
      <tbody>
        <tr><td colspan="2"><hr class="separator"></td></tr>
      </tbody>

      <!-- Bagian Ringkasan Biaya -->
      <tbody>
          <tr><td class="text-left">Subtotal</td><td class="text-right">{{ formatCurrency(transaction.total_amount) }}</td></tr>
          <tr v-if="transaction.tax_amount > 0"><td class="text-left">Pajak</td><td class="text-right">{{ formatCurrency(transaction.tax_amount) }}</td></tr>
          <tr v-if="transaction.service_charge_amount > 0"><td class="text-left">Layanan</td><td class="text-right">{{ formatCurrency(transaction.service_charge_amount) }}</td></tr>
      </tbody>

      <!-- Pemisah sebelum Total -->
      <tbody>
        <tr><td colspan="2"><hr class="separator double-line"></td></tr>
      </tbody>
      
      <!-- Bagian Total & Pembayaran -->
      <tbody class="font-bold text-sm">
          <tr><td class="text-left">TOTAL</td><td class="text-right">{{ formatCurrency(transaction.final_amount) }}</td></tr>
          <tr><td class="text-left">BAYAR</td><td class="text-right">{{ formatCurrency(paymentDetails?.amount_paid || transaction.final_amount) }}</td></tr>
          <tr><td class="text-left">KEMBALI</td><td class="text-right">{{ formatCurrency(paymentDetails?.change || 0) }}</td></tr>
      </tbody>
    </table>
 
    <!-- Bagian Footer -->
    <div class="text-center mt-3">
      <p class="text-xs font-semibold">Terima Kasih!</p>
      <p class="text-xs">Powered by Finako</p>
    </div>
  </div>
</template>

<script setup>
// Script setup ini sudah benar dan tidak perlu diubah.
// Ia mendefinisikan semua data yang dibutuhkan oleh template.
defineProps({
  transaction: Object,
  paymentDetails: Object,
  businessName: String,
  outletName: String,
  outletAddress: String,
  cashierName: String,
  customerName: String,
  customerPhone: String,
});
 
function formatCurrency(value, usePrefix = true) {
  if (typeof value !== 'number') return 'Rp 0';
  const prefix = usePrefix ? 'Rp ' : ''; 
  return prefix + new Intl.NumberFormat('id-ID').format(value);
}
</script>
