<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase";

// State untuk halaman ini
const loading = ref(false);
const message = ref("");
const expenses = ref([]); // Untuk riwayat biaya

// --- BAGIAN BARU UNTUK KATEGORI ---
const categories = ref([]); // Untuk menampung daftar kategori dari database
const selectedCategoryId = ref(null); // Untuk menampung ID kategori yang dipilih dari dropdown

// State untuk form input biaya
// Kita tidak butuh lagi 'expenseDescription', karena akan diambil dari nama kategori
const expenseAmount = ref(0);

// --- Fungsi Logika ---

// Fungsi untuk mengambil daftar KATEGORI biaya
async function getCategories() {
  try {
    const { data, error } = await supabase.from("expense_categories").select("id, name").order("name");
    if (error) throw error;
    if (data) categories.value = data;
  } catch (error) {
    console.error("Error mengambil data kategori:", error.message);
  }
}

// Fungsi untuk mengambil RIWAYAT biaya operasional (tidak berubah)
async function getOperationalExpenses() {
  loading.value = true;
  try {
    const { data, error } = await supabase.from("transactions").select("*").eq("category", "Biaya Operasional").order("created_at", { ascending: false });
    if (error) throw error;
    if (data) expenses.value = data;
  } catch (error) {
    message.value = `Error mengambil data: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// Fungsi untuk MENAMBAH biaya operasional baru (diperbarui)
async function addOperationalExpense() {
  // Validasi sekarang berdasarkan kategori yang dipilih
  if (!selectedCategoryId.value || expenseAmount.value <= 0) {
    message.value = "Silakan pilih kategori dan isi jumlahnya.";
    return;
  }
  loading.value = true;
  message.value = "";
  try {
    // Cari nama kategori berdasarkan ID yang dipilih
    const selectedCategory = categories.value.find((c) => c.id === selectedCategoryId.value);
    if (!selectedCategory) throw new Error("Kategori tidak valid.");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("transactions").insert([
      {
        // Deskripsi sekarang diambil dari nama kategori yang dipilih
        description: selectedCategory.name,
        amount: expenseAmount.value,
        type: "expense",
        category: "Biaya Operasional",
        user_id: user.id,
      },
    ]);
    if (error) throw error;
    message.value = `Biaya '${selectedCategory.name}' berhasil ditambahkan!`;
    // Reset form
    selectedCategoryId.value = null;
    expenseAmount.value = 0;
    await getOperationalExpenses(); // Update tabel
  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// Saat halaman dimuat, ambil riwayat biaya DAN daftar kategori
onMounted(() => {
  getOperationalExpenses();
  getCategories();
});
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
              {{ loading ? "Menyimpan..." : "Simpan Biaya" }}
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
              </tr>
            </thead>
            <tbody>
              <tr v-for="expense in expenses" :key="expense.id" class="hover">
                <td>{{ expense.description }}</td>
                <td class="text-error font-semibold">- Rp {{ new Intl.NumberFormat("id-ID").format(expense.amount) }}</td>
                <td>{{ new Date(expense.created_at).toLocaleDateString("id-ID") }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="message" class="toast toast-top toast-center">
      <div class="alert alert-info">
        <span>{{ message }}</span>
      </div>
    </div>
  </div>
</template>
