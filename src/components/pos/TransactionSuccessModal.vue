<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box">
      <div class="text-center">
        <!-- ... Konten modal tidak berubah ... -->
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
        <!-- ... Konten error tidak berubah ... -->
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ pdfError }}</span>
      </div>
      
      <div class="absolute -left-[9999px]">
        <div ref="printableReceipt">
            <!-- Komponen ThermalReceipt tidak berubah -->
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

// Props dan state tidak berubah
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
  if (!newVal) {
    pdfError.value = null;
    fullTransactionData.value = null;
  }
});

// Fungsi fetch tetap sama
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

// --- PERUBAHAN UTAMA ADA DI SINI ---

// 1. Buat "resep" CSS di satu tempat agar bisa digunakan bersama
const getReceiptCss = () => `
  /* Gaya dasar */
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

  /* Gaya Tabel Anti Gagal */
  table { 
    width: 100%;
    border-collapse: collapse;
  }
  td { 
    padding: 1px 0;
    vertical-align: top;
  }

  /* === Gaya HR (GARIS PEMISAH) ANTI GAGAL === */
  hr.separator {
    border: none; /* Reset gaya default browser */
    border-top: 1px dashed black; /* Buat garis putus-putus kita sendiri */
    height: 1px; /* Pastikan tidak ada ruang vertikal ekstra */
    margin: 0.5rem 0; /* Beri sedikit nafas */
    color: transparent; /* Sembunyikan warna default di beberapa browser aneh */
    background-color: transparent; /* Sama seperti di atas */
  }

  hr.separator.double-line {
    border-top-style: double; /* Ubah gaya menjadi garis ganda */
    border-top-width: 3px; /* Buat garis lebih tebal */
  }
`;

// 2. Buat fungsi untuk menghasilkan HTML lengkap, bisa dipakai bersama juga
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

// 3. Perbarui `handlePrint` untuk menggunakan resep yang sama
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

// 4. `handleSendWhatsApp` sekarang juga menggunakan fungsi helper yang sama
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
    const apiUrl = `https://dark-buses-cheer.loca.lt/generate-receipt`; // Ganti dengan URL produksi nanti

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
    
    // ... sisa logika WhatsApp tidak berubah ...
    const pdfUrl = result.url;
    if (!pdfUrl) throw new Error('Server tidak memberikan URL PDF.');
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