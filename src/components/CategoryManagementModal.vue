<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-lg">
      <h3 class="text-xl font-bold mb-4">Kelola Kategori</h3>

      <!-- Form Tambah Kategori Baru -->
      <div class="mb-4 p-4 bg-base-200 rounded-lg">
        <label class="label-text font-semibold">Tambah Kategori Baru</label>
        <div class="flex gap-2 mt-2">
            <input 
                v-model="newCategoryName" 
                @keyup.enter="handleAddNewCategory" 
                placeholder="Nama kategori baru" 
                class="input input-bordered input-sm flex-grow"
            />
            <button @click="handleAddNewCategory" class="btn btn-sm btn-primary">Simpan</button>
        </div>
      </div>

       <!-- Daftar Kategori yang Ada -->
       <div class="max-h-80 overflow-y-auto">
         <table class="table table-compact w-full">
            <thead>
                <tr>
                    <th>Nama Kategori</th>
                    <th class="w-28">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="category in productStore.categories" :key="category.id">
                    <td>
                        <!-- Tampilkan input jika sedang diedit, jika tidak tampilkan teks biasa -->
                        <input 
                            v-if="editingCategoryId === category.id" 
                            v-model="editingCategoryName"
                            @keyup.enter="saveEdit(category.id)"
                            @keyup.esc="cancelEdit"
                            class="input input-xs input-bordered w-full" 
                        />
                        <span v-else>{{ category.name }}</span>
                    </td>
                    <td>
                        <!-- Tampilkan tombol Simpan/Batal jika sedang diedit -->
                        <div v-if="editingCategoryId === category.id">
                            <button @click="saveEdit(category.id)" class="btn btn-ghost btn-xs text-success">Simpan</button>
                            <button @click="cancelEdit" class="btn btn-ghost btn-xs">Batal</button>
                        </div>
                        <!-- Tampilkan tombol Edit/Hapus jika tidak sedang diedit -->
                        <div v-else>
                            <button @click="startEdit(category)" class="btn btn-ghost btn-xs">Edit</button>
                            <button @click="productStore.deleteCategory(category.id)" class="btn btn-ghost btn-xs text-error">Hapus</button>
                        </div>
                    </td>
                </tr>
            </tbody>
         </table>
       </div>

      <!-- Tombol Tutup -->
      <div class="flex justify-end mt-6">
        <button class="btn" @click="$emit('close')">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useProductStore } from '@/stores/productStore';

defineProps({ show: Boolean });
defineEmits(['close']);

const productStore = useProductStore();

// State lokal untuk UI modal ini
const newCategoryName = ref('');
const editingCategoryId = ref(null);
const editingCategoryName = ref('');

async function handleAddNewCategory() {
    await productStore.addCategory(newCategoryName.value);
    newCategoryName.value = ''; // Kosongkan input setelah berhasil
}

function startEdit(category) {
    editingCategoryId.value = category.id;
    editingCategoryName.value = category.name;
}

function cancelEdit() {
    editingCategoryId.value = null;
    editingCategoryName.value = '';
}

async function saveEdit(categoryId) {
    const success = await productStore.updateCategory(categoryId, editingCategoryName.value);
    if (success) {
        cancelEdit(); // Kembali ke mode normal jika berhasil
    }
}
</script>