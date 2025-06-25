<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase";
import { TrashIcon, PencilSquareIcon } from "@heroicons/vue/24/outline";

// --- State Management ---
const loading = ref(false);
const message = ref("");
const categories = ref([]); // Untuk menampung daftar kategori

// State untuk form tambah & edit
const newCategoryName = ref("");
const isEditModalOpen = ref(false);
const editingCategory = ref(null);

// --- Fungsi Logika (CRUD) ---

// READ: Mengambil semua kategori dari database
async function getCategories() {
  loading.value = true;
  try {
    const { data, error } = await supabase.from("expense_categories").select("*").order("name");
    if (error) throw error;
    if (data) categories.value = data;
  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// CREATE: Menambah kategori baru
async function addCategory() {
  if (!newCategoryName.value) {
    message.value = "Nama kategori tidak boleh kosong.";
    return;
  }
  loading.value = true;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("expense_categories").insert([
      {
        name: newCategoryName.value,
        user_id: user.id,
      },
    ]);
    if (error) throw error;
    message.value = `Kategori '${newCategoryName.value}' berhasil ditambahkan.`;
    newCategoryName.value = "";
    await getCategories();
  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// UPDATE: Membuka modal dan menyiapkan data untuk diedit
function openEditModal(category) {
  editingCategory.value = { ...category };
  isEditModalOpen.value = true;
}

// UPDATE: Menyimpan perubahan
async function handleUpdateCategory() {
  if (!editingCategory.value.name) return;
  loading.value = true;
  try {
    const { id, name } = editingCategory.value;
    const { error } = await supabase.from("expense_categories").update({ name }).eq("id", id);
    if (error) throw error;
    message.value = "Kategori berhasil diperbarui.";
    isEditModalOpen.value = false;
    await getCategories();
  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// DELETE: Menghapus kategori
async function deleteCategory(categoryId, categoryName) {
  if (confirm(`Apakah Anda yakin ingin menghapus kategori '${categoryName}'?`)) {
    loading.value = true;
    try {
      const { error } = await supabase.from("expense_categories").delete().eq("id", categoryId);
      if (error) throw error;
      message.value = "Kategori berhasil dihapus.";
      await getCategories();
    } catch (error) {
      message.value = `Error: ${error.message}`;
    } finally {
      loading.value = false;
    }
  }
}

// Dijalankan saat halaman pertama kali dibuka
onMounted(() => {
  getCategories();
});
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Tambah Kategori Biaya Baru</h2>
        <form @submit.prevent="addCategory" class="flex items-end gap-4">
          <div class="form-control w-full">
            <label class="label"><span class="label-text">Nama Kategori</span></label>
            <input type="text" v-model="newCategoryName" placeholder="Contoh: Gaji Karyawan" class="input input-bordered" required />
          </div>
          <div class="card-actions">
            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? "..." : "Tambah" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Daftar Kategori Biaya Operasional</h2>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Nama Kategori</th>
                <th class="w-1/4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading && categories.length === 0">
                <td colspan="2" class="text-center">Memuat data...</td>
              </tr>
              <tr v-else-if="categories.length === 0">
                <td colspan="2" class="text-center">Belum ada kategori.</td>
              </tr>
              <tr v-for="category in categories" :key="category.id" class="hover">
                <td class="font-medium">{{ category.name }}</td>
                <td class="flex items-center gap-2">
                  <button @click="openEditModal(category)" class="btn btn-ghost btn-sm btn-circle" title="Edit">
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                  <button @click="deleteCategory(category.id, category.name)" class="btn btn-ghost btn-sm btn-circle text-error" title="Hapus">
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <dialog class="modal" :class="{ 'modal-open': isEditModalOpen }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Edit Nama Kategori</h3>
        <form v-if="editingCategory" @submit.prevent="handleUpdateCategory" class="space-y-4 mt-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Nama Kategori</span></label>
            <input type="text" v-model="editingCategory.name" class="input input-bordered" required />
          </div>
          <div class="modal-action">
            <button type="button" class="btn" @click="isEditModalOpen = false">Batal</button>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? "..." : "Simpan" }}
            </button>
          </div>
        </form>
      </div>
    </dialog>

    <div v-if="message" class="toast toast-top toast-center">
      <div class="alert alert-info">
        <span>{{ message }}</span>
      </div>
    </div>
  </div>
</template>
