<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
    <div class="bg-white rounded-t-2xl md:rounded-lg shadow-xl w-full max-w-full md:max-w-2xl h-[95vh] md:max-h-[90vh] flex flex-col">
      
      <!-- Sticky Header -->
      <div class="flex-shrink-0 bg-white border-b border-gray-100 px-4 md:px-6 py-4 rounded-t-2xl md:rounded-t-lg">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg md:text-xl font-bold text-gray-800">Kelola Kategori</h3>
          <button 
            @click="$emit('close')"
            class="btn btn-ghost btn-sm btn-circle touch-target"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-500">Tambah, edit, atau hapus kategori produk Anda</p>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        
        <!-- Form Tambah Kategori Baru -->
        <div class="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div class="flex items-center space-x-2 mb-3">
            <div class="p-2 bg-teal-100 rounded-lg">
              <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <h4 class="font-semibold text-gray-800">Tambah Kategori Baru</h4>
          </div>
          <div class="flex flex-col md:flex-row gap-3">
            <input 
              v-model="newCategoryName" 
              @keyup.enter="handleAddNewCategory" 
              placeholder="Nama kategori baru" 
              class="input input-bordered w-full touch-target no-zoom"
            />
            <button 
              @click="handleAddNewCategory" 
              class="btn bg-teal-600 hover:bg-teal-700 text-white border-none touch-target md:w-auto"
              :disabled="!newCategoryName.trim()"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Simpan
            </button>
          </div>
        </div>

        <!-- Daftar Kategori -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <!-- Mobile: Card Layout -->
          <div class="block md:hidden">
            <div class="p-4 border-b border-gray-100">
              <h4 class="font-semibold text-gray-800 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                Kategori yang Ada
              </h4>
            </div>
            <div class="divide-y divide-gray-200">
              <div v-for="category in productStore.categories" :key="category.id" 
                   class="p-4 hover:bg-gray-50 transition-colors"
                   :class="{'bg-yellow-50': editingCategoryId === category.id}">
                
                <!-- Edit Mode -->
                <div v-if="editingCategoryId === category.id" class="space-y-3">
                  <input 
                    v-model="editingCategoryName"
                    @keyup.enter="saveEdit(category.id)"
                    @keyup.esc="cancelEdit"
                    class="input input-bordered w-full touch-target no-zoom" 
                    placeholder="Nama kategori"
                  />
                  <div class="flex gap-2">
                    <button 
                      @click="saveEdit(category.id)" 
                      class="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none flex-1 touch-target"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Simpan
                    </button>
                    <button 
                      @click="cancelEdit" 
                      class="btn btn-sm btn-outline flex-1 touch-target"
                    >
                      Batal
                    </button>
                  </div>
                </div>
                
                <!-- View Mode -->
                <div v-else class="flex items-center justify-between">
                  <span class="font-medium text-gray-800">{{ category.name }}</span>
                  <div class="flex gap-1">
                    <button 
                      @click="startEdit(category)" 
                      class="btn btn-ghost btn-sm touch-target"
                    >
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button 
                      @click="productStore.deleteCategory(category.id)" 
                      class="btn btn-ghost btn-sm touch-target"
                    >
                      <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Empty State untuk Mobile -->
              <div v-if="!productStore.categories?.length" class="p-8 text-center">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <p class="text-gray-500">Belum ada kategori</p>
                <p class="text-sm text-gray-400 mt-1">Tambahkan kategori pertama Anda</p>
              </div>
            </div>
          </div>

          <!-- Desktop: Table Layout -->
          <div class="hidden md:block overflow-x-auto">
            <table class="table w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left font-medium text-gray-600">Nama Kategori</th>
                  <th class="text-center font-medium text-gray-600 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="category in productStore.categories" :key="category.id" 
                    class="hover:bg-gray-50"
                    :class="{'bg-yellow-50': editingCategoryId === category.id}">
                  <td class="py-3">
                    <input 
                      v-if="editingCategoryId === category.id" 
                      v-model="editingCategoryName"
                      @keyup.enter="saveEdit(category.id)"
                      @keyup.esc="cancelEdit"
                      class="input input-sm input-bordered w-full" 
                    />
                    <span v-else class="font-medium text-gray-800">{{ category.name }}</span>
                  </td>
                  <td class="py-3">
                    <div v-if="editingCategoryId === category.id" class="flex justify-center gap-2">
                      <button @click="saveEdit(category.id)" class="btn btn-xs bg-green-600 hover:bg-green-700 text-white border-none">Simpan</button>
                      <button @click="cancelEdit" class="btn btn-xs btn-outline">Batal</button>
                    </div>
                    <div v-else class="flex justify-center gap-1">
                      <button @click="startEdit(category)" class="btn btn-xs btn-ghost text-gray-500">Edit</button>
                      <button @click="productStore.deleteCategory(category.id)" class="btn btn-xs btn-ghost text-red-500">Hapus</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!productStore.categories?.length">
                  <td colspan="2" class="text-center py-8 text-gray-500">
                    Belum ada kategori
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="flex-shrink-0 bg-white border-t border-gray-100 px-4 md:px-6 py-4 pb-safe rounded-b-2xl md:rounded-b-lg">
        <button 
          class="btn btn-outline w-full touch-target" 
          @click="$emit('close')"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Tutup
        </button>
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

/* Enhanced mobile styling */
@media (max-width: 640px) {
  .input, .btn {
    font-size: 16px; /* Prevent zoom */
  }
  
  .input {
    padding: 12px 16px;
  }
  
  .btn {
    padding: 12px 20px;
    font-weight: 600;
  }
  
  .btn-sm {
    font-size: 14px;
    padding: 8px 16px;
  }
}

/* Improved styling */
.border-gray-100 {
  border-color: rgb(243 244 246);
}

.border-gray-200 {
  border-color: rgb(229 231 235);
}

.bg-gray-50 {
  background-color: rgb(249 250 251);
}

.hover\:bg-gray-50:hover {
  background-color: rgb(249 250 251);
}

.bg-teal-100 {
  background-color: rgb(204 251 241);
}

.text-teal-600 {
  color: rgb(13 148 136);
}

.bg-teal-600 {
  background-color: rgb(13 148 136);
}

.hover\:bg-teal-700:hover {
  background-color: rgb(15 118 110);
}

.bg-green-600 {
  background-color: rgb(22 163 74);
}

.hover\:bg-green-700:hover {
  background-color: rgb(21 128 61);
}

.bg-yellow-50 {
  background-color: rgb(254 252 232);
}

.text-red-500 {
  color: rgb(239 68 68);
}
</style>
