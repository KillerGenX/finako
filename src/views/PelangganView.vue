<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/vue/24/solid';

const userStore = useUserStore();

// --- State Halaman ---
const customers = ref([]);
const loading = ref(true);
const searchTerm = ref('');
const isProcessing = ref(false);

// --- State untuk Modal Edit ---
const customerModal = ref(null);
const isEditMode = ref(false);
const currentCustomer = ref({ id: null, name: '', phone_number: '' });

// --- State untuk Modal Detail ---
const detailModal = ref(null);
const selectedCustomer = ref(null);
const customerTransactions = ref([]);
const isDetailLoading = ref(false);

// --- Fungsi Pengambilan Data ---
async function fetchCustomers() {
  if (!userStore.organization?.id) return;
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', userStore.organization.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    customers.value = data;
  } catch (error) {
    userStore.showNotification(`Error mengambil data pelanggan: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
}

// --- Computed & Fungsi ---
const filteredCustomers = computed(() => {
  if (!searchTerm.value) return customers.value;
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return customers.value.filter(c => 
    c.name?.toLowerCase().includes(lowerCaseSearch) || 
    c.phone_number?.includes(lowerCaseSearch)
  );
});

function resetCurrentCustomer() {
  currentCustomer.value = { id: null, name: '', phone_number: '' };
}

function openNewCustomerModal() {
  isEditMode.value = false;
  resetCurrentCustomer();
  customerModal.value.showModal();
}

function openEditCustomerModal(customer) {
  isEditMode.value = true;
  currentCustomer.value = { ...customer };
  customerModal.value.showModal();
}

async function showCustomerDetails(customer) {
  selectedCustomer.value = customer;
  isDetailLoading.value = true;
  customerTransactions.value = [];
  detailModal.value.showModal();
  
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('id, created_at, total')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    customerTransactions.value = data;
  } catch (err) {
    userStore.showNotification(`Gagal mengambil riwayat: ${err.message}`, 'error');
  } finally {
    isDetailLoading.value = false;
  }
}

async function handleFormSubmit() {
  if (isEditMode.value) {
    await updateCustomer();
  } else {
    await addCustomer();
  }
}

async function addCustomer() {
  if (!currentCustomer.value.name || !currentCustomer.value.phone_number) {
    return userStore.showNotification('Nama dan Nomor HP wajib diisi.', 'warning');
  }
  isProcessing.value = true;
  try {
    const { error } = await supabase.from('customers').insert({
      name: currentCustomer.value.name,
      phone_number: currentCustomer.value.phone_number.replace(/\D/g, ''),
      organization_id: userStore.organization.id,
    });
    if (error) throw error;
    userStore.showNotification('Pelanggan baru berhasil ditambahkan!', 'success');
    customerModal.value.close();
    await fetchCustomers();
  } catch (error) {
    userStore.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
}

async function updateCustomer() {
  isProcessing.value = true;
  try {
    const { error } = await supabase.from('customers')
      .update({
        name: currentCustomer.value.name,
        phone_number: currentCustomer.value.phone_number.replace(/\D/g, ''),
      })
      .eq('id', currentCustomer.value.id);
    if (error) throw error;
    userStore.showNotification('Data pelanggan berhasil diperbarui!', 'success');
    customerModal.value.close();
    await fetchCustomers();
  } catch (error) {
    userStore.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
}

async function deleteCustomer(customerId) {
  if (confirm('Yakin ingin menghapus pelanggan ini? Riwayat transaksi mereka tidak akan hilang.')) {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) throw error;
      userStore.showNotification('Pelanggan berhasil dihapus!', 'success');
      await fetchCustomers();
    } catch (error) {
      userStore.showNotification(`Error menghapus pelanggan: ${error.message}`, 'error');
    }
  }
}

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
}

onMounted(() => { if (userStore.isReady) fetchCustomers(); });
watch(() => userStore.isReady, (ready) => { if (ready && customers.value.length === 0) fetchCustomers(); });
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">Manajemen Pelanggan</h1>
        <p class="text-base-content/70">Kelola data pelanggan setia Anda di sini.</p>
      </div>
      <button @click="openNewCustomerModal" class="btn btn-primary">
        <PlusIcon class="h-5 w-5"/> Tambah Pelanggan
      </button>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="form-control mb-4">
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Cari nama atau nomor HP..." 
            class="input input-bordered w-full" 
          />
        </div>

        <div v-if="loading" class="text-center p-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Nama Pelanggan</th>
                <th>Nomor HP</th>
                <th>Poin Loyalitas</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="customer in filteredCustomers" :key="customer.id" class="hover">
                <td class="font-medium">{{ customer.name }}</td>
                <td>{{ customer.phone_number }}</td>
                <td><span class="badge badge-accent">{{ customer.points || 0 }}</span></td>
                <td class="text-right">
                  <button @click="showCustomerDetails(customer)" class="btn btn-ghost btn-sm btn-circle" title="Lihat Riwayat Transaksi">
                    <EyeIcon class="h-5 w-5 text-neutral"/>
                  </button>
                  <button @click="openEditCustomerModal(customer)" class="btn btn-ghost btn-sm btn-circle" title="Edit">
                    <PencilSquareIcon class="h-5 w-5 text-info"/>
                  </button>
                  <button @click="deleteCustomer(customer.id)" class="btn btn-ghost btn-sm btn-circle" title="Hapus">
                    <TrashIcon class="h-5 w-5 text-error"/>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredCustomers.length === 0">
                <td colspan="4" class="text-center">Tidak ada pelanggan ditemukan.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <dialog ref="customerModal" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="resetCurrentCustomer">✕</button>
      </form>
      <h3 class="font-bold text-lg">{{ isEditMode ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru' }}</h3>
      <form @submit.prevent="handleFormSubmit" class="py-4 space-y-4">
        <div class="form-control">
          <label class="label"><span class="label-text">Nama Pelanggan</span></label>
          <input v-model="currentCustomer.name" type="text" placeholder="Contoh: Budi Setiawan" class="input input-bordered" required />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Nomor HP</span></label>
          <input v-model="currentCustomer.phone_number" type="tel" placeholder="Contoh: 0812..." class="input input-bordered" required />
        </div>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="customerModal.close(); resetCurrentCustomer()">Batal</button>
          <button type="submit" class="btn btn-primary" :disabled="isProcessing">
            <span v-if="isProcessing" class="loading loading-spinner"></span>
            {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Pelanggan' }}
          </button>
        </div>
      </form>
    </div>
  </dialog>

  <dialog ref="detailModal" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 v-if="selectedCustomer" class="font-bold text-lg">5 Transaksi Terakhir: {{ selectedCustomer.name }}</h3>
      <div class="py-4">
        <div v-if="isDetailLoading" class="text-center p-8">
          <span class="loading loading-spinner"></span>
        </div>
        <div v-else-if="customerTransactions.length > 0" class="space-y-2">
          <div v-for="tx in customerTransactions" :key="tx.id" class="flex justify-between items-center p-3 bg-base-200 rounded-lg">
            <div>
              <p class="font-medium">Struk #{{ tx.id }}</p>
              <p class="text-xs text-base-content/70">{{ new Date(tx.created_at).toLocaleString('id-ID') }}</p>
            </div>
            <div class="font-bold text-success">{{ formatRupiah(tx.total) }}</div>
          </div>
        </div>
        <p v-else class="text-center text-base-content/60">Tidak ada riwayat transaksi ditemukan.</p>
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Tutup</button>
        </form>
      </div>
    </div>
  </dialog>
</template>