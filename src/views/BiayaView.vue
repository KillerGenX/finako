<script setup>
// --- Impor dari Library ---
import { ref, watch } from 'vue';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';

// --- Impor Ikon ---
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';

// --- State Utama ---
const userStore = useUserStore();
const loading = ref(false);
const message = ref('');
const expenses = ref([]);
const categories = ref([]);

// --- State untuk Form Tambah Data ---
const selectedCategoryId = ref(null);
const expenseAmount = ref(0);

// --- State untuk Modal Edit ---
const editModal = ref(null);
const editingExpense = ref(null);

// --- Fungsi-Fungsi untuk Mengambil Data ---

async function getCategories() {
  if (!userStore.organization?.id) return;
  try {
    const { data, error } = await supabase.from('expense_categories').select('id, name').eq('organization_id', userStore.organization.id).order('name');
    if (error) throw error;
    categories.value = data;
  } catch (error) {
    console.error("Error mengambil data kategori:", error.message);
  }
}

async function getOperationalExpenses() {
  if (!userStore.organization?.id) return;
  loading.value = true;
  try {
    const { data, error } = await supabase.from('transactions').select(`*, expense_categories (id, name)`).eq('category', 'Biaya Operasional').eq('organization_id', userStore.organization.id).order('created_at', { ascending: false });
    if (error) throw error;
    expenses.value = data;
  } catch (error) {
    message.value = `Error mengambil data: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// --- Fungsi untuk Aksi CRUD (Create, Read, Update, Delete) ---

async function addOperationalExpense() {
  // ... (Fungsi addOperationalExpense Anda tidak berubah, sudah bagus)
  if (!userStore.organization?.id) { message.value = "Data organisasi tidak ditemukan. Coba refresh halaman."; return; }
  if (!selectedCategoryId.value || expenseAmount.value <= 0) { message.value = 'Silakan pilih kategori dan isi jumlahnya.'; return; }
  loading.value = true; message.value = '';
  try {
    const selectedCategory = categories.value.find(c => c.id === selectedCategoryId.value);
    if (!selectedCategory) throw new Error("Kategori tidak valid.");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('transactions').insert([{
      description: selectedCategory.name, amount: expenseAmount.value, type: 'expense', category: 'Biaya Operasional', user_id: user.id, organization_id: userStore.organization.id, expense_category_id: selectedCategory.id
    }]);
    if (error) throw error;
    message.value = `Biaya '${selectedCategory.name}' berhasil ditambahkan!`;
    selectedCategoryId.value = null; expenseAmount.value = 0;
    await getOperationalExpenses();
  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
    setTimeout(() => message.value = '', 3000);
  }
}

// --- FUNGSI BARU: Hapus Biaya ---
async function deleteExpense(expenseId) {
  if (!confirm('Apakah Anda yakin ingin menghapus biaya ini?')) return;
  try {
    const { error } = await supabase.from('transactions').delete().eq('id', expenseId);
    if (error) throw error;
    message.value = 'Biaya berhasil dihapus!';
    await getOperationalExpenses();
  } catch (error) {
    message.value = `Error menghapus data: ${error.message}`;
  } finally {
    setTimeout(() => message.value = '', 3000);
  }
}

// --- FUNGSI BARU: Buka Modal Edit ---
function openEditModal(expense) {
  editingExpense.value = { ...expense, expense_category_id: expense.expense_categories?.id };
  editModal.value.showModal();
}

// --- FUNGSI BARU: Simpan Perubahan (Update) ---
async function updateExpense() {
  if (!editingExpense.value) return;
  loading.value = true;
  try {
    const selectedCategory = categories.value.find(c => c.id === editingExpense.value.expense_category_id);
    const { error } = await supabase
      .from('transactions')
      .update({
        amount: editingExpense.value.amount,
        expense_category_id: editingExpense.value.expense_category_id,
        description: selectedCategory ? selectedCategory.name : editingExpense.value.description, // Update deskripsi jika kategori berubah
      })
      .eq('id', editingExpense.value.id);

    if (error) throw error;
    message.value = 'Biaya berhasil diperbarui!';
    await getOperationalExpenses();
    editModal.value.close();
  } catch (error) {
    message.value = `Error memperbarui data: ${error.message}`;
  } finally {
    loading.value = false;
    setTimeout(() => message.value = '', 3000);
  }
}

// Watcher untuk mengambil data saat komponen pertama kali dimuat
watch(() => userStore.organization, (newOrgValue) => {
  if (newOrgValue) {
    getOperationalExpenses();
    getCategories();
  } else {
    expenses.value = [];
    categories.value = [];
  }
}, { immediate: true });
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-xl">
       <div class="card-body">
         <h2 class="card-title">Tambah Biaya Operasional</h2>
         <form @submit.prevent="addOperationalExpense" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Pilih Kategori Biaya</span></label>
            <select v-model="selectedCategoryId" class="select select-bordered" required>
              <option :value="null" disabled>-- Pilih Kategori --</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Total Jumlah Biaya (Rp)</span></label>
            <input type="number" v-model.number="expenseAmount" placeholder="350000" class="input input-bordered" required />
          </div>
          <div class="card-actions justify-end">
            <button type="submit" :disabled="loading || !selectedCategoryId" class="btn btn-primary">
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? 'Menyimpan...' : 'Simpan Biaya' }}
            </button>
          </div>
        </form>
       </div>
     </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Riwayat Biaya Operasional</h2>
        <div v-if="loading && expenses.length === 0" class="text-center p-4"><span class="loading loading-lg loading-spinner"></span></div>
        <div v-else-if="expenses.length === 0" class="text-center p-4 text-gray-500">Belum ada biaya operasional.</div>
        <div v-else class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
                <th v-if="userStore.userRole === 'owner'">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="expense in expenses" :key="expense.id" class="hover">
                <td>{{ expense.description }}</td>
                <td class="text-error font-semibold">- Rp {{ new Intl.NumberFormat('id-ID').format(expense.amount) }}</td>
                <td>{{ new Date(expense.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}</td>
                <td v-if="userStore.userRole === 'owner'">
                  <div class="flex items-center gap-2">
                    <button @click="openEditModal(expense)" class="btn btn-ghost btn-sm btn-circle" title="Edit">
                      <PencilSquareIcon class="h-5 w-5" />
                    </button>
                    <button @click="deleteExpense(expense.id)" class="btn btn-ghost btn-sm btn-circle text-error" title="Hapus">
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="message" class="toast toast-top toast-center">
      <div class="alert alert-info shadow-lg"><span>{{ message }}</span></div>
    </div>
    
    <dialog ref="editModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Edit Biaya Operasional</h3>
        <form @submit.prevent="updateExpense" class="space-y-4 py-4" v-if="editingExpense">
          <div class="form-control">
            <label class="label"><span class="label-text">Kategori Biaya</span></label>
            <select v-model="editingExpense.expense_category_id" class="select select-bordered" required>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Jumlah (Rp)</span></label>
            <input type="number" v-model.number="editingExpense.amount" class="input input-bordered" required />
          </div>
          <div class="modal-action">
            <button type="button" class="btn" @click="editModal.close()">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner"></span>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>