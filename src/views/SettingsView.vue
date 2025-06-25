<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase";

// Variabel untuk status loading dan pesan feedback
const loading = ref(false);
const message = ref("");

// Variabel reaktif untuk menampung data dari form
const fixedCosts = ref(0);
const avgVariableCost = ref(0);
const avgSellingPrice = ref(0);

// Variabel untuk menyimpan ID profil yang sudah ada (jika ada)
const profileId = ref(null);

// Fungsi untuk menyimpan atau memperbarui data pengaturan
async function handleSaveSettings() {
  loading.value = true;
  message.value = "";
  try {
    // Ambil ID pengguna yang sedang login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Siapkan data yang akan dikirim ke Supabase
    const profileData = {
      // Kita TIDAK lagi memasukkan ID di sini secara langsung
      user_id: user.id,
      fixed_costs: fixedCosts.value,
      avg_variable_cost: avgVariableCost.value,
      avg_selling_price: avgSellingPrice.value,
    };

    // --- INI BAGIAN YANG DIPERBAIKI ---
    // Jika kita sedang mengedit profil yang sudah ada (profileId tidak null),
    // maka kita tambahkan properti 'id' ke objek data kita.
    if (profileId.value) {
      profileData.id = profileId.value;
    }
    // Jika tidak, kita biarkan kosong agar Supabase membuat ID baru (INSERT).

    // Gunakan .upsert()!
    const { error } = await supabase.from("business_profiles").upsert(profileData).select();

    if (error) throw error;

    message.value = "Pengaturan berhasil disimpan!";
  } catch (error) {
    message.value = `Error: ${error.message}`;
    // Tampilkan error di console untuk debugging lebih lanjut
    console.error(error);
  } finally {
    loading.value = false;
  }
}

// Fungsi yang berjalan saat halaman pertama kali dimuat (tidak ada perubahan)
onMounted(async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase.from("business_profiles").select("*").single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (data) {
      fixedCosts.value = data.fixed_costs;
      avgVariableCost.value = data.avg_variable_cost;
      avgSellingPrice.value = data.avg_selling_price;
      profileId.value = data.id;
    }
  } catch (error) {
    message.value = `Gagal memuat pengaturan: ${error.message}`;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-2xl">Pengaturan Usaha</h2>
      <p class="mb-4">Masukkan data dasar usaha Anda untuk kalkulasi BEP.</p>

      <form @submit.prevent="handleSaveSettings" class="space-y-4">
        <div class="form-control">
          <label class="label"><span class="label-text">Total Biaya Tetap per Bulan (Rp)</span></label>
          <input type="number" v-model.number="fixedCosts" placeholder="Contoh: 5000000" class="input input-bordered" required />
          <label class="label"><span class="label-text-alt">Contoh: Gaji, Sewa, Listrik, Internet.</span></label>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">Rata-rata Biaya Variabel per Produk (Rp)</span></label>
          <input type="number" v-model.number="avgVariableCost" placeholder="Contoh: 50000" class="input input-bordered" required />
          <label class="label"><span class="label-text-alt">Contoh: Harga Pokok / Modal untuk 1 unit produk.</span></label>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">Rata-rata Harga Jual per Produk (Rp)</span></label>
          <input type="number" v-model.number="avgSellingPrice" placeholder="Contoh: 80000" class="input input-bordered" required />
          <label class="label"><span class="label-text-alt">Harga jual ke pelanggan untuk 1 unit produk.</span></label>
        </div>

        <div class="card-actions justify-end mt-4">
          <button type="submit" :disabled="loading" class="btn btn-primary">
            <span v-if="loading" class="loading loading-spinner"></span>
            {{ loading ? "Menyimpan..." : "Simpan Pengaturan" }}
          </button>
        </div>
      </form>

      <div v-if="message" class="toast toast-top toast-center">
        <div class="alert alert-success">
          <span>{{ message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
