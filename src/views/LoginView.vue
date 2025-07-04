// File: src/views/LoginView.vue (VERSI PERBAIKAN)

<script setup>
// --- Impor dari Library ---
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";

// --- Impor Store ---
// PENTING: Kita perlu mengimpor userStore untuk mengakses action-nya.
import { useUserStore } from "@/stores/userStore";

// --- Variabel Reaktif ---
const email = ref("");
const password = ref("");
const loading = ref(false);
const message = ref("");

// --- Inisialisasi ---
const router = useRouter();
// PENTING: Inisialisasi store agar bisa kita panggil fungsinya.
const userStore = useUserStore();

// --- Fungsi Utama ---
async function handleLogin() {
  try {
    // Set status loading menjadi true untuk menampilkan spinner di tombol
    loading.value = true;
    message.value = ""; // Bersihkan pesan error sebelumnya

    // Kirim permintaan login ke Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    // Jika Supabase mengembalikan error (misal: password salah), hentikan proses
    if (error) throw error;

    // --- PERBAIKAN UTAMA ADA DI SINI ---
    // Setelah login di Supabase berhasil, panggil action dari store.
    // 'await' memastikan kita menunggu sampai semua data (profil, role, organisasi)
    // selesai diambil dan disimpan di store.
    await userStore.fetchUserProfile();

    // Jika status organisasi belum active, redirect ke payment-info
    if (userStore.organization && userStore.organization.status && userStore.organization.status !== 'active') {
      router.push('/payment-info');
      return;
    }

    // Jika organisasi active tapi belum ada business profile, redirect ke onboarding
    if (userStore.organization && userStore.organization.status === 'active' && !userStore.businessProfile) {
      router.push('/onboarding');
      return;
    }

    // Setelah semua data siap di store, baru arahkan pengguna sesuai role
    if (userStore.userRole === 'pegawai') {
      router.push("/transaksi");
    } else {
      router.push("/");
    }

  } catch (error) {
    // Jika terjadi error, tampilkan pesannya ke pengguna
    message.value = error.message;
  } finally {
    // Apapun hasilnya (berhasil atau gagal), hentikan status loading
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="card w-full max-w-sm shadow-2xl bg-base-100 mx-auto">
      <div class="card-body">
        <div>
          <h1 class="card-title mb-2 text-2xl justify-center">Finako</h1>
          <p class="text-center mb-4">Silakan login ke akun Anda</p>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="form-control">
              <label class="label"><span class="label-text">Email</span></label>
              <input type="email" v-model="email" class="input input-bordered" required />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">Password</span></label>
              <input type="password" v-model="password" class="input input-bordered" required />
            </div>
            <div class="form-control mt-6">
              <button type="submit" :disabled="loading" class="btn btn-primary w-full">
                <span v-if="loading" class="loading loading-spinner"></span>
                {{ loading ? "Masuk..." : "Login" }}
              </button>
            </div>
          </form>
        </div>

        <p v-if="message" class="text-center text-error mt-4">{{ message }}</p>
        <div class="text-center mt-4">
          <span>Belum punya akun? </span>
          <router-link to="/register" class="btn btn-link text-primary">Daftar Tenant Baru</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
