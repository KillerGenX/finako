<template>
    <div class="flex items-center justify-center min-h-screen bg-base-200 px-4">
      <div class="card w-full max-w-md bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl justify-center">
            Selamat Datang di Finako!
          </h2>
          <p class="text-center text-base-content/70">
            Selesaikan pengaturan akun Anda untuk bergabung.
          </p>
  
          <!-- Tampilkan loading spinner sampai sesi terverifikasi -->
          <div v-if="!isReady" class="text-center py-8">
            <span class="loading loading-dots loading-lg"></span>
          </div>
  
          <!-- Tampilkan form jika sesi valid -->
          <form v-else @submit.prevent="handleSubmit" class="space-y-4 mt-4">
            <div>
              <label class="label"><span class="label-text">Email</span></label>
              <input type="email" :value="userEmail" class="input input-bordered w-full" disabled />
            </div>
            <div>
              <label class="label"><span class="label-text">Nama Lengkap</span></label>
              <input 
                v-model="form.fullName" 
                type="text" 
                placeholder="Masukkan nama lengkap Anda" 
                class="input input-bordered w-full" 
                required
              />
            </div>
            <div>
              <label class="label"><span class="label-text">Buat Password</span></label>
              <input 
                v-model="form.password" 
                type="password" 
                placeholder="Minimal 6 karakter" 
                class="input input-bordered w-full" 
                required
              />
            </div>
            <div>
              <label class="label"><span class="label-text">Konfirmasi Password</span></label>
              <input 
                v-model="form.passwordConfirm" 
                type="password" 
                placeholder="Ulangi password Anda" 
                class="input input-bordered w-full"
                required
              />
            </div>
  
            <div class="form-control mt-6">
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="loading loading-spinner"></span>
                Selesaikan & Masuk
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';
import { useUserStoreRefactored, useUIStore } from '@/stores/userStoreRefactored';

const router = useRouter();
const userStore = useUserStoreRefactored();
const uiStore = useUIStore();

const form = ref({
  fullName: '',
  password: '',
  passwordConfirm: '',
});

const isLoading = ref(false);
const isReady = ref(false);
const userEmail = ref('');

// =========================================================
// === LOGIKA BARU YANG LEBIH ROBUST DI onMounted ===
// =========================================================
onMounted(async () => {
  // Tunggu sesaat agar Supabase client selesai memproses hash dari URL
  await new Promise(resolve => setTimeout(resolve, 500)); 

  // Langsung coba ambil sesi. Jika undangan valid, akan ada sesi sementara.
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    // Jika tidak ada sesi sama sekali, berarti token tidak valid
    uiStore.showNotification('Tautan undangan tidak valid atau telah kedaluwarsa.', 'error');
    router.push('/login');
    return;
  }

  // Jika ada sesi, kita berhasil!
  userEmail.value = session.user.email;
  form.value.fullName = session.user.user_metadata?.full_name || '';
  isReady.value = true;
});


const handleSubmit = async () => {
    if (form.value.password.length < 6) {
        uiStore.showNotification('Password minimal harus 6 karakter.', 'error');
        return;
    }
    if (form.value.password !== form.value.passwordConfirm) {
        uiStore.showNotification('Konfirmasi password tidak cocok.', 'error');
        return;
    }

    isLoading.value = true;
    
    // 1. Update user dengan data baru
    const { error: updateError } = await supabase.auth.updateUser({
        password: form.value.password,
        data: { full_name: form.value.fullName }
    });

    if (updateError) {
        uiStore.showNotification(updateError.message, 'error');
        isLoading.value = false;
        return;
    }

    // 2. Langsung login dengan kredensial baru
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email: userEmail.value,
        password: form.value.password,
    });

    if (loginError) {
        uiStore.showNotification(loginError.message, 'error');
        isLoading.value = false;
        router.push('/login'); // Arahkan ke login jika gagal
        return;
    }

    // 3. Panggil fetchUserSession agar semua data (profil, bisnis, outlet) dimuat
    await userStore.fetchUserSession();

    uiStore.showNotification('Akun berhasil diaktifkan! Selamat datang.', 'success');
    router.push('/'); // Arahkan ke dasbor
    
    isLoading.value = false;
};
</script>