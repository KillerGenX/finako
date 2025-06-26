<!-- GANTI SELURUH SCRIPT ANDA DENGAN INI -->
<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'

// State untuk halaman ini (tidak ada perubahan)
const loading = ref(false)
const message = ref('')
const users = ref([])
const newUser = ref({
  email: '',
  password: '',
  role: 'pegawai'
})

// --- Fungsi getUsers() yang Diperbarui dan Disederhanakan ---
async function getUsers() {
  loading.value = true;
  message.value = ''; // Hapus pesan lama setiap kali me-refresh data
  try {
    // Kita sekarang mengambil data langsung dari tabel 'profiles'
    // karena semua info yang kita butuhkan (id, email, role) sudah ada di sana.
    // Tidak perlu lagi join yang rumit dan bermasalah!
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role');
      
    if (error) throw error;
    
    users.value = data;

  } catch (error) {
    message.value = `Error mengambil daftar pengguna: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// Fungsi addUser() (tidak ada perubahan, sudah benar)
async function addUser() {
  if (!newUser.value.email || !newUser.value.password) {
    message.value = 'Email dan password harus diisi.';
    return;
  }
  loading.value = true;
  message.value = '';
  try {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { 
        email: newUser.value.email,
        password: newUser.value.password,
        role: newUser.value.role
      }
    });

    if (error) {
      // Jika error dari function adalah 'User already exists', kita tampilkan itu
      if (data && data.error) {
        throw new Error(data.error);
      }
      throw error;
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

// onMounted (tidak berubah)
onMounted(() => {
  getUsers();
});
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Manajemen Pengguna</h2>
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
        <h2 class="card-title">Daftar Pengguna Saat Ini</h2>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Email</th>
                <th>Peran (Role)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="2" class="text-center">Memuat data...</td></tr>
              <tr v-else-if="users.length === 0"><td colspan="2" class="text-center">Belum ada pengguna lain.</td></tr>
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