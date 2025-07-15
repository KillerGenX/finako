<template>
  <div class="p-4 md:p-6">
    <!-- 1. HEADER DIUBAH: Tombol Aksi Sekarang Ada Dua -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 class="text-3xl font-bold">Manajemen Stok</h1>
      <div class="mt-4 md:mt-0">
        <button class="btn btn-outline mr-2" @click="isMovementModalVisible = true">+ Input Mutasi</button>
        <button class="btn btn-primary" @click="openIngredientModal()">+ Bahan Baku Baru</button>
      </div>
    </div>

    <!-- Panel Filter (Tidak Berubah) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg mb-6">
        <!-- ... kode panel filter tidak berubah ... -->
         <div>
            <label class="label"><span class="label-text">Tampilkan Stok untuk Outlet</span></label>
            <select v-model="activeOutletId" class="select select-bordered w-full">
                <option v-for="outlet in productStore.outlets" :key="outlet.id" :value="outlet.id">
                    {{ outlet.name }}
                </option>
            </select>
        </div>
        <div>
            <label class="label"><span class="label-text">Cari Bahan Baku</span></label>
            <input v-model="searchQuery" type="text" placeholder="Ketik nama bahan baku..." class="input input-bordered w-full" />
        </div>
    </div>

    <!-- Kondisi Loading / Error (Tidak Berubah) -->
    <div v-if="stockStore.isLoading && !stockStore.ingredients.length" class="text-center py-12">
        <!-- ... kode loading tidak berubah ... -->
        <span class="loading loading-spinner loading-lg"></span>
        <p>Sedang memuat data...</p>
    </div>
    <div v-else-if="stockStore.error" class="alert alert-error shadow-lg">
        <span>Error: {{ stockStore.error }}</span>
    </div>

    <!-- 2. KONTEN UTAMA DENGAN TABS -->
    <div v-else>
      <div class="tabs tabs-boxed mb-4">
        <a class="tab" :class="{'tab-active': activeTab === 'current_stock'}" @click="activeTab = 'current_stock'">Stok Saat Ini</a> 
        <a class="tab" :class="{'tab-active': activeTab === 'history'}" @click="activeTab = 'history'">Riwayat Mutasi</a>
      </div>

      <!-- Tab 1: Stok Saat Ini -->
      <div v-show="activeTab === 'current_stock'" class="overflow-x-auto bg-base-100 rounded-lg shadow">
        <!-- ... Tabel stok saat ini tidak berubah ... -->
        <table class="table w-full">
            <thead>
                <tr>
                    <th>Nama Bahan Baku</th>
                    <th>Stok di Outlet Aktif</th>
                    <th>Satuan</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filteredIngredients" :key="item.id" class="hover">
                    <td><div class="font-bold">{{ item.name }}</div></td>
                    <td>
                        <span class="font-mono text-lg" :class="{ 'text-error': item.stock_quantity < item.min_stock && item.min_stock > 0 }">
                            {{ item.stock_quantity }}
                        </span>
                    </td>
                    <td><span class="badge badge-ghost">{{ item.unit }}</span></td>
                    <td>
                        <button class="btn btn-ghost btn-xs" @click="openIngredientModal(item)">Edit</button>
                        <button class="btn btn-ghost btn-xs" @click="openStockAdjustmentModal(item)">Kelola Stok</button>
                        <button class="btn btn-ghost btn-xs text-error" @click="handleDeleteIngredient(item.id)">Hapus</button>
                    </td>
                </tr>
                <tr v-if="filteredIngredients.length === 0">
                    <td colspan="4" class="text-center py-8 text-gray-400">
                        Tidak ada bahan baku yang cocok dengan pencarian Anda.
                    </td>
                </tr>
            </tbody>
        </table>
      </div>

      <!-- Tab 2: Riwayat Mutasi -->
      <div v-show="activeTab === 'history'" class="overflow-x-auto bg-base-100 rounded-lg shadow">
         <table class="table w-full">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Bahan Baku</th>
                <th>Jenis</th>
                <th>Jumlah</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in stockMovementsForActiveOutlet" :key="item.id">
                <td>{{ new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short'}) }}</td>
                <td>{{ item.ingredients?.name || 'N/A' }}</td>
                <td><span class="badge badge-sm" :class="movementBadge(item.movement_type)">{{ item.movement_type }}</span></td>
                <td><span class="font-mono">{{ item.quantity }}</span></td>
                <td>{{ item.ref }}</td>
              </tr>
              <tr v-if="stockMovementsForActiveOutlet.length === 0">
                <td colspan="5" class="text-center py-8 text-gray-400">Belum ada riwayat mutasi untuk outlet ini.</td>
              </tr>
            </tbody>
          </table>
      </div>
    </div>

    <!-- Daftar Modal -->
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
    <!-- 3. TAMBAHKAN MODAL BARU KITA DI SINI -->
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
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import { useProductStore } from '@/stores/productStore';
import { useStockStore } from '@/stores/stockStore';
import IngredientFormModal from '@/components/stock/IngredientFormModal.vue';
import StockAdjustmentModal from '@/components/stock/StockAdjustmentModal.vue';
// 4. Impor komponen modal baru
import StockMovementModal from '@/components/stock/StockMovementModal.vue';

// Inisialisasi store (tidak berubah)
const userStore = useUserStoreRefactored();
const productStore = useProductStore();
const stockStore = useStockStore();

// 5. Ambil `stockMovements` dari store
const { outlets } = storeToRefs(productStore);
const { ingredients, ingredientStocks, stockMovements } = storeToRefs(stockStore);

// State lokal untuk halaman
const activeOutletId = ref(null);
const searchQuery = ref('');
const itemToEdit = ref(null);
// 6. Tambah state untuk tab dan modal baru
const activeTab = ref('current_stock');
const isIngredientModalVisible = ref(false);
const isStockModalVisible = ref(false);
const isMovementModalVisible = ref(false);

// Computed properties (tidak berubah, kecuali yang baru)
const activeOutletName = computed(() => outlets.value.find(o => o.id === activeOutletId.value)?.name || '');
const filteredIngredients = computed(() => { /* ... kode tidak berubah ... */
    const currentOutletId = activeOutletId.value;
    if (!currentOutletId) return [];
    const resultsWithStock = ingredients.value.map(ing => {
        const stockInfo = ingredientStocks.value.find(s => s.ingredient_id === ing.id && s.outlet_id === currentOutletId);
        return { ...ing, stock_quantity: stockInfo?.stock_quantity ?? 0, min_stock: stockInfo?.min_stock ?? 0, is_active: stockInfo?.is_active ?? true, stock_id: stockInfo?.id, };
    });
    if (!searchQuery.value) return resultsWithStock;
    return resultsWithStock.filter(ing => ing.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

// 7. Tambah computed untuk memfilter riwayat mutasi
const stockMovementsForActiveOutlet = computed(() => {
  if (!activeOutletId.value || !stockMovements.value) return [];
  // Kita perlu mengambil data mutasi yang lengkap dari store
  return stockMovements.value.filter(m => m.outlet_id === activeOutletId.value);
});

// Helper untuk warna badge
const movementBadge = (type) => ({
  'masuk': 'badge-success',
  'keluar': 'badge-warning',
  'penyesuaian': 'badge-info',
}[type] || 'badge-ghost');


// Lifecycle & Watchers (tidak berubah)
onMounted(() => { /* ... kode tidak berubah ... */
    const fetchData = () => { if (productStore.outlets.length === 0) { productStore.fetchInitialData(); } stockStore.fetchStockPageData(); };
    if (userStore.isReady) { fetchData(); } else { const unwatch = watch(() => userStore.isReady, (ready) => { if (ready) { fetchData(); unwatch(); } }); }
});
watch(outlets, (newOutlets) => { /* ... kode tidak berubah ... */
    if (newOutlets && newOutlets.length > 0 && !activeOutletId.value) { activeOutletId.value = newOutlets[0].id; }
}, { immediate: true });


// Handlers UI (tidak berubah, kecuali yang baru)
function openIngredientModal(ingredient = null) { itemToEdit.value = ingredient; isIngredientModalVisible.value = true; }
async function handleSaveIngredient(formData) { await stockStore.saveIngredient(formData); isIngredientModalVisible.value = false; }
function openStockAdjustmentModal(ingredientData) { const dataForModal = { ...ingredientData, outlet_id: activeOutletId.value }; itemToEdit.value = dataForModal; isStockModalVisible.value = true; }
async function handleSaveStock(stockData) { const success = await stockStore.saveIngredientStock(stockData); if (success) { isStockModalVisible.value = false; } }
async function handleDeleteIngredient(ingredientId) { await stockStore.deleteIngredient(ingredientId); }

// 8. Tambahkan handler untuk menyimpan mutasi baru
async function handleSaveMovement(movementData) {
    const success = await stockStore.addStockMovement(movementData);
    if (success) {
        isMovementModalVisible.value = false;
    }
}
</script>