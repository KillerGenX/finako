<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/solid';

const userStore = useUserStore();

// --- State Halaman ---
const expenses = ref([]); // Daftar biaya operasional
const categories = ref([]); // Daftar kategori biaya
const loading = ref(true);
const searchTerm = ref('');

// --- State untuk Modal & Form ---
const expenseModal = ref(null);
const isEditMode = ref(false);
const isProcessing = ref(false); // Untuk loading di tombol simpan
const currentExpense = ref({ // Satu state untuk form tambah & edit
  id: null,
  amount: 0,
  expense_category_id: null,
  description: ''
});
const formattedAmount = ref('');

// --- Fungsi Pengambilan Data ---
async function fetchData() {
  if (!userStore.organization?.id) return;
  loading.value = true;
  try {
    // Ambil data biaya dan kategori secara bersamaan
    const [expensesRes, categoriesRes] = await Promise.all([
      supabase.from('transactions')
        .select('id, created_at, description, amount, expense_category_id')
        .eq('category', 'Biaya Operasional')
        .eq('organization_id', userStore.organization.id)
        .order('created_at', { ascending: false }),
      supabase.from('expense_categories')
        .select('id, name')
        .eq('organization_id', userStore.organization.id)
        .order('name')
    ]);

    if (expensesRes.error) throw expensesRes.error;
    if (categoriesRes.error) throw categoriesRes.error;

    expenses.value = expensesRes.data;
    categories.value = categoriesRes.data;

  } catch (error) {
    userStore.showNotification(`Error mengambil data: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
}

// Filter riwayat biaya berdasarkan pencarian
const filteredExpenses = computed(() => {
  if (!searchTerm.value) return expenses.value;
  return expenses.value.filter(e => e.description.toLowerCase().includes(searchTerm.value.toLowerCase()));
});

function handleAmountInput(event) {
  const rawValue = event.target.value.replace(/\D/g, '');
  const numberValue = Number(rawValue);

  currentExpense.value.amount = numberValue;

  if (rawValue) {
    formattedAmount.value = new Intl.NumberFormat('id-ID').format(numberValue);
  } else {
    formattedAmount.value = '';
  }
}

// --- Fungsi untuk Modal & Form ---
function resetCurrentExpense() {
  currentExpense.value = { id: null, amount: 0, expense_category_id: null, description: '' };
  formattedAmount.value = '';
}

function openNewExpenseModal() {
  isEditMode.value = false;
  resetCurrentExpense();
  expenseModal.value.showModal();
}

function openEditExpenseModal(expense) {
  isEditMode.value = true;
  // Salin data biaya yang akan diedit ke state form
  currentExpense.value = { 
    id: expense.id,
    amount: expense.amount,
    expense_category_id: expense.expense_category_id,
    description: expense.description
  };
  formattedAmount.value = new Intl.NumberFormat('id-ID').format(expense.amount);
  expenseModal.value.showModal();
}


// --- Fungsi CRUD (Create, Read, Update, Delete) ---
async function handleFormSubmit() {
  if (isEditMode.value) {
    await updateExpense();
  } else {
    await addExpense();
  }
}

async function addExpense() {
  if (!currentExpense.value.expense_category_id || !currentExpense.value.amount) {
    return userStore.showNotification('Kategori dan Jumlah Biaya wajib diisi.', 'warning');
  }
  isProcessing.value = true;
  try {
    const selectedCategory = categories.value.find(c => c.id === currentExpense.value.expense_category_id);
    const { error } = await supabase.from('transactions').insert({
      description: currentExpense.value.description || selectedCategory.name,
      amount: currentExpense.value.amount,
      type: 'expense',
      category: 'Biaya Operasional',
      user_id: userStore.session.user.id,
      organization_id: userStore.organization.id,
      expense_category_id: currentExpense.value.expense_category_id
    });
    if (error) throw error;

    userStore.showNotification('Biaya baru berhasil ditambahkan!', 'success');
    expenseModal.value.close();
    await fetchData();

  } catch (error) {
    userStore.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
}

async function updateExpense() {
  isProcessing.value = true;
  try {
    const selectedCategory = categories.value.find(c => c.id === currentExpense.value.expense_category_id);
    const { error } = await supabase.from('transactions')
      .update({
        amount: currentExpense.value.amount,
        expense_category_id: currentExpense.value.expense_category_id,
        description: currentExpense.value.description || selectedCategory.name,
      })
      .eq('id', currentExpense.value.id);
    if (error) throw error;
    
    userStore.showNotification('Biaya berhasil diperbarui!', 'success');
    expenseModal.value.close();
    await fetchData();

  } catch (error) {
    userStore.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
}

async function hapusBiaya(expenseId) {
  if (confirm('Yakin ingin menghapus catatan biaya ini?')) {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', expenseId);
      if (error) throw error;
      userStore.showNotification('Biaya berhasil dihapus!', 'success');
      await fetchData();
    } catch (error) {
      userStore.showNotification(`Error menghapus biaya: ${error.message}`, 'error');
    }
  }
}

// Helper function untuk format Rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
}

// Lifecycle Hooks
onMounted(() => { if (userStore.isReady) fetchData(); });
watch(() => userStore.isReady, (ready) => { if (ready && expenses.value.length === 0) fetchData(); });
</script>

<template>
  <div class="space-y-6">
    <!-- Header Halaman -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">Biaya Operasional</h1>
        <p class="text-base-content/70">Catat semua pengeluaran bisnis Anda di sini.</p>
      </div>
      <button @click="openNewExpenseModal" class="btn btn-primary">
        <PlusIcon class="h-5 w-5"/> Tambah Biaya Baru
      </button>
    </div>

    <!-- Card untuk Daftar Biaya -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="form-control mb-4">
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Cari berdasarkan deskripsi..." 
            class="input input-bordered w-full" 
          />
        </div>

        <!-- Tampilan Loading -->
        <div v-if="loading" class="text-center p-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- Tabel Riwayat Biaya -->
        <div v-else class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th class="text-right">Jumlah</th>
                <th v-if="userStore.userRole === 'owner'" class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="expense in filteredExpenses" :key="expense.id" class="hover">
                <td>{{ new Date(expense.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }}</td>
                <td>{{ expense.description }}</td>
                <td class="text-right font-semibold text-error">{{ formatRupiah(expense.amount) }}</td>
                <td v-if="userStore.userRole === 'owner'" class="text-right">
                  <button @click="openEditExpenseModal(expense)" class="btn btn-ghost btn-sm btn-circle">
                    <PencilSquareIcon class="h-5 w-5 text-info"/>
                  </button>
                  <button @click="hapusBiaya(expense.id)" class="btn btn-ghost btn-sm btn-circle">
                    <TrashIcon class="h-5 w-5 text-error"/>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredExpenses.length === 0">
                <td colspan="4" class="text-center">Tidak ada catatan biaya ditemukan.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal untuk Tambah / Edit Biaya -->
  <dialog ref="expenseModal" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="resetCurrentExpense">✕</button>
      </form>
      <h3 class="font-bold text-lg">{{ isEditMode ? 'Edit Biaya' : 'Tambah Biaya Baru' }}</h3>
      
      <form @submit.prevent="handleFormSubmit" class="py-4 space-y-4">
        <div class="form-control">
          <label class="label"><span class="label-text">Kategori Biaya</span></label>
          <div class="flex items-center gap-2">
            <select v-model="currentExpense.expense_category_id" class="select select-bordered w-full" required>
              <option :value="null" disabled>-- Pilih Kategori --</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <!-- Nanti di sini kita bisa tambahkan tombol untuk ke halaman manajemen kategori -->
          </div>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Jumlah Biaya (Rp)</span></label>
          <input 
  :value="formattedAmount"
  @input="handleAmountInput"
  type="text" 
  inputmode="numeric"
  placeholder="Contoh: 50.000" 
  class="input input-bordered w-full"
  required
/>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Deskripsi (Opsional)</span></label>
          <input v-model="currentExpense.description" type="text" placeholder="Contoh: Beli Galon Air" class="input input-bordered" />
          <label class="label">
            <span class="label-text-alt">Jika kosong, akan diisi nama kategori.</span>
          </label>
        </div>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="expenseModal.close(); resetCurrentExpense()">Batal</button>
          <button type="submit" class="btn btn-primary" :disabled="isProcessing">
            <span v-if="isProcessing" class="loading loading-spinner"></span>
            {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Biaya' }}
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>