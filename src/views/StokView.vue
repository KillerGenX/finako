<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-full">
    <!-- Header dengan Tombol Aksi Berwarna Teal -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Manajemen Stok</h1>
      <div class="flex items-center gap-2 mt-4 md:mt-0">
        <!-- @click TIDAK DIUBAH -->
        <button class="btn btn-outline border-gray-300" @click="isMovementModalVisible = true">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M4 18v-5h5m11-4h-5V4M15 18h5v-5" /></svg>
          Input Mutasi
        </button>
        <!-- @click TIDAK DIUBAH -->
        <button class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" @click="openIngredientModal()">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          Bahan Baku Baru
        </button>
      </div>
    </div>

    <!-- Panel Filter dengan Gaya Kartu Putih -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200 mb-6">
         <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tampilkan Stok untuk Outlet</label>
            <!-- v-model TIDAK DIUBAH -->
            <select v-model="activeOutletId" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm">
                <option v-for="outlet in productStore.outlets" :key="outlet.id" :value="outlet.id">
                    {{ outlet.name }}
                </option>
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cari Bahan Baku</label>
            <!-- v-model TIDAK DIUBAH -->
            <input v-model="searchQuery" type="text" placeholder="Ketik nama bahan baku..." class="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
        </div>
    </div>

    <!-- Tampilan Loading (Hanya Gaya yang Diubah) -->
    <div v-if="stockStore.isLoading && !stockStore.ingredients.length" class="text-center py-12">
        <span class="loading loading-spinner loading-lg text-teal-600"></span>
        <p class="mt-2 text-gray-600">Sedang memuat data stok...</p>
    </div>
    <div v-else-if="stockStore.error" class="bg-red-50 border-l-4 border-red-400 p-4">
        <!-- Tampilan error yang konsisten -->
    </div>

    <div v-else>
      <!-- Tabs dengan Gaya Baru -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-6" aria-label="Tabs">
          <a href="#" @click.prevent="activeTab = 'current_stock'" :class="[activeTab === 'current_stock' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">Stok Saat Ini</a> 
          <a href="#" @click.prevent="activeTab = 'history'" :class="[activeTab === 'history' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">Riwayat Mutasi</a>
        </nav>
      </div>

      <!-- Konten Tab 1: Stok Saat Ini -->
      <div v-show="activeTab === 'current_stock'" class="mt-4 overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table class="table-auto w-full text-sm">
            <thead class="bg-gray-50 text-left text-gray-600">
                <tr>
                    <th class="px-6 py-3 font-medium">Nama Bahan Baku</th>
                    <th class="px-6 py-3 font-medium">Stok di Outlet</th>
                    <th class="px-6 py-3 font-medium">Satuan</th>
                    <th class="px-6 py-3 font-medium text-center">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                <tr v-for="item in filteredIngredients" :key="item.id">
                    <td class="px-6 py-4 font-semibold text-gray-800">{{ item.name }}</td>
                    <td class="px-6 py-4">
                        <span class="font-mono text-lg font-bold" :class="{ 'text-red-600': item.stock_quantity < item.min_stock && item.min_stock > 0 }">
                            {{ item.stock_quantity }}
                        </span>
                        <span v-if="item.stock_quantity < item.min_stock && item.min_stock > 0" class="ml-2 text-xs text-red-600">(di bawah min.)</span>
                    </td>
                    <td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{{ item.unit }}</span></td>
                    <td class="px-6 py-4">
                        <div class="flex items-center justify-center space-x-2">
                            <button @click="openIngredientModal(item)" class="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600" title="Edit Master Bahan"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                            <button @click="openStockAdjustmentModal(item)" class="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Kelola Stok & Harga Modal"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                            <button @click="handleDeleteIngredient(item.id)" class="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600" title="Hapus Master Bahan"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    </td>
                </tr>
                <tr v-if="filteredIngredients.length === 0">
                    <td colspan="4" class="text-center py-12 text-gray-500">Tidak ada bahan baku yang cocok.</td>
                </tr>
            </tbody>
        </table>
      </div>

      <!-- Konten Tab 2: Riwayat Mutasi -->
      <div v-show="activeTab === 'history'" class="mt-4 overflow-x-auto bg-white rounded-lg border border-gray-200">
         <table class="table-auto w-full text-sm">
            <thead class="bg-gray-50 text-left text-gray-600">
              <tr>
                <th class="px-6 py-3 font-medium">Tanggal</th>
                <th class="px-6 py-3 font-medium">Bahan Baku</th>
                <th class="px-6 py-3 font-medium">Jenis</th>
                <th class="px-6 py-3 font-medium">Jumlah</th>
                <th class="px-6 py-3 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in stockMovementsForActiveOutlet" :key="item.id">
                <td class="px-6 py-4 text-gray-600">{{ new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short'}) }}</td>
                <td class="px-6 py-4 font-semibold text-gray-800">{{ item.ingredients?.name || 'N/A' }}</td>
                <td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="movementBadge(item.movement_type)">{{ item.movement_type }}</span></td>
                <td class="px-6 py-4 font-mono font-semibold" :class="item.quantity > 0 ? 'text-green-600' : 'text-red-600'">{{ item.quantity > 0 ? '+' : '' }}{{ item.quantity }}</td>
                <td class="px-6 py-4 text-gray-600">{{ item.ref }}</td>
              </tr>
              <tr v-if="stockMovementsForActiveOutlet.length === 0">
                <td colspan="5" class="text-center py-12 text-gray-500">Belum ada riwayat mutasi untuk outlet ini.</td>
              </tr>
            </tbody>
          </table>
      </div>
    </div>

    <!-- SEMUA MODAL TIDAK DIUBAH -->
    <IngredientFormModal 
        :show="isIngredientModalVisible"
        :ingredient-to-edit="itemToEdit"
        :is-loading="stockStore.isLoading"
        @close="isIngredientModalVisible = false"
        @save="handleSaveIngredient"
    />
    <StockAdjustmentModal
        :show="isStockModalVisible"
        :ingredient-data="itemToEdit"
        :outlet-name="activeOutletName"
        :is-loading="stockStore.isLoading"
        @close="isStockModalVisible = false"
        @save="handleSaveStock"
    />
    <StockMovementModal
      :show="isMovementModalVisible"
      :ingredients="stockStore.ingredients"
      :outlet-id="activeOutletId"
      :outlet-name="activeOutletName"
      :is-loading="stockStore.isLoading"
      @close="isMovementModalVisible = false"
      @save="handleSaveMovement"
    />
  </div>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import { useProductStore } from '@/stores/productStore';
import { useStockStore } from '@/stores/stockStore';
import IngredientFormModal from '@/components/stock/IngredientFormModal.vue';
import StockAdjustmentModal from '@/components/stock/StockAdjustmentModal.vue';
import StockMovementModal from '@/components/stock/StockMovementModal.vue';

const userStore = useUserStoreRefactored();
const productStore = useProductStore();
const stockStore = useStockStore();

const { outlets } = storeToRefs(productStore);
const { ingredients, ingredientStocks, stockMovements } = storeToRefs(stockStore);

const activeOutletId = ref(null);
const searchQuery = ref('');
const itemToEdit = ref(null);
const activeTab = ref('current_stock');
const isIngredientModalVisible = ref(false);
const isStockModalVisible = ref(false);
const isMovementModalVisible = ref(false);

const activeOutletName = computed(() => outlets.value.find(o => o.id === activeOutletId.value)?.name || '');
const filteredIngredients = computed(() => {
    const currentOutletId = activeOutletId.value;
    if (!currentOutletId) return [];
    const resultsWithStock = ingredients.value.map(ing => {
        const stockInfo = ingredientStocks.value.find(s => s.ingredient_id === ing.id && s.outlet_id === currentOutletId);
        return { ...ing, stock_quantity: stockInfo?.stock_quantity ?? 0, min_stock: stockInfo?.min_stock ?? 0, is_active: stockInfo?.is_active ?? true, stock_id: stockInfo?.id,cost_price: stockInfo?.cost_price ?? 0, outlet_id: currentOutletId };
    });
    if (!searchQuery.value) return resultsWithStock;
    return resultsWithStock.filter(ing => ing.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const stockMovementsForActiveOutlet = computed(() => {
  if (!activeOutletId.value || !stockMovements.value) return [];
  return stockMovements.value.filter(m => m.outlet_id === activeOutletId.value);
});

const movementBadge = (type) => ({
  'masuk': 'bg-green-100 text-green-800',
  'keluar': 'bg-red-100 text-red-800',
  'penyesuaian': 'bg-blue-100 text-blue-800',
}[type] || 'bg-gray-100 text-gray-800');

onMounted(() => { 
    const fetchData = () => { if (productStore.outlets.length === 0) { productStore.fetchInitialData(); } stockStore.fetchStockPageData(); };
    if (userStore.isReady) { fetchData(); } else { const unwatch = watch(() => userStore.isReady, (ready) => { if (ready) { fetchData(); unwatch(); } }); }
});

watch(outlets, (newOutlets) => { 
    if (newOutlets && newOutlets.length > 0 && !activeOutletId.value) { activeOutletId.value = newOutlets[0].id; }
}, { immediate: true });

function openIngredientModal(ingredient = null) { itemToEdit.value = ingredient; isIngredientModalVisible.value = true; }
async function handleSaveIngredient(formData) { await stockStore.saveIngredient(formData); isIngredientModalVisible.value = false; }
function openStockAdjustmentModal(ingredientData) { const dataForModal = { ...ingredientData, outlet_id: activeOutletId.value }; itemToEdit.value = dataForModal; isStockModalVisible.value = true; }
async function handleSaveStock(stockData) { const success = await stockStore.saveIngredientStock(stockData); if (success) { isStockModalVisible.value = false; } }
async function handleDeleteIngredient(ingredientId) { await stockStore.deleteIngredient(ingredientId); }
async function handleSaveMovement(movementData) {
    const success = await stockStore.addStockMovement(movementData);
    if (success) {
        isMovementModalVisible.value = false;
    }
}
</script>
