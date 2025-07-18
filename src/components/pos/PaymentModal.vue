<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Proses Pembayaran</h3>
      <button @click="emit('close')" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      
      <div class="py-4 space-y-4">
        
        <!-- =============================================== -->
        <!-- 1. RINGKASAN BIAYA (Dibuat lebih rapi dengan tabel) -->
        <!-- =============================================== -->
        <div class="text-sm">
          <table class="w-full">
            <tbody>
              <tr>
                <td class="py-1 text-gray-600">Subtotal</td>
                <td class="py-1 text-right">{{ formatCurrency(cart.subtotal, false) }}</td>
              </tr>
              <tr v-if="cart.taxAmount > 0">
                <td class="py-1 text-gray-600">Pajak</td>
                <td class="py-1 text-right">{{ formatCurrency(cart.taxAmount, false) }}</td>
              </tr>
              <tr v-if="cart.serviceChargeAmount > 0">
                <td class="py-1 text-gray-600">Biaya Layanan</td>
                <td class="py-1 text-right">{{ formatCurrency(cart.serviceChargeAmount, false) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2"><div class="divider my-1"></div></td>
              </tr>
              <tr class="font-bold text-lg">
                <td class="py-1 text-primary">Total Bayar</td>
                <td class="py-1 text-right text-primary">{{ formatCurrency(cart.grandTotal) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- =============================================== -->
        <!-- 2. INFO PELANGGAN (Layout diperbaiki) -->
        <!-- =============================================== -->
        <div class="space-y-2 p-4 border border-base-300 rounded-lg">
            <h4 class="font-semibold text-sm -mt-1">Info Pelanggan (Opsional)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <div class="form-control">
                    <label class="label py-1"><span class="label-text text-xs">Nama Pelanggan</span></label>
                    <input v-model.trim="customerName" type="text" class="input input-bordered input-sm" placeholder="Contoh: Budi" />
                </div>
                <div class="form-control">
                    <label class="label py-1"><span class="label-text text-xs">No. WhatsApp</span></label>
                    <input v-model.trim="customerPhone" type="tel" class="input input-bordered input-sm" placeholder="Contoh: 08123456789" />
                </div>
            </div>
        </div>

        <!-- =============================================== -->
        <!-- 3. METODE PEMBAYARAN & INPUT TUNAI (UX Ditingkatkan) -->
        <!-- =============================================== -->
        <div class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Metode Pembayaran</span></label>
            <select v-model="paymentMethod" class="select select-bordered w-full">
              <option value="Tunai">Tunai</option>
              <option value="Kartu">Kartu Debit/Kredit</option>
              <option value="QRIS">QRIS</option>
            </select>
          </div>

          <!-- Form untuk Pembayaran Tunai yang disempurnakan -->
          <div v-if="paymentMethod === 'Tunai'" class="space-y-3">
              <div class="form-control">
                <label class="label"><span class="label-text">Uang Diterima</span></label>
                <!-- Input baru yang terformat otomatis -->
                <input v-model="formattedAmountPaid" type="tel" class="input input-bordered text-right text-lg font-semibold" placeholder="0" />
              </div>

              <!-- Tombol Cepat -->
              <div class="flex flex-wrap gap-2">
                <button @click="setAmount(cart.grandTotal)" class="btn btn-sm btn-outline">Uang Pas</button>
                <button v-for="cash in quickCashValues" :key="cash" @click="setAmount(cash)" class="btn btn-sm btn-outline">{{ formatCurrency(cash, false) }}</button>
              </div>

              <!-- Tampilan Kembalian -->
              <div v-if="change > 0" class="text-right text-lg">
                <span>Kembalian: <span class="font-bold text-success">{{ formatCurrency(change) }}</span></span>
              </div>
          </div>
        </div>
      </div>

      <!-- Tombol Aksi (tidak berubah) -->
      <div class="modal-action">
        <button @click="submitPayment" class="btn btn-primary btn-block" :disabled="isSubmitting || (paymentMethod === 'Tunai' && amountPaid < cart.grandTotal)">
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

// --- Variabel State (tidak banyak berubah) ---
const paymentMethod = ref('Tunai');
const customerName = ref('');
const customerPhone = ref('');

// Ini adalah "Sumber Kebenaran Tunggal" untuk jumlah yang dibayar.
// Isinya selalu angka murni, contoh: 100000
const amountPaid = ref(0);

// --- Tombol Cepat ---
const quickCashValues = [10000, 20000, 50000, 100000];
function setAmount(value) {
  amountPaid.value = value;
}

// --- LOGIKA INPUT TERFORMAT OTOMATIS (Bagian Paling Penting) ---
const formattedAmountPaid = computed({
  // GETTER: Apa yang DITAMPILKAN ke pengguna
  get() {
    if (amountPaid.value === 0 || amountPaid.value === null) return '';
    // Ubah angka `100000` menjadi string `"100.000"`
    return amountPaid.value.toLocaleString('id-ID');
  },
  // SETTER: Apa yang terjadi saat pengguna MENGETIK
  set(newValue) {
    // Ambil string input (misal: "100.000") dan hapus semua yg bukan angka
    const digitsOnly = newValue.replace(/[^0-9]/g, '');
    // Ubah kembali menjadi angka murni dan simpan di state
    amountPaid.value = Number(digitsOnly);
  }
});


// --- Computed Properties (Logika Kembalian tidak berubah) ---
const change = computed(() => {
  if (paymentMethod.value !== 'Tunai' || !props.cart?.grandTotal || !amountPaid.value) return 0;
  const changeAmount = amountPaid.value - props.cart.grandTotal;
  return changeAmount >= 0 ? changeAmount : 0; // Tampilkan 0 jika uang kurang
});

// --- Fungsi Aksi (tidak berubah, karena `amountPaid` tetap angka murni) ---
function submitPayment() {
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

// --- Fungsi Helper (sedikit diubah untuk fleksibilitas) ---
function formatCurrency(value, usePrefix = true) {
  if (typeof value !== 'number') return 'Rp 0';
  const options = {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // Pastikan tidak ada desimal
  };
  if (!usePrefix) {
    // Jika tidak mau pakai "Rp", kita gunakan style 'decimal'
    return new Intl.NumberFormat('id-ID').format(value);
  }
  return new Intl.NumberFormat('id-ID', options).format(value);
}
</script>