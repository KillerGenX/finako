<template>
    <div class="space-y-4 sm:space-y-6">
      <!-- Header dan tombol ekspor (HANYA GAYA YANG DIUBAH) -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 class="text-xl font-bold text-gray-800">Laporan Kartu Stok</h3>
        <button 
          @click="handleExport" 
          class="btn btn-outline border-gray-300 btn-sm"
          :disabled="isExporting || reportStore.stockCardReport.loading || !selectedItem || !reportData || reportData.length === 0"
        >
          <span v-if="isExporting" class="loading loading-spinner loading-xs"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Ekspor ke Excel
        </button>
      </div>
  
      <!-- Filter Item (HANYA GAYA YANG DIUBAH) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Produk atau Bahan Baku</label>
        <Combobox v-model="selectedItem" nullable>
          <div class="relative">
            <div class="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-teal-500">
              <ComboboxInput
                class="input w-full pl-3 pr-10 border-none"
                :displayValue="(item) => item?.name"
                @change="query = $event.target.value"
                placeholder="Ketik untuk mencari item..."
              />
              <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
              </ComboboxButton>
            </div>
            <Transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <ComboboxOptions class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                <div v-if="isItemListLoading" class="px-4 py-2 text-center text-gray-500">Memuat...</div>
                <div v-if="filteredItems.length === 0 && !isItemListLoading" class="px-4 py-2 text-center text-gray-500">Tidak ditemukan.</div>
                <ComboboxOption v-for="item in filteredItems" :key="item.id" :value="item" v-slot="{ active }">
                  <li :class="['cursor-pointer select-none p-2', { 'bg-teal-600 text-white': active, 'text-gray-900': !active }]">
                    <div class="flex justify-between">
                      <span>{{ item.name }}</span>
                      <span :class="['badge badge-sm', active ? 'badge-ghost' : '']">{{ item.type }}</span>
                    </div>
                  </li>
                </ComboboxOption>
              </ComboboxOptions>
            </Transition>
          </div>
        </Combobox>
      </div>
  
      <!-- Kartu KPI Stok (GAYA BARU, BINDING SAMA) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white shadow-lg rounded-lg border-l-4 border-gray-400 p-5">
            <p class="text-sm text-gray-500 font-medium">Stok Awal Periode</p>
            <p class="text-2xl font-bold text-gray-800 font-mono">{{ formatNumber(stockSummary.awal) }}</p>
        </div>
        <div class="bg-white shadow-lg rounded-lg border-l-4 border-green-500 p-5">
            <p class="text-sm text-gray-500 font-medium">Total Masuk</p>
            <p class="text-2xl font-bold text-green-600 font-mono">+{{ formatNumber(stockSummary.masuk) }}</p>
        </div>
        <div class="bg-white shadow-lg rounded-lg border-l-4 border-red-500 p-5">
            <p class="text-sm text-gray-500 font-medium">Total Keluar</p>
            <p class="text-2xl font-bold text-red-600 font-mono">-{{ formatNumber(stockSummary.keluar) }}</p>
        </div>
        <div class="bg-white shadow-lg rounded-lg border-l-4 border-teal-500 p-5">
            <p class="text-sm text-gray-500 font-medium">Stok Akhir Periode</p>
            <p class="text-2xl font-bold text-teal-600 font-mono">{{ formatNumber(stockSummary.akhir) }}</p>
        </div>
      </div>
      
      <!-- Tabel Laporan dengan Gaya Baru -->
      <div class="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <!-- SEMUA LOGIKA v-if TIDAK DIUBAH -->
        <div v-if="reportStore.stockCardReport.loading" class="text-center p-12"><span class="loading loading-spinner loading-lg text-teal-600"></span></div>
        <div v-else-if="!selectedItem" class="text-center p-12 text-gray-500"><p>Silakan pilih item di atas untuk melihat kartu stoknya.</p></div>
        <div v-else>
          <table class="table-auto w-full text-sm">
            <thead class="bg-gray-50 text-left text-gray-600">
              <tr>
                <th class="px-6 py-3 font-medium">Tanggal & Waktu</th>
                <th class="px-6 py-3 font-medium">Tipe Mutasi</th>
                <th class="px-6 py-3 font-medium text-right">Masuk</th>
                <th class="px-6 py-3 font-medium text-right">Keluar</th>
                <th class="px-6 py-3 font-medium text-right">Saldo Akhir</th>
                <th class="px-6 py-3 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="!reportData || reportData.length === 0"><td colspan="6" class="p-10 text-center text-gray-500">Tidak ada riwayat pergerakan stok.</td></tr>
              <!-- SEMUA BINDING DATA DI DALAM v-for TIDAK DIUBAH -->
              <tr v-for="item in reportData" :key="item.created_at">
                <td class="px-6 py-4 text-gray-600">{{ new Date(item.created_at).toLocaleString('id-ID', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}) }}</td>
                <td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{{ item.movement_type }}</span></td>
                <td class="px-6 py-4 text-right text-green-600 font-mono">{{ item.quantity_change > 0 ? formatNumber(item.quantity_change) : '' }}</td>
                <td class="px-6 py-4 text-right text-red-600 font-mono">{{ item.quantity_change < 0 ? formatNumber(-item.quantity_change) : '' }}</td>
                <td class="px-6 py-4 text-right font-bold font-mono text-gray-800">{{ formatNumber(item.balance) }}</td>
                <td class="px-6 py-4 text-gray-600">{{ item.ref_text }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
</template>
  
<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
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
    outletId: { type: String, default: null },  // Tambah prop outlet filter
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
      awal: selectedItem.value ? reportStore.stockCardReport.initialStockSnapshot : 0,
      masuk: 0,
      keluar: 0,
      akhir: selectedItem.value ? reportStore.stockCardReport.initialStockSnapshot : 0,
    };
  }

  const movements = reportData.value;
  const stokAwal = movements[0].balance - movements[0].quantity_change;
  const stokAkhir = movements[movements.length - 1].balance;
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
          item.name.toLowerCase().replace(/\s+/g, '').includes(query.value.toLowerCase().replace(/\s+/g, ''))
        )
);
  
async function fetchAllItems() {
    isItemListLoading.value = true;
    try {
      // Gunakan store yang sudah ada
      await reportStore.fetchInventoriableItems();
      allItems.value = reportStore.inventoriableItems.data || [];
    } catch(e) { console.error("Gagal mengambil daftar item:", e); } 
    finally { isItemListLoading.value = false; }
}
  
onMounted(() => {
    fetchAllItems();
});
  
watch([selectedItem, () => props.startDate, () => props.endDate, () => props.outletId], async () => {
    reportStore.stockCardReport.data = [];
    if (selectedItem.value) {
        // GUNAKAN outletId dari props (dari LaporanView), fallback ke activeOutletId
        const targetOutletId = props.outletId || userStore.activeOutletId;
        
        if (!targetOutletId) {
            alert("Silakan pilih outlet aktif terlebih dahulu di Pengaturan → Outlet.");
            return;
        }

        reportStore.stockCardReport.loading = true;
        let initialStock = 0;
        
        try {
            // PERBAIKAN: Gunakan stok pada AWAL periode (lebih akurat)
            const { data: stockAtDate, error } = await supabase.rpc('get_stock_at_date', {
                p_item_type: selectedItem.value.type,
                p_item_id: selectedItem.value.id,
                p_outlet_id: targetOutletId,
                p_date: props.startDate  // Stok di AWAL periode, bukan stok saat ini
            });
            if (error) {
                console.warn("get_stock_at_date gagal, fallback ke current stock:", error);
                // Fallback ke current stock jika RPC baru belum ada
                const { data: currentStock, error: currentError } = await supabase.rpc('get_current_stock', {
                    p_item_type: selectedItem.value.type,
                    p_item_id: selectedItem.value.id,
                    p_outlet_id: targetOutletId
                });
                if (currentError) throw currentError;
                initialStock = currentStock || 0;
            } else {
                initialStock = stockAtDate || 0;
            }
            
        } catch (e) {
            console.error("Gagal mengambil stok awal periode:", e);
        }

        // Panggil RPC dengan outlet filter
        await reportStore.fetchStockCardReport({
            startDate: props.startDate,
            endDate: props.endDate,
            itemType: selectedItem.value.type,
            itemId: selectedItem.value.id,
            outletId: targetOutletId,  // TAMBAH OUTLET ID
            initialStock: initialStock
        });
    }
}, { deep: true });
  
function formatNumber(value) {
    if (typeof value !== 'number') return '-';
    return new Intl.NumberFormat('id-ID').format(value);
}
  
const handleExport = () => {
    if (isExporting.value || !selectedItem.value || !reportData.value || reportData.value.length === 0) return;
    isExporting.value = true;
    try {
        const title = `Kartu Stok: ${selectedItem.value.name}`;
        const startDateStr = new Date(props.startDate).toLocaleDateString('id-ID');
        const endDateStr = new Date(props.endDate).toLocaleDateString('id-ID');
        const dateRangeStr = `Periode: ${startDateStr} - ${endDateStr}`;
        const fileName = `kartu-stok-${selectedItem.value.name.replace(/ /g, "_")}.xlsx`;
        const { awal, akhir } = stockSummary.value;
        const transactionHeaders = ["Tanggal & Waktu", "Tipe Mutasi", "Masuk", "Keluar", "Saldo Akhir", "Keterangan"];
        const transactionRows = reportData.value.map(item => [
            new Date(item.created_at).toLocaleString('id-ID', { hour12: false }),
            item.movement_type,
            item.quantity_change > 0 ? item.quantity_change : '',
            item.quantity_change < 0 ? -item.quantity_change : '',
            item.balance,
            item.ref_text || ''
        ]);
        const ws_data = [
            [title], [dateRangeStr], [],
            ["Saldo Awal Periode:", awal],
            ["Saldo Akhir Periode:", akhir],
            [], transactionHeaders, ...transactionRows
        ];
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const titleStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: "center" } };
        const subtitleStyle = { font: { italic: true }, alignment: { horizontal: "center" } };
        const headerStyle = { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: "E9E9E9" } } };
        const kpiLabelStyle = { font: { bold: true } };
        const numberStyle = { numFmt: '#,##0' };
        const columnCount = transactionHeaders.length;
        ws["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: columnCount - 1 } },
        ];
        ws['A1'].s = titleStyle; ws['A2'].s = subtitleStyle;
        ws['A4'].s = ws['A5'].s = kpiLabelStyle;
        ws['B4'].s = ws['B5'].s = numberStyle;
        transactionHeaders.forEach((h, i) => {
            const cellRef = XLSX.utils.encode_cell({ c: i, r: 6 });
            if (ws[cellRef]) ws[cellRef].s = headerStyle;
        });
        transactionRows.forEach((row, rowIndex) => {
            [2, 3, 4].forEach(colIndex => {
                const cellRef = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex + 7 });
                if (ws[cellRef]) ws[cellRef].s = numberStyle;
            });
        });
        ws["!cols"] = [ { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 } ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Kartu Stok");
        XLSX.writeFile(wb, fileName);
    } catch (e) { console.error(e); } 
    finally { isExporting.value = false; }
}
</script>
