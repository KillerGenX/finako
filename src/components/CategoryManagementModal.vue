<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
      <h3 class="text-xl font-bold text-gray-800">Kelola Kategori</h3>
      <p class="text-sm text-gray-500 mb-4">Tambah, edit, atau hapus kategori produk Anda.</p>

      <!-- Form Tambah Kategori Baru -->
      <div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label class="block text-sm font-medium text-gray-700">Tambah Kategori Baru</label>
        <div class="flex gap-2 mt-1">
            <input 
                v-model="newCategoryName" 
                @keyup.enter="handleAddNewCategory" 
                placeholder="Nama kategori baru" 
                class="input input-bordered w-full"
            />
            <button @click="handleAddNewCategory" class="btn bg-teal-600 hover:bg-teal-700 text-white border-none">Simpan</button>
        </div>
      </div>

       <!-- Daftar Kategori yang Ada -->
       <div class="max-h-80 overflow-y-auto border rounded-lg">
         <table class="table-auto w-full text-sm">
            <thead class="bg-gray-50 text-left text-gray-600">
                <tr>
                    <th class="px-4 py-2 font-medium">Nama Kategori</th>
                    <th class="px-4 py-2 font-medium text-center w-32">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                <!-- LOGIKA v-for dan :key TIDAK DIUBAH -->
                <tr v-for="category in productStore.categories" :key="category.id" :class="{'bg-yellow-50': editingCategoryId === category.id}">
                    <td class="px-4 py-2">
                        <!-- LOGIKA v-if dan v-model TIDAK DIUBAH -->
                        <input 
                            v-if="editingCategoryId === category.id" 
                            v-model="editingCategoryName"
                            @keyup.enter="saveEdit(category.id)"
                            @keyup.esc="cancelEdit"
                            class="input input-sm input-bordered w-full" 
                        />
                        <span v-else>{{ category.name }}</span>
                    </td>
                    <td class="px-4 py-2">
                        <!-- LOGIKA v-if TIDAK DIUBAH -->
                        <div v-if="editingCategoryId === category.id" class="flex justify-center gap-1">
                            <button @click="saveEdit(category.id)" class="btn btn-xs btn-ghost text-green-600">Simpan</button>
                            <button @click="cancelEdit" class="btn btn-xs btn-ghost">Batal</button>
                        </div>
                        <!-- LOGIKA v-else TIDAK DIUBAH -->
                        <div v-else class="flex justify-center gap-1">
                            <button @click="startEdit(category)" class="btn btn-xs btn-ghost text-gray-500">Edit</button>
                            <button @click="productStore.deleteCategory(category.id)" class="btn btn-xs btn-ghost text-red-500">Hapus</button>
                        </div>
                    </td>
                </tr>
            </tbody>
         </table>
       </div>

      <!-- Tombol Tutup -->
      <div class="flex justify-end mt-6">
        <button class="btn btn-ghost" @click="$emit('close')">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref } from 'vue';
import { useProductStore } from '@/stores/productStore';

defineProps({ show: Boolean });
defineEmits(['close']);

const productStore = useProductStore();

const newCategoryName = ref('');
const editingCategoryId = ref(null);
const editingCategoryName = ref('');

async function handleAddNewCategory() {
    await productStore.addCategory(newCategoryName.value);
    newCategoryName.value = '';
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
        cancelEdit();
    }
}
</script>
