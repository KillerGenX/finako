<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div v-if="product" class="bg-white p-6 rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto"
         :class="product.has_variants ? 'max-w-3xl' : 'max-w-md'">

      <h3 class="text-xl font-bold text-gray-800">Atur Stok & Harga</h3>
      <p class="text-gray-500 mb-6">
        Produk: <span class="font-semibold text-teal-600">{{ product.name }}</span> | 
        Outlet: <span class="font-semibold text-teal-600">{{ outletName }}</span>
      </p>

      <!-- TAMPILAN UNTUK PRODUK TUNGGAL (TERMASUK KOMPOSIT) -->
      <div v-if="!product.has_variants" class="space-y-6">
        
        <div class="space-y-4 p-4 border rounded-lg bg-gray-50/50">
          <!-- Field Stok (hanya untuk produk non-komposit) -->
          <div v-if="!product.is_composite">
            <label class="block text-sm font-medium text-gray-700">Jumlah Stok Saat Ini</label>
            <input type="number" v-model.number="form.stock_quantity" class="input input-bordered w-full mt-1" min="0" />
          </div>
          
          <!-- Grup Harga -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Harga Modal (HPP)</label>
                <input 
                  type="number" 
                  v-model.number="form.cost_price" 
                  class="input input-bordered w-full mt-1" 
                  min="0"
                  :disabled="product.is_composite"
                  :class="{'bg-gray-200': product.is_composite}" 
                />
                <p v-if="product.is_composite" class="text-xs text-blue-600 mt-1">Dihitung otomatis dari resep.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Harga Jual</label>
                <input type="number" v-model.number="form.price" class="input input-bordered w-full mt-1" min="0" />
              </div>
          </div>
        </div>
        
        <!-- Toggle Aktif -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
                <span class="font-medium text-gray-700">Status Jual</span>
                <p class="text-xs text-gray-500">Nonaktifkan untuk menyembunyikan produk di outlet ini.</p>
            </div>
            <input type="checkbox" v-model="form.is_active" class="toggle toggle-primary" />
        </div>
        
        <!-- Tombol Aksi -->
        <div class="flex justify-end gap-3 pt-4 border-t">
            <button class="btn btn-ghost" @click="$emit('close')">Batal</button>
            <button class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" @click="handleSaveSingleStock" :disabled="isSaving">
                <span v-if="isSaving" class="loading loading-spinner"></span>
                Simpan Pengaturan
            </button>
        </div>
      </div>

      <!-- TAMPILAN UNTUK PRODUK DENGAN VARIAN -->
      <div v-else>
        <div class="overflow-x-auto border rounded-lg">
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
                    <!-- LOGIKA v-for dan :key TIDAK DIUBAH -->
                    <tr v-for="variant in variantForms" :key="variant.variant_id">
                        <td class="px-4 py-2 font-semibold text-gray-800">{{ variant.name }}</td>
                        <td class="px-4 py-2"><input type="number" v-model.number="variant.stock_quantity" class="input input-xs input-bordered w-24 mx-auto block text-center" /></td>
                        <td class="px-4 py-2"><input type="number" v-model.number="variant.cost_price" class="input input-xs input-bordered w-32 mx-auto block text-right" /></td>
                        <td class="px-4 py-2"><input type="number" v-model.number="variant.price" class="input input-xs input-bordered w-32 mx-auto block text-right" /></td>
                        <td class="px-4 py-2 text-center"><input type="checkbox" v-model="variant.is_active" class="toggle toggle-xs toggle-primary" /></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button class="btn btn-ghost" @click="$emit('close')">Batal</button>
            <button class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" @click="handleSaveVariantStocks" :disabled="isSaving">
                <span v-if="isSaving" class="loading loading-spinner"></span>
                Simpan Semua Perubahan
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
