<script setup>
import { ref, watch } from 'vue'
import { supabase } from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const loading = ref(false)
const message = ref('')
const users = ref([])
const newUser = ref({ email: '', password: '', role: 'pegawai' })

// GANTI FUNGSI getUsers LAMA ANDA DENGAN VERSI BARU INI

async function getUsers() {
  // Pagar pengaman, pastikan kita tahu organisasi mana yang akan dicari
  if (!userStore.organization?.id) return;

  loading.value = true;
  message.value = '';
  try {
    // Query yang benar: ambil semua anggota dari organisasi saat ini
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        profiles ( id, email, full_name )
      `)
      .eq('organization_id', userStore.organization.id);

    if (error) throw error;
    
    // Format ulang data agar mudah ditampilkan di tabel
    if (data) {
      users.value = data.map(member => ({
        id: member.profiles.id,
        email: member.profiles.email,
        role: member.role
      }));
    }

  } catch (error) {
    message.value = `Error mengambil daftar pengguna: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// Ganti fungsi addUser lama Anda dengan ini
async function addUser() {
  // Pagar pengaman
  if (!userStore.organization?.id) {
    message.value = "Data organisasi Anda tidak ditemukan. Coba refresh.";
    return;
  }
  if (!newUser.value.email || !newUser.value.password) {
    message.value = 'Email dan password harus diisi.';
    return;
  }

  loading.value = true;
  message.value = '';
  try {
    // Panggil Edge Function dengan payload yang baru
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { 
        email: newUser.value.email,
        password: newUser.value.password,
        role: newUser.value.role,
        organization_id: userStore.organization.id // <-- Mengirim ID organisasi Anda
      }
    });

    if (error || (data && data.error)) {
      throw new Error(data?.error || error.message);
    }

    message.value = data.message || 'Pengguna berhasil ditambahkan!';
    newUser.value.email = '';
    newUser.value.password = '';
    await getUsers();

  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// "Pengawas Cerdas" yang memastikan data organisasi siap sebelum mengambil daftar user
watch(() => userStore.organization, (newOrg) => {
  if (newOrg) {
    getUsers();
  } else {
    users.value = [];
  }
}, { immediate: true });
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Tambah Pengguna Baru</h2>
        <p>Buat akun baru untuk pegawai Anda. Mereka bisa login dengan email dan password ini.</p>
        <form @submit.prevent="addUser" class="space-y-4 mt-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Email Pengguna Baru</span></label>
            <input type="email" v-model="newUser.email" placeholder="email@pegawai.com" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Password Awal</span></label>
            <input type="password" v-model="newUser.password" placeholder="Minimal 6 karakter" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Peran (Role)</span></label>
            <select v-model="newUser.role" class="select select-bordered">
              <option value="pegawai">Pegawai</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div class="card-actions justify-end">
            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? 'Menambahkan...' : 'Tambah Pengguna' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Daftar Pengguna di Organisasi Anda</h2>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead><tr><th>Email</th><th>Peran (Role)</th></tr></thead>
            <tbody>
              <tr v-if="loading"><td colspan="2" class="text-center">Memuat...</td></tr>
              <tr v-else-if="users.length === 0"><td colspan="2" class="text-center">Belum ada pengguna.</td></tr>
              <tr v-for="user in users" :key="user.id" class="hover">
                <td>{{ user.email }}</td>
                <td><div class="badge" :class="user.role === 'owner' ? 'badge-primary' : 'badge-ghost'">{{ user.role }}</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div v-if="message" class="toast toast-top toast-center">
      <div class="alert alert-info"><span>{{ message }}</span></div>
    </div>
  </div>
</template>