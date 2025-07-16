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
          <button @click="handleSendWhatsApp" class="btn btn-outline w-full btn-success">Kirim via WhatsApp</button>
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
  import { ref, computed, nextTick } from 'vue';
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
  
  const activeOutlet = computed(() => 
    productStore.outlets.find(o => o.id === userStore.activeOutletId)
  );
  
  async function fetchTransactionDetails() {
    if (!props.transactionId) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, transaction_items(*, products(name), product_variants(name))')
        .eq('id', props.transactionId)
        .single();
      if (error) throw error;
      // Format data agar lebih mudah digunakan di template struk
      data.items = data.transaction_items.map(item => ({
          ...item,
          product_name: item.products.name,
          variant_name: item.product_variants?.name,
      }));
      fullTransactionData.value = data;
    } catch (e) {
      console.error("Gagal mengambil detail transaksi:", e);
    }
  }
  
  async function handlePrint() {
    await fetchTransactionDetails();
    // Tunggu Vue selesai me-render struk di div tersembunyi
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
  
  async function handleSendWhatsApp() {
      // TODO: Panggil backend kustom untuk generate PDF
      alert("Fitur kirim via WhatsApp sedang dalam pengembangan.");
  }
  
  </script>