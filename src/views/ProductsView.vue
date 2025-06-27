<!-- File: src/views/ProductsView.vue (VERSI SCRIPT FINAL) -->
<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabase'
import { useUserStore } from '@/stores/userStore'
import { TrashIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

const userStore = useUserStore()
const loading = ref(false)
const message = ref('')
const products = ref([])
const newProduct = ref({ name: '', price: 0, cost: 0 })
const isEditModalOpen = ref(false)
const editingProduct = ref(null)

async function getProducts() {
  if (!userStore.organization?.id) return;
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', userStore.organization.id)
      .order('name');
    if (error) throw error;
    products.value = data;
  } catch (error) { message.value = `Error: ${error.message}`; } 
  finally { loading.value = false; }
}

// Ganti fungsi addProduct Anda dengan ini
async function addProduct() {
  // --- PAGAR PENGAMAN BARU ---
  // Cek dulu apakah data organisasi sudah siap di store sebelum melanjutkan
  if (!userStore.organization?.id) {
    message.value = "Data organisasi tidak ditemukan. Coba refresh halaman.";
    return; // Hentikan fungsi jika data belum siap
  }
  // --- AKHIR PAGAR PENGAMAN ---

  if (!newProduct.value.name || newProduct.value.price <= 0) { 
    message.value = 'Nama & harga harus diisi.'; 
    return; 
  }

  loading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('products').insert([{
      name: newProduct.value.name,
      price: newProduct.value.price,
      cost: newProduct.value.cost,
      user_id: user.id,
      organization_id: userStore.organization.id // <-- Baris ini sekarang aman
    }]);
    if (error) throw error;
    message.value = 'Produk berhasil ditambahkan.';
    newProduct.value = { name: '', price: 0, cost: 0 };
    await getProducts();
  } catch (error) { 
    message.value = `Error: ${error.message}`; 
  } finally { 
    loading.value = false; 
  }
}

function openEditModal(product) {
  editingProduct.value = { ...product };
  isEditModalOpen.value = true;
}

async function handleUpdateProduct() {
  if (!editingProduct.value.name) return;
  loading.value = true;
  try {
    const { id, name, price, cost } = editingProduct.value;
    const { error } = await supabase.from('products').update({ name, price, cost }).eq('id', id);
    if (error) throw error;
    message.value = 'Produk berhasil diperbarui.';
    isEditModalOpen.value = false;
    await getProducts();
  } catch (error) {
    message.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
}

async function deleteProduct(productId, productName) {
  if (confirm(`Yakin ingin menghapus produk '${productName}'?`)) {
    loading.value = true;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      message.value = 'Produk berhasil dihapus.';
      await getProducts();
    } catch (error) {
      message.value = `Error: ${error.message}`;
    } finally {
      loading.value = false;
    }
  }
}

onMounted(() => {
  if (userStore.isReady) {
    getProducts();
  } else {
    const unwatch = watch(() => userStore.isReady, (newValue) => {
      if (newValue) {
        getProducts();
        unwatch();
      }
    });
  }
});
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Tambah Produk/Menu Baru</h2>
        <form @submit.prevent="addProduct" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div class="form-control md:col-span-2">
            <label class="label"><span class="label-text">Nama Produk</span></label>
            <input type="text" v-model="newProduct.name" placeholder="Kopi Susu Gula Aren" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Harga Jual (Rp)</span></label>
            <input type="number" v-model.number="newProduct.price" placeholder="25000" class="input input-bordered" required />
          </div>
           <div class="form-control">
            <label class="label"><span class="label-text">Harga Modal (Rp)</span></label>
            <input type="number" v-model.number="newProduct.cost" placeholder="10000" class="input input-bordered" required />
          </div>
          <div class="card-actions">
            <button type="submit" :disabled="loading" class="btn btn-primary w-full">
              {{ loading ? '...' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body"><h2 class="card-title">Daftar Produk</h2><div class="overflow-x-auto"><table class="table w-full"><thead><tr><th>Nama Produk</th><th>Harga Jual</th><th>Harga Modal</th><th class="w-1/4">Aksi</th></tr></thead><tbody><tr v-if="loading"><td colspan="4" class="text-center">Memuat data...</td></tr><tr v-else-if="products.length === 0"><td colspan="4" class="text-center">Belum ada produk.</td></tr><tr v-for="product in products" :key="product.id" class="hover"><td class="font-medium">{{ product.name }}</td><td>Rp {{ new Intl.NumberFormat('id-ID').format(product.price) }}</td><td>Rp {{ new Intl.NumberFormat('id-ID').format(product.cost) }}</td><td class="flex items-center gap-2"><button @click="openEditModal(product)" class="btn btn-ghost btn-sm btn-circle" title="Edit"><PencilSquareIcon class="h-5 w-5" /></button><button @click="deleteProduct(product.id, product.name)" class="btn btn-ghost btn-sm btn-circle text-error" title="Hapus"><TrashIcon class="h-5 w-5" /></button></td></tr></tbody></table></div></div>
    </div>
     <dialog class="modal" :class="{ 'modal-open': isEditModalOpen }">
      <div class="modal-box"><h3 class="font-bold text-lg">Edit Produk</h3><form v-if="editingProduct" @submit.prevent="handleUpdateProduct" class="space-y-4 mt-4"><div class="form-control"><label class="label"><span class="label-text">Nama Produk</span></label><input type="text" v-model="editingProduct.name" class="input input-bordered" required /></div><div class="form-control"><label class="label"><span class="label-text">Harga Jual (Rp)</span></label><input type="number" v-model.number="editingProduct.price" class="input input-bordered" required /></div><div class="form-control"><label class="label"><span class="label-text">Harga Modal (Rp)</span></label><input type="number" v-model.number="editingProduct.cost" class="input input-bordered" required /></div><div class="modal-action"><button type="button" class="btn" @click="isEditModalOpen = false">Batal</button><button type="submit" :disabled="loading" class="btn btn-primary"><span v-if="loading" class="loading loading-spinner"></span>{{ loading ? '...' : 'Simpan' }}</button></div></form></div>
    </dialog>
    <div v-if="message" class="toast toast-top toast-center"><div class="alert alert-info"><span>{{ message }}</span></div></div>
  </div>
</template>