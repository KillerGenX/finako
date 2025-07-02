<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '@/supabase';
import { useUserStore } from '@/stores/userStore';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/solid';

const userStore = useUserStore();

// --- State Halaman ---
const produkList = ref([]);
const loading = ref(true);
const searchTerm = ref('');

// --- State untuk Modal & Form ---
const produkModal = ref(null); // Ref untuk modal
const isEditMode = ref(false); // Penanda mode: true = edit, false = tambah baru
const currentProduk = ref({ // State untuk menampung data di form
  id: null,
  name: '',
  price: 0,
  cost_price: 0,
  stock: 0,
  foto_url: '',
  file: null,
});

// --- Fungsi Pengambilan Data ---
async function fetchProduk() {
  if (!userStore.organization?.id) return;
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', userStore.organization.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    produkList.value = data;
  } catch (error) {
    userStore.showNotification(`Error mengambil produk: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
}

// Filter produk berdasarkan pencarian
const filteredProdukList = computed(() => {
  if (!searchTerm.value) return produkList.value;
  return produkList.value.filter(p => p.name.toLowerCase().includes(searchTerm.value.toLowerCase()));
});


// --- Fungsi untuk Modal & Form ---
function resetCurrentProduk() {
  currentProduk.value = { id: null, name: '', price: 0, cost_price: 0, stock: 0, foto_url: '', file: null };
}

function openNewProdukModal() {
  isEditMode.value = false;
  resetCurrentProduk();
  produkModal.value.showModal();
}

function openEditProdukModal(produk) {
  isEditMode.value = true;
  // Salin data produk yang akan diedit ke state form
  currentProduk.value = { ...produk, file: null }; 
  produkModal.value.showModal();
}

function onFileChange(event) {
  currentProduk.value.file = event.target.files[0];
}


// --- Fungsi CRUD (Create, Read, Update, Delete) ---
async function handleFormSubmit() {
  // Panggil fungsi yang sesuai berdasarkan mode (tambah atau edit)
  if (isEditMode.value) {
    await updateProduk();
  } else {
    await addProduk();
  }
}

async function addProduk() {
  isProcessing.value = true;
  try {
    let fotoUrl = null;
    // 1. Upload foto jika ada file baru yang dipilih
    if (currentProduk.value.file) {
      const fileName = `${Date.now()}_${currentProduk.value.file.name}`;
      const { data, error: uploadError } = await supabase.storage.from('product-images').upload(fileName, currentProduk.value.file);
      if (uploadError) throw uploadError;
      fotoUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
    }

    // 2. Simpan data produk ke database
    const { error } = await supabase.from('products').insert({
      name: currentProduk.value.name,
      price: currentProduk.value.price,
      cost_price: currentProduk.value.cost_price,
      stock: currentProduk.value.stock,
      foto_url: fotoUrl,
      organization_id: userStore.organization.id,
      user_id: userStore.session.user.id,
    });
    if (error) throw error;

    userStore.showNotification('Produk baru berhasil ditambahkan!', 'info');
    produkModal.value.close();
    await fetchProduk();

  } catch (error) {
    userStore.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
}

async function updateProduk() {
  isProcessing.value = true;
  try {
    let fotoUrl = currentProduk.value.foto_url;
    // Upload foto baru HANYA jika ada file baru
    if (currentProduk.value.file) {
      const fileName = `${Date.now()}_${currentProduk.value.file.name}`;
      const { data, error: uploadError } = await supabase.storage.from('product-images').upload(fileName, currentProduk.value.file);
      if (uploadError) throw uploadError;
      fotoUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
    }

    // Update data produk di database
    const { error } = await supabase.from('products')
      .update({
        name: currentProduk.value.name,
        price: currentProduk.value.price,
        cost_price: currentProduk.value.cost_price,
        stock: currentProduk.value.stock,
        foto_url: fotoUrl,
      })
      .eq('id', currentProduk.value.id);
    if (error) throw error;
    
    userStore.showNotification('Produk berhasil diperbarui!', 'success');
    produkModal.value.close();
    await fetchProduk();

  } catch (error) {
    userStore.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
}

async function hapusProduk(produkId, fotoUrl) {
  if (confirm('Yakin ingin menghapus produk ini?')) {
    try {
      // Hapus record dari database
      const { error: deleteError } = await supabase.from('products').delete().eq('id', produkId);
      if (deleteError) throw deleteError;

      // Hapus file foto dari storage jika ada
      if (fotoUrl) {
        const fileName = fotoUrl.split('/').pop();
        await supabase.storage.from('product-images').remove([fileName]);
      }
      
      userStore.showNotification('Produk berhasil dihapus!', 'success');
      await fetchProduk();
    } catch (error) {
      userStore.showNotification(`Error menghapus produk: ${error.message}`, 'error');
    }
  }
}

// State untuk processing (loading di tombol)
const isProcessing = ref(false);

// Lifecycle Hooks
onMounted(() => { if (userStore.isReady) fetchProduk(); });
watch(() => userStore.isReady, (ready) => { if (ready && produkList.value.length === 0) fetchProduk(); });
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Manajemen Produk</h1>
      <button @click="openNewProdukModal" class="btn btn-primary">
        <PlusIcon class="h-5 w-5"/> Tambah Produk Baru
      </button>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="form-control mb-4">
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Cari nama produk..." 
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
                <th>Produk</th>
                <th>Harga Jual</th>
                <th>Harga Modal</th>
                <th>Stok</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="produk in filteredProdukList" :key="produk.id" class="hover">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12">
                        <img :src="produk.foto_url || 'https://placehold.co/100x100?text=F'" alt="Foto Produk" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold">{{ produk.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="font-semibold">{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(produk.price) }}</td>
                <td>{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(produk.cost_price || 0) }}</td>
                <td>
                  <div class="badge" :class="{'badge-error': produk.stock <= 10, 'badge-warning': produk.stock > 10 && produk.stock <= 20}">
                    {{ produk.stock || 0 }}
                  </div>
                </td>
                <td class="text-right">
                  <button @click="openEditProdukModal(produk)" class="btn btn-ghost btn-sm btn-circle">
                    <PencilIcon class="h-5 w-5 text-info"/>
                  </button>
                  <button @click="hapusProduk(produk.id, produk.foto_url)" class="btn btn-ghost btn-sm btn-circle">
                    <TrashIcon class="h-5 w-5 text-error"/>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredProdukList.length === 0">
                <td colspan="5" class="text-center">Tidak ada produk ditemukan.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <dialog ref="produkModal" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="resetCurrentProduk">✕</button>
      </form>
      <h3 class="font-bold text-lg">{{ isEditMode ? 'Edit Produk' : 'Tambah Produk Baru' }}</h3>
      
      <form @submit.prevent="handleFormSubmit" class="py-4 space-y-4">
        <div class="form-control">
          <label class="label"><span class="label-text">Nama Produk</span></label>
          <input v-model="currentProduk.name" type="text" placeholder="Contoh: Kopi Susu" class="input input-bordered" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Harga Jual</span></label>
            <input v-model.number="currentProduk.price" type="number" placeholder="18000" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Harga Modal</span></label>
            <input v-model.number="currentProduk.cost_price" type="number" placeholder="7000" class="input input-bordered" />
          </div>
        </div>
        <div class="form-control">
            <label class="label"><span class="label-text">Stok Awal</span></label>
            <input v-model.number="currentProduk.stock" type="number" placeholder="100" class="input input-bordered" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Foto Produk</span></label>
          <input type="file" @change="onFileChange" class="file-input file-input-bordered w-full" accept="image/*" />
          <div v-if="isEditMode && currentProduk.foto_url" class="mt-2 text-xs">
            <p>Foto saat ini:</p>
            <img :src="currentProduk.foto_url" class="h-16 w-16 rounded mt-1"/>
          </div>
        </div>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="produkModal.close(); resetCurrentProduk()">Batal</button>
          <button type="submit" class="btn btn-primary" :disabled="isProcessing">
            <span v-if="isProcessing" class="loading loading-spinner"></span>
            {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Produk' }}
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>
