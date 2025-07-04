<template>
  <div class="max-w-md mx-auto py-10">
    <h1 class="text-2xl font-bold mb-6">Daftar Tenant Baru</h1>
    <form @submit.prevent="handleRegister" class="space-y-4">
      <div class="form-control">
        <label class="label">Email</label>
        <input v-model="email" type="email" class="input input-bordered" required />
      </div>
      <div class="form-control">
        <label class="label">Password</label>
        <input v-model="password" type="password" class="input input-bordered" required minlength="6" />
      </div>
      <div class="form-control">
        <label class="label">Nama Usaha</label>
        <input v-model="businessName" type="text" class="input input-bordered" required />
      </div>
      <div class="form-control">
        <label class="label">Nama Owner</label>
        <input v-model="ownerName" type="text" class="input input-bordered" required />
      </div>
      <div class="form-control">
        <label class="label">Pilih Paket</label>
        <select v-model="selectedPackage" class="select select-bordered" required>
          <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">{{ pkg.name }}</option>
        </select>
      </div>
      <button class="btn btn-primary w-full" :disabled="isProcessing">
        <span v-if="isProcessing" class="loading loading-spinner"></span>
        Daftar
      </button>
      <div v-if="errorMsg" class="text-error mt-2">{{ errorMsg }}</div>
      <div v-if="successMsg" class="text-success mt-2">{{ successMsg }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const businessName = ref('');
const ownerName = ref('');
const selectedPackage = ref('');
const isProcessing = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const packages = ref([]);
const router = useRouter();

onMounted(async () => {
  // Fetch daftar paket dari tabel packages
  const { data, error } = await supabase.from('packages').select('id, name');
  if (!error && data) packages.value = data;
});

async function handleRegister() {
  errorMsg.value = '';
  successMsg.value = '';
  isProcessing.value = true;
  try {
    // Gunakan environment variable untuk API base URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const apiUrl = `${apiBaseUrl}/api/register`;
    
    // Panggil endpoint backend /api/register
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        businessName: businessName.value,
        packageId: selectedPackage.value,
        ownerName: ownerName.value // dikirim, walau backend tidak pakai
      })
    });
    let result = null;
    try {
      result = await response.json();
    } catch (jsonErr) {
      // Jika response bukan JSON valid
      throw new Error('Terjadi kesalahan pada server. Silakan coba lagi.');
    }
    if (!response.ok) {
      throw new Error(result?.error || result?.message || 'Registrasi gagal.');
    }
    successMsg.value = result.message || 'Registrasi tenant berhasil!';
    // Redirect ke halaman pembayaran/info jika perlu
    setTimeout(() => router.push('/payment-info'), 2000);
  } catch (err) {
    errorMsg.value = err.message || 'Registrasi gagal.';
  } finally {
    isProcessing.value = false;
  }
}
</script>
