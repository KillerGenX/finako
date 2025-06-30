<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const namaProduk = ref('')
const hargaJual = ref(0)
const hargaModal = ref(0)
const selectedFile = ref(null)
const fileInput = ref(null)

const produkList = ref([])

async function fetchProduk() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Gagal ambil produk:', error.message)
  } else {
    produkList.value = data
  }
}

function onFileChange(event) {
  selectedFile.value = event.target.files[0]
}

async function simpanProduk() {
  let fotoUrl = null

  if (selectedFile.value) {
    const fileName = `${Date.now()}_${selectedFile.value.name}`
    const { data, error } = await supabase
      .storage
      .from('product-images')
      .upload(fileName, selectedFile.value)

    if (error) {
      alert('Gagal upload gambar: ' + error.message)
      return
    }

    fotoUrl = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName).data.publicUrl
  }

  const { error } = await supabase.from('products').insert({
    name: namaProduk.value,
    price: hargaJual.value,
    cost: hargaModal.value,
    foto_url: fotoUrl,
    organization_id: userStore.organization.id,
    user_id: userStore.session.user.id,
  })

  if (error) {
    alert('Gagal simpan produk: ' + error.message)
  } else {
    alert('Produk berhasil ditambahkan!')
    namaProduk.value = ''
    hargaJual.value = 0
    hargaModal.value = 0
    selectedFile.value = null
    fileInput.value.value = '' // reset input file ke kosong
    fetchProduk()
  }
}

async function hapusProduk(id) {
  if (confirm('Yakin ingin menghapus produk ini?')) {
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      alert('Gagal hapus produk: ' + error.message)
    } else {
      alert('Produk berhasil dihapus!')
      fetchProduk() // Refresh daftar produk
    }
  }
}


onMounted(() => {
  fetchProduk()
})

</script>

<template>
 <div class="p-4 space-y-8">

<!-- Form Tambah Produk -->
<div class="card bg-base-100 shadow p-4">
  <h2 class="text-xl font-bold mb-4">Tambah Produk Baru</h2>

  <div class="form-control mb-2">
    <label class="label">Nama Produk</label>
    <input v-model="namaProduk" type="text" class="input input-bordered" />
  </div>

  <div class="form-control mb-2">
    <label class="label">Harga Jual</label>
    <input v-model="hargaJual" type="number" class="input input-bordered" />
  </div>

  <div class="form-control mb-2">
    <label class="label">Harga Modal</label>
    <input v-model="hargaModal" type="number" class="input input-bordered" />
  </div>

  <div class="form-control mb-4">
    <label class="label">Foto Produk</label>
    <input type="file" @change="onFileChange" ref="fileInput" class="file-input file-input-bordered w-full" />
  </div>

  <button class="btn btn-primary w-full" @click="simpanProduk">Simpan Produk</button>
</div>

<!-- Daftar Produk -->
<div>
  <h2 class="text-xl font-bold mb-4">Daftar Produk</h2>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div
      v-for="item in produkList"
      :key="item.id"
      class="card bg-base-100 shadow"
    >
      <figure>
        <img
          :src="item.foto_url || 'https://placehold.co/300x200?text=No+Image'"
          alt="Foto Produk"
          class="w-full h-28 object-cover"
        />
      </figure>
      <div class="card-body p-2 text-center">
        <h3 class="text-sm font-semibold">{{ item.name }}</h3>
        <p class="text-primary font-bold">Rp {{ item.price }}</p>
        <p class="text-xs text-gray-500">Modal: Rp {{ item.cost }}</p>
        <button class="btn btn-xs btn-error mt-2" @click="hapusProduk(item.id)">Hapus</button>
      </div>
    </div>
  </div>
</div>

</div>

</template>
