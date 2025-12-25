<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box w-full max-w-md mx-4 md:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
      
      <!-- Success content dengan mobile-first design -->
      <div class="flex-grow overflow-y-auto text-center py-4 px-4">
        
        <!-- Large success icon -->
        <div class="mx-auto w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <svg class="w-12 h-12 md:w-14 md:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        
        <!-- Success message -->
        <h3 class="font-bold text-xl md:text-2xl text-gray-800 mb-2">Transaksi Berhasil!</h3>
        <p class="text-gray-600 mb-4">Pembayaran telah diproses dengan sukses</p>
        
        <!-- Transaction ID dengan card style -->
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
          <p class="text-xs text-gray-500 mb-1">ID Transaksi</p>
          <p class="font-mono text-sm md:text-base font-semibold text-gray-800">{{ transactionId }}</p>
        </div>
      </div>
      
      <!-- Mobile-friendly action buttons dengan fixed positioning -->
      <div class="flex-shrink-0 p-4 space-y-3 border-t border-gray-100 bg-white">
        
        <!-- Primary action - prominent button -->
        <button 
          @click="emit('newTransaction')" 
          class="btn btn-primary bg-teal-600 hover:bg-teal-700 border-none text-white w-full btn-lg touch-target shadow-md"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Transaksi Baru
        </button>
        
        <!-- Secondary actions - always 2 columns untuk mobile -->
        <div class="grid grid-cols-2 gap-3">
          <button 
            @click="handlePrint" 
            class="btn btn-outline hover:bg-gray-50 w-full touch-target text-sm"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Cetak Struk
          </button>
          
          <button 
            @click="handleSendWhatsApp" 
            class="btn btn-outline btn-success hover:bg-green-50 w-full touch-target text-sm" 
            :class="{ 'loading': isGeneratingPdf }" 
            :disabled="isGeneratingPdf || !customerPhone"
          >
            <svg v-if="!isGeneratingPdf" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            {{ isGeneratingPdf ? 'Kirim...' : 'Kirim WA' }}
          </button>
        </div>
        
        <!-- WhatsApp status info untuk mobile - more compact -->
        <div v-if="!customerPhone" class="text-center pt-2">
          <p class="text-xs text-gray-500">
            💡 Masukkan nomor pelanggan saat checkout untuk kirim via WA
          </p>
        </div>
      </div>

      <!-- Error message dengan mobile-friendly design -->
      <div v-if="pdfError" class="alert alert-error text-sm mx-4 mb-4 rounded-xl">
        <svg class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>{{ pdfError }}</span>
      </div>
      
      <!-- Struk untuk dicetak tetap tersembunyi -->
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
// Bagian script tidak diubah
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
const printableReceipt = ref(null);
const isGeneratingPdf = ref(false);
const pdfError = ref(null);
const activeOutlet = computed(() => 
  productStore.outlets.find(o => o.id === userStore.activeOutletId)
);
watch(() => props.show, (newVal) => {
  if (newVal) {
    pdfError.value = null;
    fullTransactionData.value = null;
  }
});

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

const getReceiptCss = () => `
  body { background-color: white; padding: 10px; }
  .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .text-center { text-align: center; }
  .font-bold { font-weight: 700; }
  .uppercase { text-transform: uppercase; }
  .w-full { width: 100%; }
  .text-right { text-align: right; }
  .text-left { text-align: left; }
  .font-semibold { font-weight: 600; }
  .pl-2 { padding-left: 0.5rem; }
  .mt-3 { margin-top: 0.75rem; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 1px 0; vertical-align: top; }
  hr.separator { border: none; border-top: 1px dashed black; height: 1px; margin: 0.5rem 0; color: transparent; background-color: transparent; }
  hr.separator.double-line { border-top-style: double; border-top-width: 3px; }
`;

const getFullHtml = (bodyContent) => {
  return `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Struk Transaksi</title>
        <style>${getReceiptCss()}</style>
      </head>
      <body>
        ${bodyContent}
      </body>
    </html>
  `;
};

async function handlePrint() {
  await fetchTransactionDetails();
  await nextTick();
  
  const receiptHtmlBody = printableReceipt.value?.innerHTML;
  if (!receiptHtmlBody) return;

  const fullHtmlContent = getFullHtml(receiptHtmlBody);
  
  const printWindow = window.open('', '', 'height=500,width=500');
  printWindow.document.write(fullHtmlContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

async function handleSendWhatsApp() {
  if (isGeneratingPdf.value) return;
  isGeneratingPdf.value = true;
  pdfError.value = null;
  
  try {
    await fetchTransactionDetails();
    await nextTick();

    const receiptHtmlBody = printableReceipt.value?.innerHTML;
    if (!receiptHtmlBody) {
      throw new Error("Gagal mendapatkan konten HTML dari struk.");
    }
    
    const fullHtmlContent = getFullHtml(receiptHtmlBody);
    const apiUrl = `/api/generate-receipt`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        transaction_id: props.transactionId,
        html_content: fullHtmlContent
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.details || result.error || 'Gagal membuat PDF.');
    
    const pdfUrl = result.url;
    if (!pdfUrl) throw new Error('Server tidak memberikan URL PDF.');
    
    // Format tanggal dan waktu transaksi
    const transactionDate = new Date(props.transaction.created_at);
    const formattedDate = transactionDate.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    const formattedTime = transactionDate.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Format total transaksi
    const formattedTotal = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(props.total);
    
    const greeting = props.customerName ? `Halo ${props.customerName}` : 'Halo';
    const message = `${greeting} 👋

Terima kasih telah berbelanja di *${userStore.business?.name}*!

📋 *Detail Transaksi*
📅 Tanggal: ${formattedDate}
🕐 Waktu: ${formattedTime}
💰 Total: ${formattedTotal}

🧾 Struk Digital:
${pdfUrl}

Kami sangat menghargai kepercayaan Anda. Ditunggu kunjungan berikutnya! 🙏

_Pesan otomatis dari Finako POS_`;
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

<style scoped>
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Success modal animation */
.modal-box {
  animation: successSlideUp 0.4s ease-out;
}

@keyframes successSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Success icon bounce animation */
.modal-box svg {
  animation: successBounce 0.6s ease-out 0.2s both;
}

@keyframes successBounce {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile optimization untuk better visibility */
@media (max-width: 768px) {
  .btn:active {
    transform: scale(0.98);
  }
  
  /* Pastikan modal tidak terlalu tinggi pada mobile */
  .modal-box {
    max-height: 90vh !important;
  }
  
  /* Scroll behavior yang smooth */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }
  
  /* Compact spacing untuk mobile */
  .space-y-3 > * + * {
    margin-top: 12px !important;
  }
}

/* Ensure buttons are fully visible */
.btn {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Grid columns responsive fix */
.grid-cols-2 {
  grid-template-columns: 1fr 1fr;
}
</style>