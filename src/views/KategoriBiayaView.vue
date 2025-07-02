<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/solid';

const userStore = useUserStore();

// --- State Halaman ---
const categories = ref([]);
const loading = ref(true);
const searchTerm = ref('');

// --- State untuk Modal & Form ---
const categoryModal = ref(null);
const isEditMode = ref(false);
const isProcessing = ref(false);
const currentCategory = ref({ id: null, name: '' });

// --- Fungsi Pengambilan Data ---
async function getCategories() {
  if (!userStore.organization?.id) return;
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('id, name, created_at')
      .eq('organization_id', userStore.organization.id)
      .order('name', { ascending: true });
    if (error) throw error;
    categories.value = data;
  } catch (error) {
    userStore.showNotification(`Error mengambil kategori: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
}

// --- Computed Property untuk Pencarian ---
const filteredCategories = computed(() => {
  if (!searchTerm.value) return categories.value;
  return categories.value.filter(c => c.name.toLowerCase().includes(searchTerm.value.toLowerCase()));
});

// --- Fungsi untuk Modal & Form ---
function resetCurrentCategory() {
  currentCategory.value = { id: null, name: '' };
}

function openNewCategoryModal() {
  isEditMode.value = false;
  resetCurrentCategory();
  categoryModal.value.showModal();
}

function openEditCategoryModal(category) {
  isEditMode.value = true;
  currentCategory.value = { ...category };
  categoryModal.value.showModal();
}

// --- Fungsi CRUD ---
async function handleFormSubmit() {
  if (isEditMode.value) {
    await updateCategory();
  } else {
    await addCategory();
  }
}

async function addCategory() {
  if (!currentCategory.value.name) {
    return userStore.showNotification('Nama kategori tidak boleh kosong.', 'warning');
  }
  isProcessing.value = true;
  try {
    const { error } = await supabase.from('expense_categories').insert({
      name: currentCategory.value.name,
      organization_id: userStore.organization.id,
      user_id: userStore.session.user.id,
    });
    if (error) throw error;

    userStore.showNotification(`Kategori '${currentCategory.value.name}' berhasil ditambahkan!`, 'success');
    categoryModal.value.close();
    await getCategories();
  } catch (error) {
    userStore.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
}

async function updateCategory() {
  isProcessing.value = true;
  try {
    const { error } = await supabase.from('expense_categories')
      .update({ name: currentCategory.value.name })
      .eq('id', currentCategory.value.id);
    if (error) throw error;
    
    userStore.showNotification('Kategori berhasil diperbarui!', 'success');
    categoryModal.value.close();
    await getCategories();
  } catch (error) {
    userStore.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
}

async function deleteCategory(categoryId, categoryName) {
  if (confirm(`Yakin ingin menghapus kategori '${categoryName}'? Ini mungkin mempengaruhi data transaksi lama.`)) {
    try {
      // Kita set foreign key menjadi NULL, bukan menghapus transaksi
      await supabase.from('transactions').update({ expense_category_id: null }).eq('expense_category_id', categoryId);
      // Baru hapus kategori
      const { error: deleteError } = await supabase.from('expense_categories').delete().eq('id', categoryId);
      if (deleteError) throw deleteError;
      
      userStore.showNotification('Kategori berhasil dihapus!', 'success');
      await getCategories();
    } catch (error) {
      userStore.showNotification(`Error menghapus kategori: ${error.message}`, 'error');
    }
  }
}

// --- Lifecycle Hooks ---
onMounted(() => { if (userStore.isReady) getCategories(); });
watch(() => userStore.isReady, (ready) => { if (ready && categories.value.length === 0) getCategories(); });
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">Manajemen Kategori Biaya</h1>
        <p class="text-base-content/70">Atur semua kategori untuk pencatatan biaya operasional.</p>
      </div>
      <button @click="openNewCategoryModal" class="btn btn-primary">
        <PlusIcon class="h-5 w-5"/> Tambah Kategori
      </button>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="form-control mb-4">
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Cari nama kategori..." 
            class="input input-bordered w-full" 
          />
        </div>

        <div v-if="loading" class="text-center p-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Nama Kategori</th>
                <th>Tanggal Dibuat</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in filteredCategories" :key="category.id" class="hover">
                <td class="font-medium">{{ category.name }}</td>
                <td>{{ new Date(category.created_at).toLocaleDateString('id-ID') }}</td>
                <td class="text-right">
                  <button @click="openEditCategoryModal(category)" class="btn btn-ghost btn-sm btn-circle" title="Edit">
                    <PencilSquareIcon class="h-5 w-5 text-info"/>
                  </button>
                  <button @click="deleteCategory(category.id, category.name)" class="btn btn-ghost btn-sm btn-circle" title="Hapus">
                    <TrashIcon class="h-5 w-5 text-error"/>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredCategories.length === 0">
                <td colspan="3" class="text-center">Tidak ada kategori ditemukan.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <dialog ref="categoryModal" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="resetCurrentCategory">✕</button>
      </form>
      <h3 class="font-bold text-lg">{{ isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru' }}</h3>
      
      <form @submit.prevent="handleFormSubmit" class="py-4 space-y-4">
        <div class="form-control">
          <label class="label"><span class="label-text">Nama Kategori</span></label>
          <input v-model="currentCategory.name" type="text" placeholder="Contoh: Transportasi" class="input input-bordered" required />
        </div>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="categoryModal.close(); resetCurrentCategory()">Batal</button>
          <button type="submit" class="btn btn-primary" :disabled="isProcessing">
            <span v-if="isProcessing" class="loading loading-spinner"></span>
            {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Kategori' }}
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>