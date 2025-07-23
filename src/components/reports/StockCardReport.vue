<template>
    <div>
      <!-- Header dan tombol ekspor -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 class="text-lg font-bold">Laporan Kartu Stok</h3>
        <button 
          @click="handleExport" 
          class="btn btn-outline btn-sm"
          :disabled="isExporting || reportStore.stockCardReport.loading || !selectedItem || reportData.length === 0"
        >
          <span v-if="isExporting" class="loading loading-spinner loading-xs"></span>
          Ekspor ke Excel
        </button>
      </div>
  
      <!-- Filter Item dengan Headless UI Combobox -->
      <div class="form-control mb-6">
        <label class="label"><span class="label-text">Pilih Produk atau Bahan Baku</span></label>
        <Combobox v-model="selectedItem" nullable>
          <div class="relative">
            <div class="relative w-full cursor-default overflow-hidden rounded-lg bg-base-100 text-left border border-base-300 focus-within:ring-2 focus-within:ring-primary">
              <ComboboxInput
                class="input w-full pl-3 pr-10"
                :displayValue="(item) => item?.o_name"
                @change="query = $event.target.value"
                placeholder="Ketik untuk mencari item..."
              />
              <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
              </ComboboxButton>
            </div>
            <Transition
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <ComboboxOptions class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                <div v-if="isItemListLoading" class="px-4 py-2 text-center text-base-content/70">Memuat daftar item...</div>
                <div v-if="filteredItems.length === 0 && !isItemListLoading" class="px-4 py-2 text-center text-base-content/70">
                  Item tidak ditemukan.
                </div>
                <ComboboxOption
                  v-for="item in filteredItems"
                  :key="item.o_id"
                  :value="item"
                  v-slot="{ active }"
                >
                  <li :class="['cursor-pointer select-none p-2', { 'bg-primary text-primary-content': active }]">
                    <div class="flex justify-between">
                      <span>{{ item.o_name }}</span>
                      <span class="badge badge-sm badge-ghost font-mono">{{ item.o_type }}</span>
                    </div>
                  </li>
                </ComboboxOption>
              </ComboboxOptions>
            </Transition>
          </div>
        </Combobox>
      </div>
  
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat bg-base-200 rounded-lg shadow">
          <div class="stat-title">Stok Awal Periode</div>
          <div class="stat-value">{{ formatNumber(stockSummary.awal) }}</div>
        </div>
        <div class="stat bg-base-200 rounded-lg shadow">
          <div class="stat-title">Total Masuk</div>
          <div class="stat-value text-success">{{ formatNumber(stockSummary.masuk) }}</div>
        </div>
        <div class="stat bg-base-200 rounded-lg shadow">
          <div class="stat-title">Total Keluar</div>
          <div class="stat-value text-error">{{ formatNumber(stockSummary.keluar) }}</div>
        </div>
        <div class="stat bg-base-200 rounded-lg shadow">
          <div class="stat-title">Stok Akhir Periode</div>
          <div class="stat-value text-primary">{{ formatNumber(stockSummary.akhir) }}</div>
        </div>
    </div>
      
      <!-- Kontainer Hasil Laporan -->
      <div class="border border-base-300 rounded-lg">
        <div v-if="reportStore.stockCardReport.loading" class="text-center p-12">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else-if="!selectedItem" class="text-center p-12 text-base-content/70">
          <p>Silakan pilih item di atas untuk melihat kartu stoknya.</p>
        </div>
        <div v-else-if="reportData && reportData.length > 0" class="overflow-x-auto">
          <table class="table w-full table-sm">
            <thead>
              <tr>
                <th>Tanggal & Waktu</th>
                <th>Tipe Mutasi</th>
                <th class="text-right">Masuk</th>
                <th class="text-right">Keluar</th>
                <th class="text-right">Saldo Akhir</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData" :key="item.created_at" class="hover">
                <td>{{ new Date(item.created_at).toLocaleString('id-ID', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}) }}</td>
                <td><span class="badge badge-neutral badge-sm">{{ item.movement_type }}</span></td>
                <td class="text-right text-success font-mono">{{ item.quantity_change > 0 ? formatNumber(item.quantity_change) : '' }}</td>
                <td class="text-right text-error font-mono">{{ item.quantity_change < 0 ? formatNumber(-item.quantity_change) : '' }}</td>
                <td class="text-right font-bold font-mono">{{ formatNumber(item.balance) }}</td>
                <td>{{ item.ref_text }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center p-12 text-base-content/70">
          <p>Tidak ada riwayat pergerakan untuk item ini pada periode yang dipilih.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { useReportStore } from '@/stores/reportStore';
  import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
  import { supabase } from '@/supabase';
  import * as XLSX from 'xlsx-js-style';
  
  import {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
  } from '@headlessui/vue';
  
  const props = defineProps({
    startDate: { type: [String, Date], required: true },
    endDate: { type: [String, Date], required: true },
  });
  
  const reportStore = useReportStore();
  const userStore = useUserStoreRefactored();
  
  const allItems = ref([]);
  const selectedItem = ref(null);
  const query = ref('');
  const isItemListLoading = ref(false);
  const isExporting = ref(false);
  
  const reportData = computed(() => reportStore.stockCardReport.data);

  const stockSummary = computed(() => {
  if (!reportData.value || reportData.value.length === 0) {
    return {
      awal: selectedItem.value ? reportStore.stockCardReport.initialStockSnapshot : 0, // Ambil dari stok awal jika ada
      masuk: 0,
      keluar: 0,
      akhir: selectedItem.value ? reportStore.stockCardReport.initialStockSnapshot : 0, // Sama dengan awal jika tak ada pergerakan
    };
  }

  const movements = reportData.value;
  
  // Saldo awal adalah saldo dari baris PERTAMA DIKURANGI perubahannya
  const stokAwal = movements[0].balance - movements[0].quantity_change;
  
  // Saldo akhir adalah saldo dari baris TERAKHIR
  const stokAkhir = movements[movements.length - 1].balance;

  // Hitung total masuk dan keluar
  const totalMasuk = movements
    .filter(item => item.quantity_change > 0)
    .reduce((sum, item) => sum + item.quantity_change, 0);
  
  const totalKeluar = movements
    .filter(item => item.quantity_change < 0)
    .reduce((sum, item) => sum + Math.abs(item.quantity_change), 0);

  return {
    awal: stokAwal,
    masuk: totalMasuk,
    keluar: totalKeluar,
    akhir: stokAkhir,
  };
});
  
  const filteredItems = computed(() =>
    query.value === ''
      ? allItems.value
      : allItems.value.filter((item) =>
          item.o_name.toLowerCase().replace(/\s+/g, '').includes(query.value.toLowerCase().replace(/\s+/g, ''))
        )
  );
  
  async function fetchAllItems() {
    isItemListLoading.value = true;
    try {
      const { data, error } = await supabase.rpc('get_all_inventoriable_items');
      if (error) throw error;
      allItems.value = data || [];
    } catch(e) { console.error("Gagal mengambil daftar item:", e); } 
    finally { isItemListLoading.value = false; }
  }
  
  onMounted(() => {
    fetchAllItems();
  });
  
  watch([selectedItem, () => props.startDate, () => props.endDate], async () => {
      reportStore.stockCardReport.data = [];
      if (selectedItem.value) {
          const activeOutletId = userStore.activeOutletId;
          if (!activeOutletId) {
              alert("Silakan pilih outlet aktif terlebih dahulu di Dasbor.");
              return;
          }
  
          reportStore.stockCardReport.loading = true;
          let initialStock = 0;
          try {
              const { data: currentStock, error } = await supabase.rpc('get_current_stock', {
                  p_item_type: selectedItem.value.o_type,
                  p_item_id: selectedItem.value.o_id,
                  p_outlet_id: activeOutletId
              });
              if (error) throw error;
              initialStock = currentStock;
          } catch (e) {
              console.error("Gagal mengambil stok terkini:", e);
          }
  
          await reportStore.fetchStockCardReport({
              startDate: props.startDate,
              endDate: props.endDate,
              itemType: selectedItem.value.o_type,
              itemId: selectedItem.value.o_id,
              initialStock: initialStock
          });
      }
  }, { deep: true });
  
  function formatNumber(value) {
      if (typeof value !== 'number') return '-';
      return new Intl.NumberFormat('id-ID').format(value);
  }
  

  const handleExport = () => {
    if (isExporting.value || !selectedItem.value || reportData.value.length === 0) return;
    isExporting.value = true;

    try {
        // 1. Siapkan Judul dan Nama File
        const title = `Kartu Stok: ${selectedItem.value.o_name}`;
        const startDateStr = new Date(props.startDate).toLocaleDateString('id-ID');
        const endDateStr = new Date(props.endDate).toLocaleDateString('id-ID');
        const dateRangeStr = `Periode: ${startDateStr} - ${endDateStr}`;
        const fileName = `kartu-stok-${selectedItem.value.o_name.replace(/ /g, "_")}.xlsx`;

        // 2. Definisikan Style
        const titleStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: "center" } };
        const subtitleStyle = { font: { italic: true }, alignment: { horizontal: "center" } };
        const headerStyle = { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: "E9E9E9" } } };
        const kpiLabelStyle = { font: { bold: true } };
        const numberStyle = { numFmt: '#,##0' };

        // 3. Hitung Saldo Awal dan Akhir
        // Saldo awal adalah saldo dari baris PERTAMA DIKURANGI perubahannya
        const saldoAwal = reportData.value[0].balance - reportData.value[0].quantity_change;
        // Saldo akhir adalah saldo dari baris TERAKHIR
        const saldoAkhir = reportData.value[reportData.value.length - 1].balance;

        // 4. Siapkan data untuk tabel riwayat
        const transactionHeaders = ["Tanggal & Waktu", "Tipe Mutasi", "Masuk", "Keluar", "Saldo Akhir", "Keterangan"];
        const transactionRows = reportData.value.map(item => [
            new Date(item.created_at).toLocaleString('id-ID', { hour12: false }),
            item.movement_type,
            item.quantity_change > 0 ? item.quantity_change : '',
            item.quantity_change < 0 ? -item.quantity_change : '',
            item.balance,
            item.ref_text || ''
        ]);

        // 5. Gabungkan semua bagian menjadi satu array besar
        const ws_data = [
            [title],
            [dateRangeStr],
            [],
            ["Saldo Awal Periode:", saldoAwal],
            ["Saldo Akhir Periode:", saldoAkhir],
            [],
            transactionHeaders,
            ...transactionRows
        ];

        // 6. Buat Worksheet
        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        // 7. Terapkan Style dan Merge
        const columnCount = transactionHeaders.length;
        ws["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: columnCount - 1 } },
        ];
        
        ws['A1'].s = titleStyle;
        ws['A2'].s = subtitleStyle;
        ws['A4'].s = ws['A5'].s = kpiLabelStyle;
        ws['B4'].s = ws['B5'].s = numberStyle;

        transactionHeaders.forEach((h, i) => {
            const cellRef = XLSX.utils.encode_cell({ c: i, r: 6 });
            if (ws[cellRef]) ws[cellRef].s = headerStyle;
        });
        
        transactionRows.forEach((row, rowIndex) => {
            // Style untuk kolom Masuk, Keluar, Saldo
            [2, 3, 4].forEach(colIndex => {
                const cellRef = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex + 7 });
                if (ws[cellRef]) ws[cellRef].s = numberStyle;
            });
        });

        ws["!cols"] = [ { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 } ];

        // 8. Buat Workbook dan download
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Kartu Stok");
        XLSX.writeFile(wb, fileName);
    } catch (e) {
        alert("Gagal mengekspor data.");
        console.error(e);
    } finally {
        isExporting.value = false;
    }
}
 

  </script>