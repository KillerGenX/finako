<template>
  <dialog class="modal" :class="{ 'modal-open': show }" @close="emit('close')">
    <div class="modal-box w-11/12 max-w-lg">
      <!-- TOMBOL YANG DIPERBAIKI: Menghapus <form> dan menambahkan kembali @click event -->
      <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      
      <h3 class="font-bold text-xl text-gray-800">Proses Pembayaran</h3>
      
      <div class="py-4 space-y-5">
        
        <!-- 1. Ringkasan Biaya -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="font-bold text-lg text-teal-600">Total Tagihan</span>
            <span class="font-bold text-2xl text-teal-600">{{ formatCurrency(cart.grandTotal) }}</span>
          </div>
        </div>

        <!-- 2. Info Pelanggan (Opsional) -->
        <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-semibold text-gray-700">Info Pelanggan (Opsional)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-2">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Nama</label>
                    <input v-model.trim="customerName" type="text" class="input input-bordered input-sm w-full" placeholder="Nama Pelanggan" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">No. WhatsApp</label>
                    <input v-model.trim="customerPhone" type="tel" class="input input-bordered input-sm w-full" placeholder="Nomor WhatsApp" />
                </div>
            </div>
        </div>

        <!-- 3. Metode Pembayaran & Input Tunai -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
          <select v-model="paymentMethod" class="select select-bordered w-full">
            <option value="Tunai">Uang Tunai (Cash)</option>
            <option value="Kartu">Kartu Debit / Kredit</option>
            <option value="QRIS">QRIS</option>
          </select>

          <!-- Blok ini hanya muncul jika metode pembayaran adalah Tunai -->
          <div v-if="paymentMethod === 'Tunai'" class="mt-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Jumlah Uang Diterima</label>
                <input 
                  v-model.lazy="formattedAmountPaid"
                  ref="amountPaidInput"
                  type="text" 
                  inputmode="decimal"
                  class="input input-bordered w-full text-right text-2xl font-bold mt-1" 
                  placeholder="0" 
                />
              </div>

              <!-- Tombol Uang Cepat -->
              <div class="flex flex-wrap gap-2">
                <button @click.prevent="setAmount(cart.grandTotal)" class="btn btn-sm btn-outline btn-primary">Uang Pas</button>
                <button v-for="cash in quickCashValues" :key="cash" @click.prevent="setAmount(cash)" class="btn btn-sm btn-outline">{{ formatAsCash(cash) }}</button>
              </div>

              <!-- Tampilan Kembalian Real-time -->
              <div v-if="change >= 0 && amountPaid > 0" class="text-right p-3 rounded-lg" :class="change > 0 ? 'bg-green-50' : 'bg-blue-50'">
                <span class="font-medium text-gray-600">Kembalian:</span>
                <span class="font-bold text-2xl ml-2" :class="change > 0 ? 'text-green-600' : 'text-blue-600'">{{ formatCurrency(change) }}</span>
              </div>
          </div>
        </div>
      </div>

      <!-- Tombol Aksi -->
      <div class="modal-action">
        <button 
          @click="submitPayment" 
          class="btn btn-primary bg-teal-600 hover:bg-teal-700 border-none btn-block btn-lg" 
          :disabled="isSubmitting || (paymentMethod === 'Tunai' && amountPaid < cart.grandTotal)"
        >
          <span v-if="isSubmitting" class="loading loading-spinner"></span>
          Konfirmasi & Selesaikan Transaksi
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  show: Boolean,
  cart: Object,
  isSubmitting: Boolean,
});

const emit = defineEmits(['close', 'submit']);

const paymentMethod = ref('Tunai');
const customerName = ref('');
const customerPhone = ref('');
const amountPaid = ref(0);
const amountPaidInput = ref(null);

const quickCashValues = computed(() => {
    const total = props.cart.grandTotal;
    if (total <= 10000) return [10000, 20000, 50000, 100000];
    if (total <= 20000) return [20000, 30000, 50000, 100000];
    if (total <= 50000) return [50000, 60000, 75000, 100000];
    if (total <= 100000) return [100000, 120000, 150000, 200000];
    const nextHighest = Math.ceil(total / 50000) * 50000;
    return [nextHighest, nextHighest + 20000, nextHighest + 50000, nextHighest + 100000];
});

function setAmount(value) {
  amountPaid.value = value;
}

const formattedAmountPaid = computed({
  get() {
    if (amountPaid.value === 0 || amountPaid.value === null) return '';
    return amountPaid.value.toLocaleString('id-ID');
  },
  set(newValue) {
    const digitsOnly = newValue.replace(/[^0-9]/g, '');
    amountPaid.value = Number(digitsOnly);
  }
});

const change = computed(() => {
  if (paymentMethod.value !== 'Tunai' || !props.cart?.grandTotal || amountPaid.value < props.cart.grandTotal) return 0;
  return amountPaid.value - props.cart.grandTotal;
});

function submitPayment() {
  if (props.isSubmitting) return;
  const paymentDetails = {
    payment_method: paymentMethod.value,
    total_amount: props.cart.grandTotal,
    amount_paid: paymentMethod.value === 'Tunai' ? amountPaid.value : props.cart.grandTotal,
    change: change.value,
    customer_name: customerName.value,
    customer_phone: customerPhone.value,
  };
  emit('submit', paymentDetails);
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    if(paymentMethod.value === 'Tunai') {
        nextTick(() => {
            amountPaidInput.value?.focus();
        });
    }
  } else {
    paymentMethod.value = 'Tunai';
    customerName.value = '';
    customerPhone.value = '';
    amountPaid.value = 0;
  }
});

watch(paymentMethod, (newMethod) => {
    if(newMethod === 'Tunai' && props.show){
        nextTick(() => {
            amountPaidInput.value?.focus();
        });
    }
})

function formatCurrency(value) {
  if (typeof value !== 'number') return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}
function formatAsCash(value) {
    if (value >= 1000) return `${value/1000}rb`;
    return value;
}
</script>
