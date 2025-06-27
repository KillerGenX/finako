<script setup>
import { ref, watch } from 'vue'
import { supabase } from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const loading = ref(false)
const message = ref('')
const form = ref({
  fixed_costs: 0,
  avg_variable_cost: 0,
  avg_selling_price: 0
})

async function getSettings() {
  if (!userStore.organization?.id) return;
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('organization_id', userStore.organization.id)
      .single();

    // Abaikan error jika data belum ada, itu normal
    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      form.value.fixed_costs = data.fixed_costs;
      form.value.avg_variable_cost = data.avg_variable_cost;
      form.value.avg_selling_price = data.avg_selling_price;
    }
  } catch (error) {
    message.value = `Gagal memuat pengaturan: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

async function handleSaveSettings() {
  if (!userStore.organization?.id) {
    message.value = "Data organisasi tidak siap. Coba refresh.";
    return;
  }
  loading.value = true;
  message.value = '';
  try {
    const profileData = {
      organization_id: userStore.organization.id,
      fixed_costs: form.value.fixed_costs,
      avg_variable_cost: form.value.avg_variable_cost,
      avg_selling_price: form.value.avg_selling_price,
    };

    // Gunakan upsert: jika data sudah ada, update. Jika belum, buat baru.
    const { error } = await supabase.from('business_profiles').upsert(profileData, {
      onConflict: 'organization_id'
    });

    if (error) throw error;
    message.value = 'Pengaturan berhasil disimpan!';
  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

// "Pengawas Cerdas" yang menunggu data organisasi siap
watch(() => userStore.organization, (newOrg) => {
  if (newOrg) {
    getSettings();
  }
}, { immediate: true });
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-2xl">Pengaturan Usaha</h2>
      <p class="mb-4">Data yang Anda masukkan di sini akan digunakan untuk semua kalkulasi BEP di dasbor.</p>

      <form @submit.prevent="handleSaveSettings" class="space-y-4">
        <div class="form-control">
          <label class="label"><span class="label-text">Total Biaya Tetap per Bulan (Rp)</span></label>
          <input type="number" v-model.number="form.fixed_costs" placeholder="Contoh: 5000000" class="input input-bordered" required />
          <label class="label"><span class="label-text-alt">Contoh: Gaji, Sewa, Listrik, Internet.</span></label>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Rata-rata Biaya Variabel per Produk (Rp)</span></label>
          <input type="number" v-model.number="form.avg_variable_cost" placeholder="Contoh: 50000" class="input input-bordered" required />
          <label class="label"><span class="label-text-alt">Contoh: Harga Pokok / Modal untuk 1 unit produk.</span></label>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Rata-rata Harga Jual per Produk (Rp)</span></label>
          <input type="number" v-model.number="form.avg_selling_price" placeholder="Contoh: 80000" class="input input-bordered" required />
          <label class="label"><span class="label-text-alt">Harga jual ke pelanggan untuk 1 unit produk.</span></label>
        </div>
        <div class="card-actions justify-end mt-4">
          <button type="submit" :disabled="loading" class="btn btn-primary">
            <span v-if="loading" class="loading loading-spinner"></span>
            {{ loading ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </button>
        </div>
      </form>
      
      <div v-if="message" class="toast toast-top toast-center">
        <div class="alert alert-info">
          <span>{{ message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>