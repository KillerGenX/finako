<template>
  <div class="p-4 md:p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Pengaturan Usaha</h1>

      <!-- Tampilkan skeleton loading jika data belum siap -->
      <div v-if="!dataReady" class="space-y-6">
        <div class="skeleton h-64 w-full"></div>
        <div class="skeleton h-48 w-full"></div>
      </div>

      <!-- Tampilkan form jika data sudah siap -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-6">

        <!-- KARTU 1: INFORMASI USAHA -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title">Informasi Usaha</h2>
            <p class="text-xs text-base-content/70 -mt-2 mb-4">Informasi ini akan ditampilkan pada struk Anda.</p>
            
            <div class="form-control">
              <label class="label"><span class="label-text">Nama Usaha</span></label>
              <input v-model="form.name" type="text" placeholder="Masukkan nama usaha Anda" class="input input-bordered" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">Alamat Usaha</span></label>
              <textarea v-model="form.address" class="textarea textarea-bordered h-24" placeholder="Masukkan alamat lengkap usaha"></textarea>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">Nomor Telepon Usaha</span></label>
              <input v-model="form.phone_number" type="tel" placeholder="Masukkan nomor telepon" class="input input-bordered" />
            </div>
          </div>
        </div>

        <!-- KARTU 2: PENGATURAN KEUANGAN -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title">Pajak & Layanan</h2>
            <p class="text-xs text-base-content/70 -mt-2 mb-4">Atur tarif pajak dan biaya layanan yang berlaku di outlet Anda.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text">Tarif Pajak (%)</span></label>
                <input v-model.number="form.tax_percent" type="number" step="0.1" min="0" placeholder="Contoh: 11" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Biaya Layanan (%)</span></label>
                <input v-model.number="form.service_charge_percent" type="number" step="0.1" min="0" placeholder="Contoh: 5" class="input input-bordered" />
              </div>
            </div>
          </div>
        </div>

        <!-- Tombol Aksi Simpan -->
        <div class="mt-6 flex justify-end">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner"></span>
            {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';

const userStore = useUserStoreRefactored();

// State lokal untuk form, agar tidak langsung mengubah state global di store.
// Ini adalah praktik terbaik untuk manajemen form.
const form = ref({
  name: '',
  address: '',
  phone_number: '',
  tax_percent: 0,
  service_charge_percent: 0,
});

const isLoading = ref(false);
const dataReady = ref(false);

// Fungsi untuk menyinkronkan data dari store ke form lokal
function syncFormWithStore() {
  if (userStore.business) {
    form.value.name = userStore.business.name || '';
    form.value.address = userStore.business.address || '';
    form.value.phone_number = userStore.business.phone_number || '';
    form.value.tax_percent = userStore.business.tax_percent || 0;
    form.value.service_charge_percent = userStore.business.service_charge_percent || 0;
    // Tandai bahwa data sudah siap dan form bisa ditampilkan
    dataReady.value = true;
  }
}

// Gunakan `watch` untuk mengisi form saat data bisnis dari store sudah tersedia.
// `immediate: true` akan menjalankan watcher ini saat komponen pertama kali dimuat.
watch(
  () => userStore.business,
  (newBusiness) => {
    if (newBusiness) {
      syncFormWithStore();
    }
  },
  { immediate: true }
);

// Fungsi yang dipanggil saat tombol "Simpan Perubahan" diklik
async function handleSubmit() {
  isLoading.value = true;
  
  // Siapkan payload dengan tipe data yang benar
  const payload = {
    ...form.value,
    tax_percent: Number(form.value.tax_percent) || 0,
    service_charge_percent: Number(form.value.service_charge_percent) || 0,
  };
  
  // Panggil aksi dari store yang sudah kita buat
  await userStore.updateBusinessDetails(payload);
  
  isLoading.value = false;
}
</script>