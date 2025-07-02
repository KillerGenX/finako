<script setup>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';
import { BuildingStorefrontIcon, CurrencyDollarIcon, PrinterIcon, SparklesIcon } from '@heroicons/vue/24/outline';

const userStore = useUserStore();
const loading = ref(true);
const isProcessing = ref(false);
const activeTab = ref('profil');

// Satu 'wadah' lokal untuk semua data form
const form = ref({
  name: '', address: '', phone: '', email: '',
  bank_name: '', bank_account_number: '', bank_account_holder: '', receipt_footer_text: '',
  fixed_costs: 0, avg_variable_cost: 0, avg_selling_price: 0,
  tax_enabled: false, service_charge_enabled: false
});

const orgFeatures = ref([]);

// Fungsi UTAMA untuk mengambil semua data pengaturan
async function getSettings() {
  if (!userStore.organization?.id) return;
  loading.value = true;
  try {
    const orgId = userStore.organization.id;
    
    // Kita ambil semua data yang dibutuhkan secara bersamaan
    const [orgRes, bizRes, featureRes] = await Promise.all([
      supabase.from('organizations').select('*').eq('id', orgId).single(),
      supabase.from('business_profiles').select('*').eq('organization_id', orgId).single(),
      // Query ini akan mengambil data dari organization_features dan menggabungkannya dengan detail dari features
      supabase.from('organization_features').select('is_enabled, features (id, name, description)').eq('organization_id', orgId)
    ]);

    // Error handling
    if (orgRes.error && orgRes.error.code !== 'PGRST116') throw orgRes.error;
    if (bizRes.error && bizRes.error.code !== 'PGRST116') throw bizRes.error;
    if (featureRes.error) throw featureRes.error;

    // Isi form dengan data yang berhasil diambil
    if (orgRes.data) Object.assign(form.value, orgRes.data);
    if (bizRes.data) Object.assign(form.value, bizRes.data);
    if (featureRes.data) orgFeatures.value = featureRes.data;

  } catch (error) {
    userStore.showNotification(`Gagal memuat pengaturan: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
}

// Fungsi untuk menyimpan perubahan (tidak berubah)
async function handleSaveChanges() {
  if (!userStore.organization?.id) {
    return userStore.showNotification('Data organisasi tidak siap.', 'error');
  }
  isProcessing.value = true;
  try {
    const orgId = userStore.organization.id;
    
    const orgData = {
      name: form.value.name, address: form.value.address, phone: form.value.phone, email: form.value.email,
      bank_name: form.value.bank_name, bank_account_number: form.value.bank_account_number,
      bank_account_holder: form.value.bank_account_holder, receipt_footer_text: form.value.receipt_footer_text,
    };
    const bizData = {
      organization_id: orgId,
      fixed_costs: form.value.fixed_costs, avg_variable_cost: form.value.avg_variable_cost,
      avg_selling_price: form.value.avg_selling_price, tax_enabled: form.value.tax_enabled,
      service_charge_enabled: form.value.service_charge_enabled,
    };
    
    const [orgUpdate, bizUpsert] = await Promise.all([
      supabase.from('organizations').update(orgData).eq('id', orgId),
      supabase.from('business_profiles').upsert(bizData, { onConflict: 'organization_id' })
    ]);

    if (orgUpdate.error) throw orgUpdate.error;
    if (bizUpsert.error) throw bizUpsert.error;

    userStore.showNotification('Pengaturan berhasil disimpan!', 'success');
    await userStore.fetchUserProfile();
    // Kita panggil ulang getSettings untuk refresh data di halaman ini
    await getSettings();

  } catch(error) {
    userStore.showNotification(`Error menyimpan: ${error.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
}

// Panggil getSettings saat komponen siap
watch(() => userStore.isReady, (ready) => {
  if (ready) {
    getSettings();
  }
}, { immediate: true });

</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <h1 class="text-3xl font-bold">Pengaturan Usaha</h1>
      <button @click="handleSaveChanges" class="btn btn-primary" :disabled="isProcessing || !userStore.isReady">
        <span v-if="isProcessing" class="loading loading-spinner"></span>
        Simpan Semua Perubahan
      </button>
    </div>

    <div v-if="!userStore.isReady" class="text-center p-10"><span class="loading loading-spinner loading-lg"></span></div>

    <div v-else>
      <div class="tabs tabs-boxed">
        <a class="tab" :class="{'tab-active': activeTab === 'profil'}" @click="activeTab = 'profil'"><BuildingStorefrontIcon class="h-5 w-5 mr-2"/>Profil Usaha</a>
        <a class="tab" :class="{'tab-active': activeTab === 'keuangan'}" @click="activeTab = 'keuangan'"><CurrencyDollarIcon class="h-5 w-5 mr-2"/>Keuangan & BEP</a>
        <a class="tab" :class="{'tab-active': activeTab === 'struk'}" @click="activeTab = 'struk'"><PrinterIcon class="h-5 w-5 mr-2"/>Struk</a>
        <a class="tab" :class="{'tab-active': activeTab === 'fitur'}" @click="activeTab = 'fitur'"><SparklesIcon class="h-5 w-5 mr-2"/>Fitur & Langganan</a>
      </div>

      <div class="card bg-base-100 shadow-xl mt-4">
        <div class="card-body">
          
          <div v-if="activeTab === 'profil'" class="space-y-4 animate-fade-in">
            <h2 class="card-title">Informasi Dasar Bisnis</h2>
            <div class="form-control"><label class="label"><span class="label-text">Nama Usaha</span></label><input type="text" v-model="form.name" class="input input-bordered" /></div>
            <div class="form-control"><label class="label"><span class="label-text">Alamat Usaha</span></label><textarea v-model="form.address" class="textarea textarea-bordered h-24"></textarea></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control"><label class="label"><span class="label-text">Nomor Telepon</span></label><input type="tel" v-model="form.phone" class="input input-bordered" /></div>
              <div class="form-control"><label class="label"><span class="label-text">Email</span></label><input type="email" v-model="form.email" class="input input-bordered" /></div>
            </div>
            <div class="form-control"><label class="label"><span class="label-text">Logo Usaha</span></label><input type="file" class="file-input file-input-bordered w-full" /></div>
          </div>

          <div v-if="activeTab === 'keuangan'" class="space-y-4 animate-fade-in">
            <h2 class="card-title">Pengaturan Keuangan & Transaksi</h2>
            <div class="divider">Data Rekening Bank</div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-control"><label class="label"><span class="label-text">Nama Bank</span></label><input v-model="form.bank_name" type="text" placeholder="BCA, Mandiri, dll." class="input input-bordered" /></div>
                <div class="form-control"><label class="label"><span class="label-text">Nomor Rekening</span></label><input v-model="form.bank_account_number" type="text" placeholder="1234567890" class="input input-bordered" /></div>
                <div class="form-control"><label class="label"><span class="label-text">Atas Nama</span></label><input v-model="form.bank_account_holder" type="text" placeholder="PT Finako Indonesia" class="input input-bordered" /></div>
            </div>
            <div class="divider">Data Perhitungan BEP</div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-control"><label class="label"><span class="label-text">Biaya Tetap/Bulan (Rp)</span></label><input type="number" v-model.number="form.fixed_costs" class="input input-bordered" /></div>
              <div class="form-control"><label class="label"><span class="label-text">Rata-rata HPP/Produk (Rp)</span></label><input type="number" v-model.number="form.avg_variable_cost" class="input input-bordered" /></div>
              <div class="form-control"><label class="label"><span class="label-text">Rata-rata Harga Jual (Rp)</span></label><input type="number" v-model.number="form.avg_selling_price" class="input input-bordered" /></div>
            </div>
             <div class="divider">Pajak & Biaya Layanan</div>
             <div class="flex flex-wrap gap-6 items-center">
                <div v-if="userStore.activeFeatures.includes('tax_ppn')" class="form-control"><label class="label cursor-pointer gap-2"><span class="label-text">Aktifkan PPN</span> <input type="checkbox" v-model="form.tax_enabled" class="toggle toggle-primary"/></label></div>
                <div v-if="userStore.activeFeatures.includes('service_charge')" class="form-control"><label class="label cursor-pointer gap-2"><span class="label-text">Aktifkan Biaya Layanan</span> <input type="checkbox" v-model="form.service_charge_enabled" class="toggle toggle-primary"/></label></div>
             </div>
          </div>
          
          <div v-if="activeTab === 'struk'" class="space-y-4 animate-fade-in">
            <h2 class="card-title">Pengaturan Struk</h2>
            <div class="form-control">
              <label class="label"><span class="label-text">Catatan di Bawah Struk (Footer)</span></label>
              <input type="text" v-model="form.receipt_footer_text" placeholder="Contoh: Terima kasih!" class="input input-bordered" />
            </div>
          </div>

          <div v-if="activeTab === 'fitur'" class="space-y-4 animate-fade-in">
  <h2 class="card-title">Fitur & Langganan</h2>
  <p>Berikut adalah daftar fitur yang terhubung dengan paket langganan Anda.</p>
  <div class="overflow-x-auto">
    <table class="table w-full">
      <thead>
        <tr>
          <th>Fitur</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="feature in orgFeatures" :key="feature.features.id">
          <td>
            <div class="font-bold">{{ feature.features.name }}</div>
            <div class="text-xs opacity-70">{{ feature.features.description }}</div>
          </td>
          <td class="text-center">
            <div v-if="feature.is_enabled" class="badge badge-success">Aktif</div>
            <div v-else class="badge badge-error">Nonaktif</div>
          </td>
        </tr>
        <tr v-if="orgFeatures.length === 0">
           <td colspan="2" class="text-center">Tidak ada data fitur.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
        </div>
      </div>
    </div>
  </div>
</template>