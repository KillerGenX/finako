<template>
  <div v-if="props.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-6">{{ isEditMode ? 'Edit' : 'Tambah' }} Produk</h2>
          
          <!-- Form Lengkap -->
          <div class="space-y-4">
              <!-- NAMA PRODUK -->
              <div>
                  <label class="label"><span class="label-text">Nama Produk*</span></label>
                  <input type="text" v-model="form.name" placeholder="Contoh: Kopi Susu" class="input input-bordered w-full" />
              </div>

              <!-- FOTO PRODUK -->
              <div>
                  <label class="label"><span class="label-text">Foto Produk</span></label>
                  <input type="file" @change="handlePhotoChange" class="file-input file-input-bordered file-input-sm w-full" accept="image/*" />
                  <div v-if="photoPreview || form.photo_url" class="mt-2 flex items-center gap-4">
                      <img :src="photoPreview || form.photo_url" class="w-24 h-24 object-cover rounded border" alt="preview" />
                      <button v-if="photoPreview || form.photo_url" @click="removePhoto" class="btn btn-sm btn-ghost text-error">Hapus Foto</button>
                  </div>
              </div>

              <!-- KATEGORI PRODUK -->
              <div>
                  <label class="label"><span class="label-text">Kategori*</span></label>
                  <div class="flex items-center gap-2">
                    <!-- Dropdown kategori ini tidak berubah -->
                    <select v-model="form.category_id" class="select select-bordered w-full">
                        <option disabled selected value="">Pilih Kategori</option>
                        <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>
                  </div>
                  <!-- Tombol dan form untuk tambah/hapus kategori DIHILANGKAN dari sini -->
              </div>

              <!-- DESKRIPSI -->
              <div>
                  <label class="label"><span class="label-text">Deskripsi</span></label>
                  <textarea v-model="form.description" class="textarea textarea-bordered w-full" placeholder="Deskripsi singkat produk..."></textarea>
              </div>

              <!-- OPTIONS (VARIAN & KOMPOSIT) -->
              <div class="flex gap-8">
                  <div class="form-control">
                      <label class="label cursor-pointer gap-2">
                          <span class="label-text">Punya Varian?</span> 
                          <input type="checkbox" v-model="form.has_variants" class="toggle toggle-primary" />
                      </label>
                  </div>
                  <div class="form-control">
                      <label class="label cursor-pointer gap-2">
                          <span class="label-text">Produk Komposit?</span> 
                          <input type="checkbox" v-model="form.is_composite" class="toggle toggle-primary" />
                      </label>
                  </div>
              </div>

               <!-- Tombol Kelola Varian -->
              <div v-if="form.has_variants" class="pl-2">
                  <button class="btn btn-sm btn-outline" @click="isVariantModalVisible = true">Kelola Varian</button>
                  <span class="ml-2 text-sm text-gray-500">({{ form.product_variants?.length || 0 }} varian)</span>
              </div>
              <!-- TOMBOL BARU: Kelola Resep -->
<div v-if="form.is_composite" class="pl-2">
    <button class="btn btn-sm btn-outline" @click="isRecipeModalVisible = true">Kelola Resep</button>
    <span class="ml-2 text-sm text-gray-500">({{ form.product_recipes?.length || 0 }} bahan)</span>
</div>
          </div>

          <!-- Tombol Aksi Utama -->
          <div class="flex justify-end gap-3 mt-8">
              <button class="btn" @click="close">Batal</button>
              <button class="btn btn-primary" @click="save">Simpan</button>
          </div>
      </div>
  </div>

  <!-- Modal Anak (Varian) -->
  <VariantManagementModal
      :show="isVariantModalVisible"
      :variants="form.product_variants"
      @close="isVariantModalVisible = false"
      @update:variants="updateVariants"
  />
  <!-- MODAL BARU: Modal Anak (Resep) -->
<RecipeManagementModal
    :show="isRecipeModalVisible"
    :recipes="form.product_recipes"
    @close="isRecipeModalVisible = false"
    @update:recipes="updateRecipes"
/>
</template>

<script setup>
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

// FUNGSI UNTUK MANAJEMEN KATEGORI DIHAPUS DARI SINI
// no more handleAddNewCategory() or handleDeleteCategory()

// Handler untuk manajemen Foto
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

// Handler untuk manajemen Varian
function updateVariants(newVariants) {
    form.value.product_variants = newVariants;
}

function updateRecipes(newRecipes) {
    form.value.product_recipes = newRecipes;
}

// Aksi Utama
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