<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
    <div v-if="product" class="bg-white rounded-t-2xl md:rounded-lg shadow-xl w-full h-[95vh] md:max-h-[90vh] flex flex-col"
         :class="product.has_variants ? 'max-w-full md:max-w-4xl' : 'max-w-full md:max-w-lg'">

      <!-- Sticky Header -->
      <div class="flex-shrink-0 bg-white border-b border-gray-100 px-4 md:px-6 py-4 rounded-t-2xl md:rounded-t-lg">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg md:text-xl font-bold text-gray-800">Atur Stok & Harga</h3>
          <button 
            @click="$emit('close')"
            class="btn btn-ghost btn-sm btn-circle touch-target"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-sm text-gray-600">
            <span class="font-semibold text-teal-600">{{ product.name }}</span>
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Outlet: <span class="font-medium text-teal-600">{{ outletName }}</span>
          </p>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        
        <!-- TAMPILAN UNTUK PRODUK TUNGGAL (TERMASUK KOMPOSIT) -->
        <div v-if="!product.has_variants" class="space-y-4">
          
          <!-- Card Utama -->
          <div class="bg-white border border-gray-200 rounded-xl p-4">
            <!-- Field Stok (hanya untuk produk non-komposit) -->
            <div v-if="!product.is_composite" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah Stok Saat Ini</label>
              <input 
                type="number" 
                v-model.number="form.stock_quantity" 
                class="input input-bordered w-full touch-target no-zoom" 
                min="0" 
                placeholder="0"
              />
            </div>
            
            <!-- Grup Harga -->
            <div class="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Harga Modal (HPP)</label>
                <input 
                  type="number" 
                  v-model.number="form.cost_price" 
                  class="input input-bordered w-full touch-target no-zoom" 
                  min="0"
                  placeholder="0"
                  :disabled="product.is_composite"
                  :class="{'bg-gray-100 cursor-not-allowed': product.is_composite}" 
                />
                <p v-if="product.is_composite" class="text-xs text-teal-600 mt-2 flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Dihitung otomatis dari resep
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Harga Jual</label>
                <input 
                  type="number" 
                  v-model.number="form.price" 
                  class="input input-bordered w-full touch-target no-zoom" 
                  min="0" 
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <!-- Toggle Aktif -->
          <div class="bg-white border border-gray-200 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <span class="font-medium text-gray-700">Status Jual</span>
                </div>
                <p class="text-sm text-gray-500">Nonaktifkan untuk menyembunyikan produk di outlet ini</p>
              </div>
              <input 
                type="checkbox" 
                v-model="form.is_active" 
                class="toggle toggle-primary touch-target ml-4" 
              />
            </div>
          </div>
        </div>

        <!-- TAMPILAN UNTUK PRODUK DENGAN VARIAN -->
        <div v-else class="space-y-4">
          <!-- Mobile: Card Layout untuk Varian -->
          <div class="block md:hidden space-y-3">
            <div v-for="variant in variantForms" :key="variant.variant_id" 
                 class="bg-white border border-gray-200 rounded-xl p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-gray-800">{{ variant.name }}</h4>
                <input 
                  type="checkbox" 
                  v-model="variant.is_active" 
                  class="toggle toggle-primary touch-target" 
                />
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Stok</label>
                  <input 
                    type="number" 
                    v-model.number="variant.stock_quantity" 
                    class="input input-bordered input-sm w-full touch-target no-zoom text-center" 
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Harga Modal</label>
                  <input 
                    type="number" 
                    v-model.number="variant.cost_price" 
                    class="input input-bordered input-sm w-full touch-target no-zoom" 
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div class="mt-3">
                <label class="block text-xs font-medium text-gray-500 mb-1">Harga Jual</label>
                <input 
                  type="number" 
                  v-model.number="variant.price" 
                  class="input input-bordered input-sm w-full touch-target no-zoom" 
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <!-- Desktop: Table Layout untuk Varian -->
          <div class="hidden md:block overflow-x-auto border border-gray-200 rounded-xl">
            <table class="table-auto w-full text-sm">
              <thead class="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th class="px-4 py-3 font-medium">Nama Varian</th>
                  <th class="px-4 py-3 font-medium text-center">Stok</th>
                  <th class="px-4 py-3 font-medium text-center">Harga Modal</th>
                  <th class="px-4 py-3 font-medium text-center">Harga Jual</th>
                  <th class="px-4 py-3 font-medium text-center">Aktif</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="variant in variantForms" :key="variant.variant_id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-semibold text-gray-800">{{ variant.name }}</td>
                  <td class="px-4 py-3">
                    <input 
                      type="number" 
                      v-model.number="variant.stock_quantity" 
                      class="input input-xs input-bordered w-24 mx-auto block text-center" 
                      min="0"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <input 
                      type="number" 
                      v-model.number="variant.cost_price" 
                      class="input input-xs input-bordered w-32 mx-auto block text-right" 
                      min="0"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <input 
                      type="number" 
                      v-model.number="variant.price" 
                      class="input input-xs input-bordered w-32 mx-auto block text-right" 
                      min="0"
                    />
                  </td>
                  <td class="px-4 py-3 text-center">
                    <input 
                      type="checkbox" 
                      v-model="variant.is_active" 
                      class="toggle toggle-xs toggle-primary" 
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sticky Footer dengan Action Buttons -->
      <div class="flex-shrink-0 bg-white border-t border-gray-100 px-4 md:px-6 py-4 pb-safe rounded-b-2xl md:rounded-b-lg">
        <div class="flex flex-col md:flex-row gap-3">
          <button 
            class="btn btn-outline w-full md:w-auto touch-target order-2 md:order-1" 
            @click="$emit('close')"
          >
            Batal
          </button>
          <button 
            class="btn bg-teal-600 hover:bg-teal-700 text-white border-none w-full md:w-auto touch-target order-1 md:order-2" 
            @click="product.has_variants ? handleSaveVariantStocks() : handleSaveSingleStock()" 
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ product.has_variants ? 'Simpan Semua Perubahan' : 'Simpan Pengaturan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, watch, computed } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { supabase } from '@/supabase';

const props = defineProps({
  show: Boolean,
  product: Object,
  activeOutletId: String,
  outlets: Array,
});
const emit = defineEmits(['close']);
const productStore = useProductStore();

const form = ref({});
const variantForms = ref([]);
const isSaving = ref(false);

const outletName = computed(() => {
    return props.outlets?.find(o => o.id === props.activeOutletId)?.name || '';
});

watch(() => props.product, async (newProduct) => {
    if (!newProduct || !props.activeOutletId) return;

    if (!newProduct.has_variants) {
        const outletInfo = newProduct.product_outlets?.find(po => po.outlet_id === props.activeOutletId);

        let calculatedCostPrice = outletInfo?.cost_price ?? 0;
        if (newProduct.is_composite) {
            const { data, error } = await supabase.rpc('get_product_cost_price', {
                p_id: newProduct.id,
                o_id: props.activeOutletId
            });
            if (!error) {
                calculatedCostPrice = data;
            } else {
                console.error("Gagal menghitung HPP komposit:", error);
            }
        }
        
        form.value = {
            product_id: newProduct.id,
            outlet_id: props.activeOutletId,
            stock_quantity: outletInfo?.stock_quantity ?? 0,
            price: outletInfo?.price ?? 0,
            cost_price: calculatedCostPrice,
            is_active: outletInfo?.is_active ?? true,
        };
    
    } else {
        variantForms.value = newProduct.product_variants.map(variant => {
            const outletInfo = variant.product_variant_outlets?.find(pvo => pvo.outlet_id === props.activeOutletId);
            return {
                variant_id: variant.id,
                outlet_id: props.activeOutletId,
                name: variant.name,
                stock_quantity: outletInfo?.stock_quantity ?? 0,
                cost_price: outletInfo?.cost_price ?? 0,
                price: outletInfo?.price ?? variant.price ?? 0,
                is_active: outletInfo?.is_active ?? true,
            };
        });
    }
}, { deep: true, immediate: true });

async function handleSaveSingleStock() {
    isSaving.value = true;
    
    const payload = {
        product_id: form.value.product_id,
        outlet_id: form.value.outlet_id,
        stock_quantity: form.value.stock_quantity,
        price: form.value.price,
        is_active: form.value.is_active,
    };
    if (!props.product.is_composite) {
        payload.cost_price = form.value.cost_price;
    }

    const success = await productStore.saveProductStock(payload);
    if (success) emit('close');
    isSaving.value = false;
}

async function handleSaveVariantStocks() {
    isSaving.value = true;
    const payload = variantForms.value.map(({ name, ...rest }) => rest);
    const success = await productStore.saveVariantStocks(payload);
    if (success) emit('close');
    isSaving.value = false;
}
</script>

<style scoped>
/* Mobile-first responsive styles */
.touch-target {
  min-height: 44px; /* iOS touch target minimum */
  touch-action: manipulation;
}

.no-zoom {
  font-size: 16px; /* Prevent zoom on iOS */
}

/* Safe area handling for mobile devices */
.pb-safe {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

/* Responsive modal sizing */
@media (max-width: 768px) {
  .modal-box {
    margin: 0;
    border-radius: 16px 16px 0 0;
    height: 95vh;
  }
}

/* Enhanced mobile form styling */
@media (max-width: 640px) {
  .input, .select, .textarea {
    font-size: 16px; /* Prevent zoom */
    padding: 12px 16px;
  }
  
  .input-sm {
    font-size: 16px;
    padding: 8px 12px;
  }
  
  .btn {
    padding: 12px 20px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .toggle {
    transform: scale(1.2);
  }
  
  /* Better spacing for mobile */
  .space-y-4 > * + * {
    margin-top: 16px;
  }
  
  .space-y-3 > * + * {
    margin-top: 12px;
  }
}

/* Improved contrast and accessibility */
.bg-teal-600 {
  background-color: rgb(13 148 136);
}

.hover\:bg-teal-700:hover {
  background-color: rgb(15 118 110);
}

/* Custom section styling */
.border-gray-100 {
  border-color: rgb(243 244 246);
}

.border-gray-200 {
  border-color: rgb(229 231 235);
}

/* Enhanced card styling for variants */
.bg-gray-50 {
  background-color: rgb(249 250 251);
}

/* Table hover effects */
.hover\:bg-gray-50:hover {
  background-color: rgb(249 250 251);
}
</style>
