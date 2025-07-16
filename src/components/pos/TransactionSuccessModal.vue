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
          <button @click="handleSendWhatsApp" class="btn btn-outline w-full btn-success":class="{ 'loading': isGeneratingPdf }":disabled="isGeneratingPdf">Kirim via WhatsApp</button>
        </div>
        <div v-if="pdfError" role="alert" class="alert alert-error text-sm mt-4">
  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  <span>{{ pdfError }}</span>
</div>

        
        <!-- Struk tersembunyi untuk keperluan cetak -->
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
});

const emit = defineEmits(['newTransaction']);

const userStore = useUserStoreRefactored();
const productStore = useProductStore();

const fullTransactionData = ref(null);
const printableReceipt = ref(null);

// State baru untuk logika PDF
const isGeneratingPdf = ref(false);
const pdfError = ref(null);

const activeOutlet = computed(() => 
  productStore.outlets.find(o => o.id === userStore.activeOutletId)
);

// Reset error saat modal ditutup
watch(() => props.show, (newVal) => {
  if (!newVal) {
    pdfError.value = null;
    fullTransactionData.value = null; // Reset data juga
  }
});

async function fetchTransactionDetails() {
  // Hanya fetch jika data belum ada
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

// FUNGSI UTAMA KITA
async function handleSendWhatsApp() {
  if (isGeneratingPdf.value) return;

  isGeneratingPdf.value = true;
  pdfError.value = null;
  
  try {
    // Panggil backend kustom kita melalui Vite Proxy
    const response = await fetch('/api/generate-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction_id: props.transactionId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Gagal membuat PDF.');
    }

    const pdfUrl = result.url;
    
    // Siapkan pesan untuk WhatsApp
    const message = `Halo, berikut adalah struk untuk transaksi Anda di ${userStore.business?.name}:\n\n${pdfUrl}\n\nTerima kasih!`;
    
    // Buka WhatsApp di tab baru dengan pesan yang sudah diisi
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');

  } catch (e) {
    console.error("Gagal kirim via WhatsApp:", e);
    pdfError.value = e.message || "Terjadi kesalahan. Tidak dapat membuat struk.";
  } finally {
    isGeneratingPdf.value = false;
  }
}
</script>