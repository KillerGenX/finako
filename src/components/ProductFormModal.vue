<template>
  <div v-if="props.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-0">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md md:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
      
      <!-- Mobile: Sticky Header -->
      <div class="flex-shrink-0 bg-white border-b border-gray-100 p-4 md:p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-gray-800">{{ isEditMode ? 'Edit' : 'Tambah' }} Produk</h2>
            <p class="text-sm text-gray-500 mt-1">Isi detail produk di bawah ini</p>
          </div>
          <button @click="close" class="btn btn-circle btn-ghost btn-sm touch-target">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Scrollable Content -->
      <div class="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
        
        <!-- SEKSI 1: INFORMASI DASAR -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Informasi Dasar
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nama Produk*</label>
              <input 
                type="text" 
                v-model="form.name" 
                placeholder="Contoh: Kopi Susu Gula Aren" 
                class="input input-bordered w-full touch-target no-zoom" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Kategori*</label>
              <select v-model="form.category_id" class="select select-bordered w-full touch-target">
                <option disabled selected value="">Pilih Kategori</option>
                <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
              <textarea 
                v-model="form.description" 
                class="textarea textarea-bordered w-full touch-target no-zoom" 
                placeholder="Deskripsi singkat mengenai produk..."
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- SEKSI 2: FOTO PRODUK -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Foto Produk
          </h3>
          
          <!-- Mobile-Optimized Photo Upload -->
          <div class="flex flex-col md:flex-row items-center gap-4">
            <div class="flex-shrink-0">
              <div class="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-200 shadow-md">
                <img 
                  :src="photoPreview || form.photo_url || '/finako.jpg'" 
                  alt="Product photo" 
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
            <div class="flex-grow w-full md:w-auto">
              <label class="btn btn-outline w-full touch-target cursor-pointer">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                Pilih Foto
                <input 
                  type="file" 
                  @change="handlePhotoChange" 
                  class="hidden" 
                  accept="image/*" 
                />
              </label>
              <button 
                v-if="photoPreview || form.photo_url" 
                @click="removePhoto" 
                class="btn btn-ghost btn-sm text-red-500 mt-2 w-full touch-target"
              >
                Hapus Foto
              </button>
            </div>
          </div>
        </div>

        <!-- SEKSI 3: OPSI LANJUTAN (PRO & ENTERPRISE) -->
        <div v-if="currentPlan !== 'basic'" class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            Fitur Premium
          </h3>
          
          <div class="space-y-4">
            <!-- Opsi Varian (Pro & Enterprise) -->
            <div v-if="currentPlan === 'pro' || currentPlan === 'enterprise'" class="bg-white rounded-lg p-4 border border-gray-200">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-purple-100 rounded-lg">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800">Produk Memiliki Varian</p>
                    <p class="text-sm text-gray-500">Contoh: Size S, M, L atau Rasa Original, Pedas</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  v-model="form.has_variants" 
                  class="toggle toggle-primary touch-target" 
                />
              </div>
              
              <!-- Variant Management Button -->
              <div v-if="form.has_variants" class="pt-3 border-t border-gray-200">
                <button 
                  @click="isVariantModalVisible = true" 
                  class="btn btn-outline btn-primary w-full touch-target"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                  </svg>
                  Kelola Varian ({{ form.product_variants?.length || 0 }} varian)
                </button>
              </div>
            </div>

            <!-- Opsi Resep Komposit (Enterprise Only) -->
            <div v-if="currentPlan === 'enterprise'" class="bg-white rounded-lg p-4 border border-gray-200">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800">Produk Komposit</p>
                    <p class="text-sm text-gray-500">Produk yang dibuat dari bahan-bahan lain</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  v-model="form.is_composite" 
                  class="toggle toggle-primary touch-target" 
                />
              </div>
              
              <!-- Recipe Management Button -->
              <div v-if="form.is_composite" class="pt-3 border-t border-gray-200">
                <button 
                  @click="isRecipeModalVisible = true" 
                  class="btn btn-outline btn-primary w-full touch-target"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Kelola Resep ({{ form.product_recipes?.length || 0 }} bahan)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sticky Footer dengan Action Buttons -->
      <div class="flex-shrink-0 bg-white border-t border-gray-100 p-4 md:p-6">
        <div class="flex flex-col md:flex-row gap-3">
          <button 
            @click="close" 
            class="btn btn-outline w-full md:w-auto touch-target order-2 md:order-1"
          >
            Batal
          </button>
          <button 
            @click="save" 
            class="btn btn-primary bg-teal-600 hover:bg-teal-700 border-none w-full md:w-auto touch-target order-1 md:order-2"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ isEditMode ? 'Update' : 'Simpan' }} Produk
          </button>
        </div>
      </div>
    </div>
  </div>

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

<style scoped>
/* Mobile-first responsive styles */
.touch-target {
  min-height: 44px; /* iOS touch target minimum */
  touch-action: manipulation;
}

.no-zoom {
  font-size: 16px; /* Prevent zoom on iOS */
}

/* Responsive modal sizing */
@media (max-width: 768px) {
  .modal-box {
    margin: 0;
    border-radius: 16px 16px 0 0;
    max-height: 95vh;
  }
}

/* Enhanced mobile form styling */
@media (max-width: 640px) {
  .input, .select, .textarea {
    font-size: 16px; /* Prevent zoom */
    padding: 12px 16px;
  }
  
  .btn {
    padding: 12px 20px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .toggle {
    transform: scale(1.2);
  }
  
  /* Better spacing for mobile */
  .grid-cols-1 {
    gap: 16px;
  }
  
  /* Photo upload area optimization */
  .border-dashed {
    border-width: 2px;
    padding: 24px;
  }
  
  /* Safe area handling */
  .modal-box {
    padding-bottom: env(safe-area-inset-bottom, 16px);
  }
}

/* Improved contrast and accessibility */
.bg-teal-600 {
  background-color: rgb(13 148 136);
}

.hover\:bg-teal-700:hover {
  background-color: rgb(15 118 110);
}

/* Custom section styling */
.bg-gray-50 {
  background-color: rgb(249 250 251);
}

.border-gray-100 {
  border-color: rgb(243 244 246);
}

.border-gray-200 {
  border-color: rgb(229 231 235);
}
</style>

<script setup>
import { ref, watch, computed } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored'; // 1. Impor user store
import VariantManagementModal from './VariantManagementModal.vue';
import RecipeManagementModal from './RecipeManagementModal.vue'; 

const props = defineProps({ show: Boolean, productToEdit: Object });
const emit = defineEmits(['close', 'save']);
const productStore = useProductStore();
const userStore = useUserStoreRefactored(); // 2. Inisialisasi user store

// 3. Buat computed property untuk mendapatkan nama plan
const currentPlan = computed(() => userStore.currentSubscription?.plans?.name?.toLowerCase() || 'basic');

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
    // Jika opsi tidak terlihat karena limitasi plan, pastikan datanya kosong saat disimpan
    if (currentPlan.value === 'basic') {
        form.value.has_variants = false;
        form.value.is_composite = false;
    }
    if (currentPlan.value === 'pro') {
        form.value.is_composite = false;
    }

    if (!form.value.has_variants) { form.value.product_variants = []; }
    if (!form.value.is_composite) {
        form.value.product_recipes = [];
    }
    emit('save', { formData: form.value, photoFile: photoFile.value });
    close();
}
</script>
