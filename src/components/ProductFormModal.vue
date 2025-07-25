<template>
  <div v-if="props.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold text-gray-800 mb-1">{{ isEditMode ? 'Edit' : 'Tambah' }} Produk</h2>
          <p class="text-gray-500 mb-6">Isi detail produk di bawah ini.</p>
          
          <div class="space-y-6">
              <!-- SEKSI 1: INFORMASI DASAR -->
              <div>
                <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Informasi Dasar</h3>
                <div class="space-y-4">
                  <div>
                      <label class="block text-sm font-medium text-gray-700">Nama Produk*</label>
                      <input type="text" v-model="form.name" placeholder="Contoh: Kopi Susu Gula Aren" class="mt-1 block w-full input input-bordered" />
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-700">Kategori*</label>
                      <select v-model="form.category_id" class="mt-1 block w-full select select-bordered">
                          <option disabled selected value="">Pilih Kategori</option>
                          <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                      </select>
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-700">Deskripsi</label>
                      <textarea v-model="form.description" class="mt-1 block w-full textarea textarea-bordered" placeholder="Deskripsi singkat mengenai produk..."></textarea>
                  </div>
                </div>
              </div>

              <!-- SEKSI 2: FOTO PRODUK -->
              <div>
                <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Foto Produk</h3>
                <div class="mt-1 flex items-center gap-6">
                  <div class="shrink-0">
                      <img class="h-24 w-24 object-cover rounded-lg shadow-sm" :src="photoPreview || form.photo_url || '/finako.jpg'" alt="Current product photo" />
                  </div>
                  <label class="block">
                      <span class="sr-only">Pilih foto profil</span>
                      <input type="file" @change="handlePhotoChange" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" accept="image/*" />
                      <button v-if="photoPreview || form.photo_url" @click="removePhoto" class="btn btn-xs btn-ghost text-red-500 mt-2">Hapus Foto</button>
                  </label>
                </div>
              </div>

              <!-- SEKSI 3: OPSI LANJUTAN -->
              <div>
                <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Opsi Lanjutan</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span class="font-medium text-gray-700">Punya Varian?</span>
                        <p class="text-xs text-gray-500">Aktifkan jika produk punya beberapa jenis, misal: Panas/Dingin, Ukuran S/M/L.</p>
                      </div>
                      <input type="checkbox" v-model="form.has_variants" class="toggle toggle-primary" />
                  </div>
                  <div v-if="form.has_variants" class="pl-4">
                      <button class="btn btn-sm btn-outline border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white" @click="isVariantModalVisible = true">
                        Kelola Varian
                      </button>
                      <span class="ml-3 text-sm text-gray-500">({{ form.product_variants?.length || 0 }} varian dikonfigurasi)</span>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span class="font-medium text-gray-700">Produk Komposit?</span>
                        <p class="text-xs text-gray-500">Aktifkan jika produk ini terbuat dari bahan baku yang perlu dikurangi stoknya.</p>
                      </div>
                      <input type="checkbox" v-model="form.is_composite" class="toggle toggle-primary" />
                  </div>
                  <div v-if="form.is_composite" class="pl-4">
                      <button class="btn btn-sm btn-outline border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white" @click="isRecipeModalVisible = true">
                        Kelola Resep
                      </button>
                      <span class="ml-3 text-sm text-gray-500">({{ form.product_recipes?.length || 0 }} bahan baku di resep)</span>
                  </div>
                </div>
              </div>
          </div>

          <!-- Tombol Aksi Utama -->
          <div class="flex justify-end gap-3 mt-8 pt-4 border-t">
              <button class="btn btn-ghost" @click="close">Batal</button>
              <button class="btn btn-primary bg-teal-600 hover:bg-teal-700 border-none" @click="save">Simpan Perubahan</button>
          </div>
      </div>
  </div>

  <!-- Modal Anak (Varian & Resep) - Tidak ada perubahan di sini -->
  <VariantManagementModal
      :show="isVariantModalVisible"
      :variants="form.product_variants"
      @close="isVariantModalVisible = false"
      @update:variants="updateVariants"
  />
  <RecipeManagementModal
    :show="isRecipeModalVisible"
    :recipes="form.product_recipes"
    @close="isRecipeModalVisible = false"
    @update:recipes="updateRecipes"
/>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, watch, computed } from 'vue';
import { useProductStore } from '@/stores/productStore';
import VariantManagementModal from './VariantManagementModal.vue';
import RecipeManagementModal from './RecipeManagementModal.vue'; 

const props = defineProps({ show: Boolean, productToEdit: Object });
const emit = defineEmits(['close', 'save']);
const productStore = useProductStore();

const form = ref({});
const isEditMode = computed(() => !!props.productToEdit);
const isVariantModalVisible = ref(false);
const photoFile = ref(null);
const photoPreview = ref('');
const isRecipeModalVisible = ref(false);

function initializeForm() {
    const productData = props.productToEdit ? JSON.parse(JSON.stringify(props.productToEdit)) : null;
    form.value = {
        id: productData?.id || null,
        name: productData?.name || '',
        category_id: productData?.category_id || '',
        description: productData?.description || '',
        photo_url: productData?.photo_url || '',
        has_variants: productData?.has_variants || false,
        is_composite: productData?.is_composite || false,
        product_variants: productData?.product_variants || [],
        product_recipes: productData?.product_recipes || [],
    };
    photoFile.value = null;
    photoPreview.value = '';
}

watch(() => props.show, (newVal) => { if (newVal) initializeForm() });

function handlePhotoChange(event) {
    const file = event.target.files[0];
    if (file) {
        photoFile.value = file;
        photoPreview.value = URL.createObjectURL(file);
    }
}

function removePhoto() {
    photoFile.value = null;
    photoPreview.value = '';
    form.value.photo_url = '';
}

function updateVariants(newVariants) {
    form.value.product_variants = newVariants;
}

function updateRecipes(newRecipes) {
    form.value.product_recipes = newRecipes;
}

function close() { emit('close'); }

function save() {
    if (!form.value.name || !form.value.category_id) {
        alert('Nama Produk dan Kategori wajib diisi.');
        return;
    }
    if (!form.value.has_variants) { form.value.product_variants = []; }
    if (!form.value.is_composite) {
        form.value.product_recipes = [];
    }
    emit('save', { formData: form.value, photoFile: photoFile.value });
    close();
}
</script>
