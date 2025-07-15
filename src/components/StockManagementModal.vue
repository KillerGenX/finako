<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div v-if="product" class="bg-base-100 p-6 rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto"
         :class="product.has_variants ? 'max-w-3xl' : 'max-w-md'">

      <h3 class="text-xl font-bold mb-1">Atur Stok & Harga</h3>
      <p class="text-base-content/70 mb-4">
        Produk: <span class="font-semibold">{{ product.name }}</span> | 
        Outlet: <span class="font-semibold">{{ outletName }}</span>
      </p>

      <!-- TAMPILAN UNTUK PRODUK TUNGGAL (NON-VARIAN) -->
      <div v-if="!product.has_variants" class="space-y-4">
        <div>
          <label class="label"><span class="label-text">Jumlah Stok</span></label>
          <input type="number" v-model.number="form.stock_quantity" class="input input-bordered w-full" min="0" />
        </div>
        <div>
          <label class="label"><span class="label-text">Harga Jual di Outlet Ini</span></label>
          <input type="number" v-model.number="form.price" class="input input-bordered w-full" min="0" />
        </div>
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Jual produk ini di outlet ini?</span>
            <input type="checkbox" v-model="form.is_active" class="toggle toggle-primary" />
          </label>
        </div>
        <div class="flex justify-end gap-3 mt-6">
            <button class="btn" @click="$emit('close')">Batal</button>
            <button class="btn btn-primary" @click="handleSaveSingleStock">Simpan</button>
        </div>
      </div>

      <!-- TAMPILAN UNTUK PRODUK DENGAN VARIAN -->
      <div v-else>
        <table class="table table-compact w-full">
            <thead>
                <tr>
                    <th>Nama Varian</th>
                    <th>Stok</th>
                    <th>Harga</th>
                    <th>Aktif</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(variant, index) in variantForms" :key="variant.variant_id">
                    <td>{{ variant.name }}</td>
                    <td><input type="number" v-model.number="variant.stock_quantity" class="input input-xs input-bordered w-24" /></td>
                    <td><input type="number" v-model.number="variant.price" class="input input-xs input-bordered w-32" /></td>
                    <td><input type="checkbox" v-model="variant.is_active" class="toggle toggle-xs toggle-primary" /></td>
                </tr>
            </tbody>
        </table>
        <div class="flex justify-end gap-3 mt-6">
            <button class="btn" @click="$emit('close')">Batal</button>
            <button class="btn btn-primary" @click="handleSaveVariantStocks">Simpan Semua</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useProductStore } from '@/stores/productStore';

const props = defineProps({
  show: Boolean,
  product: Object,
  activeOutletId: String,
  outlets: Array,
});
const emit = defineEmits(['close']);
const productStore = useProductStore();

// State lokal untuk form
const form = ref({});
const variantForms = ref([]);

const outletName = computed(() => {
    return props.outlets?.find(o => o.id === props.activeOutletId)?.name || '';
});

// Awasi perubahan produk yang dipilih.
// Setiap kali modal dibuka dengan produk baru, siapkan form-nya.
watch(() => props.product, (newProduct) => {
    if (!newProduct || !props.activeOutletId) return;

    if (!newProduct.has_variants) {
        // Siapkan form untuk produk tunggal
        const outletInfo = newProduct.product_outlets?.find(po => po.outlet_id === props.activeOutletId);
        form.value = {
            product_id: newProduct.id,
            outlet_id: props.activeOutletId,
            stock_quantity: outletInfo?.stock_quantity ?? 0,
            price: outletInfo?.price ?? 0,
            is_active: outletInfo?.is_active ?? true,
        };
    } else {
        // Siapkan form (array) untuk produk dengan varian
        variantForms.value = newProduct.product_variants.map(variant => {
            const outletInfo = variant.product_variant_outlets?.find(pvo => pvo.outlet_id === props.activeOutletId);
            return {
                variant_id: variant.id,
                outlet_id: props.activeOutletId,
                name: variant.name,
                stock_quantity: outletInfo?.stock_quantity ?? 0,
                price: outletInfo?.price ?? variant.price ?? 0,
                is_active: outletInfo?.is_active ?? true,
            };
        });
    }
}, { deep: true });


async function handleSaveSingleStock() {
    const success = await productStore.saveProductStock(form.value);
    if (success) emit('close');
}

async function handleSaveVariantStocks() {
    // Kita hanya perlu mengirimkan data yang relevan, hapus 'name'
    const payload = variantForms.value.map(({ name, ...rest }) => rest);
    const success = await productStore.saveVariantStocks(payload);
    if (success) emit('close');
}
</script>