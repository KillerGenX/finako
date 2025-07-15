<template>
  <!-- Kita gunakan v-if, bukan v-show, agar state-nya fresh setiap kali dibuka -->
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
    <div class="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-2xl">
      <h3 class="text-xl font-bold mb-4">Kelola Varian Produk</h3>
      
      <!-- Form untuk menambah atau mengedit varian -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mb-4 p-4 bg-base-200 rounded-lg">
        <div class="form-control">
          <label class="label-text">Nama Varian</label>
          <input v-model="variantForm.name" placeholder="Contoh: Panas" class="input input-sm input-bordered w-full" />
        </div>
        <div class="form-control">
          <label class="label-text">Harga</label>
          <input v-model.number="variantForm.price" type="number" min="0" placeholder="Rp" class="input input-sm input-bordered w-full" />
        </div>
        <div class="form-control">
          <label class="label-text">SKU (Opsional)</label>
          <input v-model.trim="variantForm.sku" placeholder="SKU Varian" class="input input-sm input-bordered w-full" />
        </div>
        <div class="form-control">
          <button @click="addOrUpdateVariant" class="btn btn-sm btn-primary w-full">{{ editingIndex === null ? 'Tambah' : 'Update' }}</button>
          <button v-if="editingIndex !== null" @click="cancelEdit" class="btn btn-sm btn-ghost mt-1">Batal</button>
        </div>
      </div>

      <!-- Tabel daftar varian yang sudah ada -->
      <div class="max-h-60 overflow-y-auto">
        <table class="table table-compact w-full">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Harga</th>
              <th>SKU</th>
              <th class="w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(variant, index) in localVariants" :key="index">
              <td>{{ variant.name }}</td>
              <td>{{ formatCurrency(variant.price) }}</td>
              <td>{{ variant.sku || '-' }}</td>
              <td>
                <button @click="editVariant(index)" class="btn btn-ghost btn-xs">Edit</button>
                <button @click="deleteVariant(index)" class="btn btn-ghost btn-xs text-error">Hapus</button>
              </td>
            </tr>
            <tr v-if="localVariants.length === 0">
              <td colspan="4" class="text-center text-gray-400 py-4">Belum ada varian ditambahkan.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tombol Selesai -->
      <div class="flex justify-end mt-6">
        <button class="btn" @click="done">Selesai</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  variants: Array, // Menerima daftar varian dari komponen induk
});

const emit = defineEmits(['close', 'update:variants']);

// State lokal untuk modal ini
const localVariants = ref([]);
const variantForm = ref({ name: '', price: 0, sku: '' });
const editingIndex = ref(null);

// Awasi perubahan dari luar dan update state lokal
watch(() => props.variants, (newVal) => {
  // Buat salinan agar tidak mengubah data induk secara langsung
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
    // Update
    localVariants.value[editingIndex.value] = { ...variantForm.value };
  } else {
    // Add
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
  // Kirim data varian yang sudah diupdate kembali ke induk
  emit('update:variants', localVariants.value);
  emit('close');
}
</script>