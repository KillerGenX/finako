<template>
    <div v-if="!dataReady" class="space-y-6">
      <!-- Tampilan Skeleton Loading -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <div class="skeleton h-8 w-1/3 mb-6"></div>
        <div class="space-y-4">
          <div class="skeleton h-5 w-1/4"></div>
          <div class="skeleton h-12 w-full"></div>
          <div class="skeleton h-5 w-1/4"></div>
          <div class="skeleton h-24 w-full"></div>
        </div>
      </div>
    </div>
  
    <!-- Form Utama -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-8">
      
      <!-- Panel Informasi Usaha -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">Informasi Usaha</h2>
        <p class="text-sm text-gray-500 mt-1 mb-6">Informasi ini akan ditampilkan pada struk dan laporan Anda.</p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nama Usaha</label>
            <input v-model="form.name" type="text" placeholder="Masukkan nama usaha Anda" class="mt-1 block w-full input input-bordered" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Alamat Usaha</label>
            <textarea v-model="form.address" class="mt-1 block w-full textarea textarea-bordered h-24" placeholder="Masukkan alamat lengkap usaha"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nomor Telepon Usaha</label>
            <input v-model="form.phone_number" type="tel" placeholder="Masukkan nomor telepon" class="mt-1 block w-full input input-bordered" />
          </div>
        </div>
      </div>
  
      <!-- Panel Pajak & Layanan -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">Pajak & Layanan</h2>
        <p class="text-sm text-gray-500 mt-1 mb-6">Atur tarif pajak dan biaya layanan yang berlaku di semua outlet Anda.</p>
          
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Tarif Pajak (%)</label>
              <input v-model.number="form.tax_percent" type="number" step="0.1" min="0" placeholder="Contoh: 11" class="mt-1 block w-full input input-bordered" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Biaya Layanan (%)</label>
              <input v-model.number="form.service_charge_percent" type="number" step="0.1" min="0" placeholder="Contoh: 5" class="mt-1 block w-full input input-bordered" />
            </div>
        </div>
      </div>
  
      <!-- Tombol Aksi Simpan -->
      <div class="mt-6 flex justify-end">
        <button type="submit" class="btn bg-teal-600 hover:bg-teal-700 text-white border-none" :disabled="isLoading">
          <span v-if="isLoading" class="loading loading-spinner"></span>
          {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </form>
</template>
  
<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, watch } from 'vue';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
  
const userStore = useUserStoreRefactored();
  
const form = ref({
    name: '',
    address: '',
    phone_number: '',
    tax_percent: 0,
    service_charge_percent: 0,
});
  
const isLoading = ref(false);
const dataReady = ref(false);
  
function syncFormWithStore() {
    if (userStore.business) {
      form.value.name = userStore.business.name || '';
      form.value.address = userStore.business.address || '';
      form.value.phone_number = userStore.business.phone_number || '';
      form.value.tax_percent = userStore.business.tax_percent || 0;
      form.value.service_charge_percent = userStore.business.service_charge_percent || 0;
      dataReady.value = true;
    }
}
  
watch(() => userStore.business, (newBusiness) => {
    if (newBusiness) {
      syncFormWithStore();
    }
}, { immediate: true });
  
async function handleSubmit() {
    isLoading.value = true;
    const payload = { ...form.value };
    await userStore.updateBusinessDetails(payload);
    isLoading.value = false;
}
</script>
