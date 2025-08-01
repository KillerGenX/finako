<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-full">
    <!-- Header dengan Tombol Aksi Mobile-First -->
    <div class="flex flex-col mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Manajemen Stok</h1>
        <!-- Mobile: Hamburger menu untuk filter (jika diperlukan nanti) -->
      </div>
      
      <!-- Mobile: Full-width action buttons -->
      <div class="flex flex-col md:flex-row gap-3 md:gap-2">
        <button 
          class="btn btn-outline border-gray-300 w-full md:w-auto touch-target order-2 md:order-1" 
          @click="isMovementModalVisible = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M4 18v-5h5m11-4h-5V4M15 18h5v-5" />
          </svg>
          Input Mutasi Stok
        </button>
        <button 
          class="btn bg-teal-600 hover:bg-teal-700 text-white border-none w-full md:w-auto touch-target order-1 md:order-2" 
          @click="openIngredientModal()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Bahan Baku
        </button>
      </div>
    </div>

    <!-- Panel Filter Mobile-Optimized -->
    <div class="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
      <div class="p-4">
        <div class="flex items-center space-x-2 mb-4">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
          </svg>
          <h3 class="font-semibold text-gray-800">Filter & Pencarian</h3>
        </div>
        
        <div class="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Outlet Aktif</label>
            <select 
              v-model="activeOutletId" 
              class="select select-bordered w-full touch-target no-zoom focus:ring-teal-500 focus:border-teal-500"
            >
              <option v-for="outlet in productStore.outlets" :key="outlet.id" :value="outlet.id">
                {{ outlet.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cari Bahan Baku</label>
            <div class="relative">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Ketik nama bahan baku..." 
                class="input input-bordered w-full pl-10 touch-target no-zoom focus:ring-teal-500 focus:border-teal-500" 
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>
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
      <!-- Mobile-First Tab Navigation -->
      <div class="bg-white rounded-t-xl border border-gray-200 border-b-0">
        <nav class="flex" aria-label="Tabs">
          <button 
            @click="activeTab = 'current_stock'" 
            :class="[
              activeTab === 'current_stock' 
                ? 'border-teal-500 text-teal-600 bg-teal-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50', 
              'flex-1 py-4 px-4 border-b-2 font-medium text-sm touch-target transition-colors duration-200'
            ]"
          >
            <div class="flex items-center justify-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <span>Stok Saat Ini</span>
            </div>
          </button>
          <button 
            @click="activeTab = 'history'" 
            :class="[
              activeTab === 'history' 
                ? 'border-teal-500 text-teal-600 bg-teal-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50', 
              'flex-1 py-4 px-4 border-b-2 font-medium text-sm touch-target transition-colors duration-200'
            ]"
          >
            <div class="flex items-center justify-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Riwayat Mutasi</span>
            </div>
          </button>
        </nav>
      </div>

      <!-- Konten Tab 1: Stok Saat Ini - Mobile-First Design -->
      <div v-show="activeTab === 'current_stock'" class="bg-white rounded-b-xl border border-gray-200 border-t-0">
        
        <!-- Mobile: Card Layout -->
        <div class="block md:hidden divide-y divide-gray-200 pb-safe-area">
          <div v-for="item in filteredIngredients" :key="item.id" 
               class="p-4 hover:bg-gray-50 transition-colors duration-200">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-800 text-lg mb-1">{{ item.name }}</h3>
                <div class="flex items-center space-x-3">
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    <span class="font-mono text-xl font-bold" :class="{ 'text-red-600': item.stock_quantity < item.min_stock && item.min_stock > 0, 'text-gray-800': !(item.stock_quantity < item.min_stock && item.min_stock > 0) }">
                      {{ item.stock_quantity }}
                    </span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {{ item.unit }}
                    </span>
                  </div>
                </div>
                <div v-if="item.stock_quantity < item.min_stock && item.min_stock > 0" 
                     class="flex items-center space-x-1 mt-2">
                  <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <span class="text-xs text-red-600 font-medium">Stok di bawah minimum</span>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons - Mobile Optimized -->
            <div class="flex space-x-2">
              <button 
                @click="openIngredientModal(item)" 
                class="flex-1 btn btn-outline btn-sm touch-target hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
                Edit
              </button>
              <button 
                @click="openStockAdjustmentModal(item)" 
                class="flex-1 btn btn-outline btn-sm touch-target hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Kelola
              </button>
              <button 
                @click="handleDeleteIngredient(item.id)" 
                class="btn btn-outline btn-sm touch-target hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Empty State untuk Mobile -->
          <div v-if="filteredIngredients.length === 0" class="p-8 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <p class="text-gray-500 font-medium">Tidak ada bahan baku yang cocok</p>
            <p class="text-sm text-gray-400 mt-1">Coba ubah filter pencarian Anda</p>
          </div>
        </div>

        <!-- Desktop: Table Layout (preserved) -->
        <div class="hidden md:block overflow-x-auto">
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
                  <tr v-for="item in filteredIngredients" :key="item.id" class="hover:bg-gray-50">
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
                              <button @click="openIngredientModal(item)" class="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600" title="Edit Master Bahan">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button @click="openStockAdjustmentModal(item)" class="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Kelola Stok & Harga Modal">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                                </svg>
                              </button>
                              <button @click="handleDeleteIngredient(item.id)" class="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600" title="Hapus Master Bahan">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                          </div>
                      </td>
                  </tr>
                  <tr v-if="filteredIngredients.length === 0">
                      <td colspan="4" class="text-center py-12 text-gray-500">Tidak ada bahan baku yang cocok.</td>
                  </tr>
              </tbody>
          </table>
        </div>
      </div>

      <!-- Konten Tab 2: Riwayat Mutasi - Mobile-First Design -->
      <div v-show="activeTab === 'history'" class="bg-white rounded-b-xl border border-gray-200 border-t-0">
        
        <!-- Mobile: Card Layout untuk History -->
        <div class="block md:hidden divide-y divide-gray-200 pb-safe-area">
          <div v-for="item in stockMovementsForActiveOutlet" :key="item.id" 
               class="p-4 hover:bg-gray-50 transition-colors duration-200">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="movementBadge(item.movement_type)">
                    {{ item.movement_type }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short'}) }}
                  </span>
                </div>
                <h4 class="font-semibold text-gray-800">{{ item.ingredients?.name || 'N/A' }}</h4>
                <p class="text-sm text-gray-600 mt-1">{{ item.ref || 'Tanpa keterangan' }}</p>
              </div>
              <div class="text-right">
                <div class="font-mono text-lg font-bold" :class="item.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ item.quantity > 0 ? '+' : '' }}{{ item.quantity }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty State untuk Mobile History -->
          <div v-if="stockMovementsForActiveOutlet.length === 0" class="p-8 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-gray-500 font-medium">Belum ada riwayat mutasi</p>
            <p class="text-sm text-gray-400 mt-1">Mutasi stok akan muncul di sini</p>
          </div>
        </div>

        <!-- Desktop: Table Layout (preserved) -->
        <div class="hidden md:block overflow-x-auto">
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
                <tr v-for="item in stockMovementsForActiveOutlet" :key="item.id" class="hover:bg-gray-50">
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

<style scoped>
/* Mobile-first responsive styles for StokView */
.touch-target {
  min-height: 44px; /* iOS touch target minimum */
  touch-action: manipulation;
}

.no-zoom {
  font-size: 16px; /* Prevent zoom on iOS */
}

.pb-safe-area {
  padding-bottom: calc(env(safe-area-inset-bottom) + 24px);
}

/* Enhanced mobile form styling */
@media (max-width: 640px) {
  .input, .select {
    font-size: 16px; /* Prevent zoom */
    padding: 12px 16px;
  }
  
  .btn {
    padding: 12px 20px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .btn-sm {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .pb-safe-area {
    padding-bottom: 32px; /* Extra padding for mobile to prevent button cutoff */
  }
}

/* Tab button hover effects */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Custom badge colors */
.bg-green-100 { background-color: rgb(220 252 231); }
.text-green-800 { color: rgb(22 101 52); }
.bg-red-100 { background-color: rgb(254 226 226); }
.text-red-800 { color: rgb(153 27 27); }
.bg-blue-100 { background-color: rgb(219 234 254); }
.text-blue-800 { color: rgb(30 64 175); }

/* Enhanced card hover effects */
.hover\:bg-gray-50:hover {
  background-color: rgb(249 250 251);
}

/* Button hover enhancements */
.hover\:bg-yellow-50:hover {
  background-color: rgb(254 252 232);
}
.hover\:border-yellow-300:hover {
  border-color: rgb(253 224 71);
}
.hover\:text-yellow-700:hover {
  color: rgb(161 98 7);
}

.hover\:bg-blue-50:hover {
  background-color: rgb(239 246 255);
}
.hover\:border-blue-300:hover {
  border-color: rgb(147 197 253);
}
.hover\:text-blue-700:hover {
  color: rgb(29 78 216);
}

.hover\:bg-red-50:hover {
  background-color: rgb(254 242 242);
}
.hover\:border-red-300:hover {
  border-color: rgb(252 165 165);
}
.hover\:text-red-700:hover {
  color: rgb(185 28 28);
}

/* Improved focus states */
.focus\:ring-teal-500:focus {
  --tw-ring-color: rgb(20 184 166);
}
.focus\:border-teal-500:focus {
  border-color: rgb(20 184 166);
}
</style>
