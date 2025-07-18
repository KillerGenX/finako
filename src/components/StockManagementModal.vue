<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div v-if="product" class="bg-base-100 p-6 rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto"
         :class="product.has_variants ? 'max-w-3xl' : 'max-w-md'">

      <h3 class="text-xl font-bold mb-1">Atur Stok & Harga</h3>
      <p class="text-base-content/70 mb-4">
        Produk: <span class="font-semibold">{{ product.name }}</span> | 
        Outlet: <span class="font-semibold">{{ outletName }}</span>
      </p>

      <!-- =============================================== -->
      <!-- TAMPILAN UNTUK PRODUK TUNGGAL (TERMASUK KOMPOSIT) -->
      <!-- =============================================== -->
      <div v-if="!product.has_variants" class="space-y-4">
        
        <!-- Field Stok (hanya untuk produk non-komposit) -->
        <div v-if="!product.is_composite">
          <label class="label"><span class="label-text">Jumlah Stok</span></label>
          <input type="number" v-model.number="form.stock_quantity" class="input input-bordered w-full" min="0" />
        </div>
        
        <!-- Grup Harga -->
        <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label"><span class="label-text">Harga Modal (HPP)</span></label>
              <input 
                type="number" 
                v-model.number="form.cost_price" 
                class="input input-bordered w-full" 
                min="0"
                :disabled="product.is_composite" 
              />
              <label v-if="product.is_composite" class="label">
                <span class="label-text-alt text-info">Dihitung otomatis dari resep</span>
              </label>
            </div>
            <div>
              <label class="label"><span class="label-text">Harga Jual</span></label>
              <input type="number" v-model.number="form.price" class="input input-bordered w-full" min="0" />
            </div>
        </div>
        
        <!-- Toggle Aktif -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Jual produk ini di outlet ini?</span>
            <input type="checkbox" v-model="form.is_active" class="toggle toggle-primary" />
          </label>
        </div>
        
        <!-- Tombol Aksi -->
        <div class="flex justify-end gap-3 mt-6">
            <button class="btn" @click="$emit('close')">Batal</button>
            <button class="btn btn-primary" @click="handleSaveSingleStock" :disabled="isSaving">
                <span v-if="isSaving" class="loading loading-spinner"></span>
                Simpan
            </button>
        </div>
      </div>

      <!-- =============================================== -->
      <!-- TAMPILAN UNTUK PRODUK DENGAN VARIAN -->
      <!-- =============================================== -->
      <div v-else>
        <div class="overflow-x-auto">
            <table class="table table-compact w-full">
                <thead>
                    <tr>
                        <th>Nama Varian</th>
                        <th class="text-center">Stok</th>
                        <th class="text-center">Harga Modal</th>
                        <th class="text-center">Harga Jual</th>
                        <th class="text-center">Aktif</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="variant in variantForms" :key="variant.variant_id">
                        <td class="font-semibold">{{ variant.name }}</td>
                        <td><input type="number" v-model.number="variant.stock_quantity" class="input input-xs input-bordered w-24 mx-auto block" /></td>
                        <td><input type="number" v-model.number="variant.cost_price" class="input input-xs input-bordered w-32 mx-auto block" /></td>
                        <td><input type="number" v-model.number="variant.price" class="input input-xs input-bordered w-32 mx-auto block" /></td>
                        <td class="text-center"><input type="checkbox" v-model="variant.is_active" class="toggle toggle-xs toggle-primary" /></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="flex justify-end gap-3 mt-6">
            <button class="btn" @click="$emit('close')">Batal</button>
            <button class="btn btn-primary" @click="handleSaveVariantStocks" :disabled="isSaving">
                <span v-if="isSaving" class="loading loading-spinner"></span>
                Simpan Semua Varian
            </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
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

// === WATCHER UTAMA YANG MENANGANI KETIGA SKENARIO ===
watch(() => props.product, async (newProduct) => {
    if (!newProduct || !props.activeOutletId) return;

    // --- Skenario 1 & 2: Produk Tunggal / Komposit ---
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
    
    // --- Skenario 3: Produk Varian ---
    } else {
        variantForms.value = newProduct.product_variants.map(variant => {
  
            const outletInfo = variant.product_variant_outlets?.find(pvo => pvo.outlet_id === props.activeOutletId);
            
            return {
                variant_id: variant.id,
                outlet_id: props.activeOutletId,
                name: variant.name,
                stock_quantity: outletInfo?.stock_quantity ?? 0,
                // Untuk HPP & Harga Jual, prioritaskan data spesifik outlet. Jika tidak ada, fallback ke data master varian.
                cost_price: outletInfo?.cost_price ?? 0, // Varian HPP diinput manual
                price: outletInfo?.price ?? variant.price ?? 0,
                is_active: outletInfo?.is_active ?? true,
            };
        });
    }
}, { deep: true, immediate: true });


// --- FUNGSI AKSI ---

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
    // Hapus properti 'name' yang tidak ada di tabel database sebelum mengirim
    const payload = variantForms.value.map(({ name, ...rest }) => rest);
    const success = await productStore.saveVariantStocks(payload);
    if (success) emit('close');
    isSaving.value = false;
}
</script>