<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
      <h3 class="text-xl font-bold text-gray-800">Kelola Varian Produk</h3>
      <p class="text-sm text-gray-500 mb-4">Tambah atau edit varian untuk produk ini.</p>
      
      <!-- Form input dengan gaya baru -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4 p-4 bg-gray-50 rounded-lg border">
        <div class="form-control">
          <label class="label-text text-xs font-medium">Nama Varian</label>
          <input v-model="variantForm.name" placeholder="Contoh: Panas" class="input input-sm input-bordered w-full mt-1" />
        </div>
        <div class="form-control">
          <label class="label-text text-xs font-medium">Harga</label>
          <input v-model.number="variantForm.price" type="number" min="0" placeholder="Rp" class="input input-sm input-bordered w-full mt-1" />
        </div>
        <div class="form-control">
          <label class="label-text text-xs font-medium">SKU (Opsional)</label>
          <input v-model.trim="variantForm.sku" placeholder="SKU Varian" class="input input-sm input-bordered w-full mt-1" />
        </div>
        <div class="form-control flex flex-col gap-1">
          <button @click="addOrUpdateVariant" class="btn btn-sm bg-teal-600 hover:bg-teal-700 text-white border-none w-full">{{ editingIndex === null ? 'Tambah' : 'Update' }}</button>
          <button v-if="editingIndex !== null" @click="cancelEdit" class="btn btn-sm btn-ghost w-full">Batal</button>
        </div>
      </div>

      <!-- Daftar varian dengan gaya kartu -->
      <div class="max-h-60 overflow-y-auto space-y-2 p-1">
        <div v-if="localVariants.length === 0" class="text-center text-gray-400 py-8">
            <p>Belum ada varian ditambahkan.</p>
        </div>
        <div v-for="(variant, index) in localVariants" :key="index" class="flex items-center justify-between p-3 rounded-lg border" :class="{'bg-yellow-50 border-yellow-300': editingIndex === index}">
            <div>
                <p class="font-semibold text-gray-800">{{ variant.name }}</p>
                <p class="text-xs text-gray-500">SKU: {{ variant.sku || '-' }}</p>
            </div>
            <div class="flex items-center gap-4">
                <p class="font-bold text-teal-600">{{ formatCurrency(variant.price) }}</p>
                <div class="flex gap-1">
                    <button @click="editVariant(index)" class="btn btn-xs btn-ghost text-gray-500">Edit</button>
                    <button @click="deleteVariant(index)" class="btn btn-xs btn-ghost text-red-500">Hapus</button>
                </div>
            </div>
        </div>
      </div>

      <!-- Tombol Selesai -->
      <div class="flex justify-end mt-6 pt-4 border-t">
        <button class="btn" @click="done">Selesai</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  variants: Array,
});

const emit = defineEmits(['close', 'update:variants']);

const localVariants = ref([]);
const variantForm = ref({ name: '', price: 0, sku: '' });
const editingIndex = ref(null);

watch(() => props.variants, (newVal) => {
  localVariants.value = JSON.parse(JSON.stringify(newVal || []));
}, { immediate: true, deep: true });

function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

function resetForm() {
  variantForm.value = { name: '', price: 0, sku: '' };
  editingIndex.value = null;
}

function addOrUpdateVariant() {
  if (!variantForm.value.name || variantForm.value.price < 0) {
    alert('Nama dan Harga Varian wajib diisi.');
    return;
  }
  if (editingIndex.value !== null) {
    localVariants.value[editingIndex.value] = { ...variantForm.value };
  } else {
    localVariants.value.push({ ...variantForm.value });
  }
  resetForm();
}

function editVariant(index) {
  editingIndex.value = index;
  variantForm.value = { ...localVariants.value[index] };
}

function cancelEdit() {
  resetForm();
}

function deleteVariant(index) {
  if (confirm(`Yakin ingin menghapus varian "${localVariants.value[index].name}"?`)) {
    localVariants.value.splice(index, 1);
  }
}

function done() {
  emit('update:variants', localVariants.value);
  emit('close');
}
</script>
