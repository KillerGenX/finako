<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";

// --- Variabel Reaktif ---

// Variabel untuk menampung inputan pengguna dari form login
const email = ref("");
const password = ref("");

// Variabel untuk mengontrol status aplikasi
const loading = ref(false);
const message = ref("");

// Inisialisasi router untuk mengarahkan pengguna setelah login
const router = useRouter();

// --- Fungsi Utama ---

// Fungsi yang akan dijalankan saat form login di-submit
async function handleLogin() {
  try {
    loading.value = true;
    message.value = "";

    // Kirim permintaan login ke Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;

    // Jika login berhasil, arahkan pengguna ke halaman utama (dasbor)
    router.push("/");
  } catch (error) {
    message.value = error.message;
  } finally {
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
      </div>
    </div>
  </div>
</template>
