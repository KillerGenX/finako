<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box">
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 class="font-bold text-lg">Transaksi Berhasil!</h3>
        <p class="py-2 text-sm">ID Transaksi: {{ transactionId }}</p>
      </div>
      
      <div class="modal-action flex-col space-y-2 mt-4">
        <button @click="emit('newTransaction')" class="btn btn-primary w-full">Transaksi Baru</button>
        <button @click="handlePrint" class="btn btn-outline w-full">Cetak Struk</button>
        <button @click="handleSendWhatsApp" class="btn btn-outline w-full btn-success" :class="{ 'loading': isGeneratingPdf }" :disabled="isGeneratingPdf">
          Kirim via WhatsApp
        </button>
      </div>

      <div v-if="pdfError" role="alert" class="alert alert-error text-sm mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ pdfError }}</span>
      </div>
      
      <!-- Struk tersembunyi untuk keperluan cetak DAN render PDF -->
      <div class="absolute -left-[9999px]">
        <div ref="printableReceipt">
            <ThermalReceipt 
              v-if="fullTransactionData"
              :transaction="fullTransactionData"
              :paymentDetails="paymentDetails"
              :businessName="userStore.business?.name"
              :outletName="activeOutlet?.name"
              :outletAddress="activeOutlet?.address"
              :cashierName="userStore.userFullName"
              :customerName="props.customerName"
              :customerPhone="props.customerPhone"
            />
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { supabase } from '@/supabase';
import ThermalReceipt from '@/components/receipts/ThermalReceipt.vue';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import { useProductStore } from '@/stores/productStore';

const props = defineProps({
  show: Boolean,
  transactionId: String,
  paymentDetails: Object,
  customerName: String,
  customerPhone: String,
});

const emit = defineEmits(['newTransaction']);

const userStore = useUserStoreRefactored();
const productStore = useProductStore();

const fullTransactionData = ref(null);
const printableReceipt = ref(null); // Ref untuk menunjuk ke div struk
const isGeneratingPdf = ref(false);
const pdfError = ref(null);

const activeOutlet = computed(() => 
  productStore.outlets.find(o => o.id === userStore.activeOutletId)
);

watch(() => props.show, (newVal) => {
  if (!newVal) {
    pdfError.value = null;
    fullTransactionData.value = null;
  }
});

// Fungsi ini tidak berubah
async function fetchTransactionDetails() {
  if (!props.transactionId || fullTransactionData.value) return; 
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, transaction_items(*, products(name), product_variants(name))')
      .eq('id', props.transactionId)
      .single();
    if (error) throw error;
    data.items = data.transaction_items.map(item => ({
        ...item,
        product_name: item.products.name,
        variant_name: item.product_variants?.name,
    }));
    fullTransactionData.value = data;
  } catch (e) {
    console.error("Gagal mengambil detail transaksi:", e);
    pdfError.value = "Gagal memuat detail untuk cetak.";
  }
}

// Fungsi ini tidak berubah
async function handlePrint() {
  await fetchTransactionDetails();
  await nextTick();
  const printContent = printableReceipt.value.innerHTML;
  const printWindow = window.open('', '', 'height=500,width=500');
  printWindow.document.write('<html><head><title>Cetak Struk</title>');
  printWindow.document.write('<style>body { font-family: monospace; font-size: 10pt; } table { width: 100%; } td { vertical-align: top; } .text-right { text-align: right; }</style>');
  printWindow.document.write('</head><body >');
  printWindow.document.write(printContent);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

// === FUNGSI YANG DIUBAH SECARA SIGNIFIKAN ===
async function handleSendWhatsApp() {
  if (isGeneratingPdf.value) return;

  isGeneratingPdf.value = true;
  pdfError.value = null;
  
  try {
    // 1. Ambil detail transaksi (sama seperti handlePrint)
    // Ini penting agar komponen ThermalReceipt di-render dengan data yang benar.
    await fetchTransactionDetails();
    
    // 2. Tunggu Vue selesai me-render komponen ThermalReceipt dengan data baru
    await nextTick();

    // 3. Ambil konten HTML dari струk yang sudah dirender di DOM
    const receiptHtml = printableReceipt.value?.innerHTML;
    if (!receiptHtml) {
      throw new Error("Gagal mendapatkan konten HTML dari struk untuk dikirim.");
    }
    
    // Pastikan URL ini sesuai dengan localtunnel Anda yang sedang berjalan
    const apiUrl = `https://dark-buses-cheer.loca.lt/generate-receipt`;

    // 4. Kirim HTML ke backend untuk diubah menjadi PDF
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Kirim transaction_id (untuk nama file) dan html_content yang sudah jadi
      body: JSON.stringify({ 
        transaction_id: props.transactionId,
        html_content: receiptHtml 
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.details || result.error || 'Gagal membuat PDF.');
    
    const pdfUrl = result.url;
    if (!pdfUrl) throw new Error('Server tidak memberikan URL PDF.');

    // 5. Siapkan dan buka link WhatsApp (logika ini tidak berubah)
    const greeting = props.customerName ? `Halo ${props.customerName},` : 'Halo,';
    const message = `${greeting} berikut adalah struk untuk transaksi Anda di ${userStore.business?.name}:\n\n${pdfUrl}\n\nTerima kasih!`;
    
    let waUrl = `https://wa.me/`;
    if (props.customerPhone) {
      const formattedPhone = props.customerPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');
      waUrl += `${formattedPhone}?text=${encodeURIComponent(message)}`;
    } else {
      waUrl += `?text=${encodeURIComponent(message)}`;
    }

    window.open(waUrl, '_blank');

  } catch (e) {
    console.error("Gagal kirim via WhatsApp:", e);
    pdfError.value = e.message || "Terjadi kesalahan. Tidak dapat membuat struk.";
  } finally {
    isGeneratingPdf.value = false;
  }
}
</script>