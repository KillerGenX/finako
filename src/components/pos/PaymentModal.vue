<template>
  <dialog class="modal" :class="{ 'modal-open': show }" @close="emit('close')">
    <div class="modal-box w-full max-w-md mx-4 md:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
      
      <!-- Mobile: Sticky header dengan gradient background -->
      <div class="flex-shrink-0 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost absolute right-0 top-0 touch-target">✕</button>
        <h3 class="font-bold text-xl md:text-2xl text-gray-800 pr-8 mb-4">Pembayaran</h3>
        
        <!-- Mobile: Prominent total display dengan gradient -->
        <div class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white shadow-md">
          <div class="text-center">
            <p class="text-sm opacity-90">Total Tagihan</p>
            <p class="text-3xl md:text-4xl font-bold mt-1">{{ formatCurrency(cart.grandTotal) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Scrollable content area -->
      <div class="flex-grow overflow-y-auto py-4 space-y-5">
        
        <!-- Customer info dengan mobile-first layout -->
        <div class="border border-gray-200 rounded-xl p-4">
          <h4 class="font-semibold text-gray-700 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Info Pelanggan (Opsional)
          </h4>
          <div class="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">Nama</label>
              <input 
                v-model.trim="customerName" 
                type="text" 
                class="input input-bordered w-full touch-target no-zoom" 
                placeholder="Nama Pelanggan" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">No. WhatsApp</label>
              <input 
                v-model.trim="customerPhone" 
                type="tel" 
                class="input input-bordered w-full touch-target no-zoom" 
                placeholder="Nomor WhatsApp" 
              />
            </div>
          </div>
        </div>

        <!-- Payment method dengan mobile-first design -->
        <div class="space-y-4">
          <label class="block text-lg font-semibold text-gray-700 flex items-center">
            <svg class="w-6 h-6 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            Metode Pembayaran
          </label>
          <select v-model="paymentMethod" class="select select-bordered w-full text-lg touch-target">
            <option value="Tunai">💵 Uang Tunai (Cash)</option>
            <option value="Kartu">💳 Kartu Debit / Kredit</option>
            <option value="QRIS">📱 QRIS</option>
          </select>
          
          <!-- Enhanced cash input untuk mobile -->
          <div v-if="paymentMethod === 'Tunai'" class="space-y-4">
            <div>
              <label class="block text-lg font-semibold text-gray-700 mb-2">Uang Diterima</label>
              <input 
                v-model.lazy="formattedAmountPaid"
                ref="amountPaidInput"
                type="text" 
                inputmode="decimal"
                class="input input-bordered w-full text-right text-2xl md:text-3xl font-bold touch-target no-zoom" 
                placeholder="0" 
              />
            </div>
            
            <!-- Touch-friendly quick cash buttons -->
            <div class="space-y-3">
              <p class="text-sm font-medium text-gray-600">Pilihan Cepat:</p>
              <div class="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-2">
                <button 
                  @click.prevent="setAmount(cart.grandTotal)" 
                  class="btn btn-outline btn-primary btn-lg touch-target"
                >
                  Uang Pas
                </button>
                <button 
                  v-for="cash in quickCashValues" 
                  :key="cash" 
                  @click.prevent="setAmount(cash)" 
                  class="btn btn-outline btn-lg touch-target"
                >
                  {{ formatAsCash(cash) }}
                </button>
              </div>
            </div>

            <!-- Prominent change display -->
            <div 
              v-if="change >= 0 && amountPaid > 0" 
              class="text-center p-4 rounded-xl border-2 border-dashed shadow-sm"
              :class="change > 0 ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'"
            >
              <p class="text-sm font-medium text-gray-600">Kembalian</p>
              <p class="text-3xl font-bold mt-1" :class="change > 0 ? 'text-green-600' : 'text-blue-600'">
                {{ formatCurrency(change) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sticky bottom action -->
      <div class="flex-shrink-0 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
        <button 
          @click="submitPayment" 
          class="btn btn-primary bg-teal-600 hover:bg-teal-700 border-none w-full btn-lg touch-target text-lg shadow-md" 
          :disabled="isSubmitting || (paymentMethod === 'Tunai' && amountPaid < cart.grandTotal)"
        >
          <span v-if="isSubmitting" class="loading loading-spinner"></span>
          <svg v-else class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ isSubmitting ? 'Memproses...' : 'Konfirmasi Pembayaran' }}
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

<style scoped>
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

.no-zoom {
  font-size: 16px !important;
  transform: none;
}

/* Mobile optimization untuk input fields */
@media (max-width: 768px) {
  input[type="text"], 
  input[type="tel"],
  select {
    font-size: 16px !important;
  }
  
  .input-bordered:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
  }
}

/* Smooth transitions */
.modal-box {
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* CSS untuk mencegah input berubah warna saat auto-fill */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px white inset !important;
    -webkit-text-fill-color: black !important;
}
</style>
