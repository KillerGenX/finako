<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Proses Pembayaran</h3>
      <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      
      <div class="py-4">
        <!-- Ringkasan Biaya -->
        <div class="p-4 bg-base-200 rounded-lg space-y-2 mb-4">
          <div class="flex justify-between text-sm"><span class="text-gray-600">Subtotal</span><span>{{ formatCurrency(cart.subtotal) }}</span></div>
          <div v-if="cart.taxAmount > 0" class="flex justify-between text-sm"><span class="text-gray-600">Pajak</span><span>{{ formatCurrency(cart.taxAmount) }}</span></div>
          <div v-if="cart.serviceChargeAmount > 0" class="flex justify-between text-sm"><span class="text-gray-600">Biaya Layanan</span><span>{{ formatCurrency(cart.serviceChargeAmount) }}</span></div>
          <div class="divider my-1"></div>
          <div class="flex justify-between text-xl font-bold"><span class="text-primary">Total Bayar</span><span class="text-primary">{{ formatCurrency(cart.grandTotal) }}</span></div>
        </div>

        <!-- === PERUBAHAN: Form Info Pelanggan (Opsional) === -->
        <div class="space-y-3 p-4 border border-base-300 rounded-lg mb-4">
            <h4 class="font-semibold text-sm">Info Pelanggan (Opsional)</h4>
            <div class="form-control">
                <label class="label py-1"><span class="label-text text-xs">Nama Pelanggan</span></label>
                <input v-model.trim="customerName" type="text" class="input input-bordered input-sm" placeholder="Contoh: Budi" />
            </div>
            <div class="form-control">
                <label class="label py-1"><span class="label-text text-xs">No. WhatsApp Pelanggan</span></label>
                <input v-model.trim="customerPhone" type="tel" class="input input-bordered input-sm" placeholder="Contoh: 08123456789" />
            </div>
        </div>
        <!-- === AKHIR PERUBAHAN === -->

        <!-- Pilihan Metode Pembayaran -->
        <div class="form-control">
          <label class="label"><span class="label-text">Metode Pembayaran</span></label>
          <select v-model="paymentMethod" class="select select-bordered w-full">
            <option value="Tunai">Tunai</option>
            <option value="Kartu">Kartu Debit/Kredit</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>

        <!-- Form untuk Pembayaran Tunai -->
        <div v-if="paymentMethod === 'Tunai'" class="form-control mt-4">
          <label class="label"><span class="label-text">Uang Diterima</span></label>
          <input v-model.number="amountPaid" type="number" class="input input-bordered" placeholder="Masukkan jumlah uang tunai" />
          <label v-if="change > 0" class="label">
            <span class="label-text-alt text-lg">Kembalian: <span class="font-bold text-success">{{ formatCurrency(change) }}</span></span>
          </label>
        </div>
      </div>

      <div class="modal-action">
        <button @click="submitPayment" class="btn btn-primary btn-block" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="loading loading-spinner"></span>
          Konfirmasi Pembayaran
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  show: Boolean,
  cart: Object, // Menerima seluruh object cartStore (getters)
  isSubmitting: Boolean,
});

const emit = defineEmits(['close', 'submit']);

const paymentMethod = ref('Tunai');
const amountPaid = ref(0);
// === PERUBAHAN: State untuk info pelanggan ===
const customerName = ref('');
const customerPhone = ref('');
// === AKHIR PERUBAHAN ===

const change = computed(() => {
  if (paymentMethod.value !== 'Tunai' || !props.cart?.grandTotal || !amountPaid.value) return 0;
  const changeAmount = amountPaid.value - props.cart.grandTotal;
  return changeAmount > 0 ? changeAmount : 0;
});

function submitPayment() {
  const paymentDetails = {
    payment_method: paymentMethod.value,
    total_amount: props.cart.grandTotal,
    amount_paid: paymentMethod.value === 'Tunai' ? amountPaid.value : props.cart.grandTotal,
    change: change.value,
    // === PERUBAHAN: Kirim data pelanggan saat emit ===
    customer_name: customerName.value,
    customer_phone: customerPhone.value,
    // === AKHIR PERUBAHAN ===
  };
  emit('submit', paymentDetails);
}

function formatCurrency(value) {
  if (typeof value !== 'number') return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}
</script>