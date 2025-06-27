<script setup>
// Impor library dan komponen yang diperlukan
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'
import { useUserStore } from '@/stores/userStore'

// Panggil store user, untuk akses user & organization ID
const userStore = useUserStore()

// Data produk yang tersedia
const produkList = ref([])

// Keranjang belanja sementara
const keranjang = ref([])

// Nomor WhatsApp pelanggan
const nomorPelanggan = ref('')

// Ambil daftar produk dari database saat halaman dibuka
async function fetchProduk() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('organization_id', userStore.organization.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Gagal ambil produk:', error.message)
  } else {
    produkList.value = data
  }
}

// Tambahkan produk ke keranjang
function tambahKeKeranjang(item) {
  keranjang.value.push({
    id: item.id,
    name: item.name,
    price: item.price
  })
}

// Hapus produk dari keranjang
function hapusDariKeranjang(index) {
  keranjang.value.splice(index, 1)
}

// Hitung total harga keranjang
const totalHarga = computed(() => {
  return keranjang.value.reduce((sum, item) => sum + item.price, 0)
})

// Simpan transaksi ke tabel 'transactions' untuk laporan keuangan
async function simpanKeTransactions() {
  const { error } = await supabase.from('transactions').insert({
    description: 'Penjualan produk via kasir',
    amount: totalHarga.value,
    type: 'income', // <-- disini fix income
    category: 'penjualan',
    organization_id: userStore.organization.id,
    user_id: userStore.session.user.id
  })

  if (error) {
    alert('Gagal simpan ke transactions: ' + error.message)
    return false
  }
  return true
}

// Simpan transaksi ke tabel 'sales' saja (tanpa kirim WA)
async function simpanTransaksi() {
  if (keranjang.value.length === 0) {
    alert('Keranjang masih kosong!')
    return
  }

  const { error } = await supabase.from('sales').insert({
    customer_phone: nomorPelanggan.value,
    total: totalHarga.value,
    items: keranjang.value,
    organization_id: userStore.organization.id,
    user_id: userStore.session.user.id,
  })

  if (error) {
    alert('Gagal simpan transaksi: ' + error.message)
    return
  }

  const ok = await simpanKeTransactions()
  if (!ok) return

  alert('Transaksi berhasil disimpan!')
  resetForm()
}

// Simpan transaksi lalu kirim struk ke WA
async function kirimKeWhatsApp() {
  if (keranjang.value.length === 0) {
    alert('Keranjang masih kosong!')
    return
  }

  const { error } = await supabase.from('sales').insert({
    customer_phone: nomorPelanggan.value,
    total: totalHarga.value,
    items: keranjang.value,
    organization_id: userStore.organization.id,
    user_id: userStore.session.user.id,
  })

  if (error) {
    alert('Gagal simpan transaksi: ' + error.message)
    return
  }

  const ok = await simpanKeTransactions()
  if (!ok) return

  let pesan = `*Struk Finako:*\n\n`
  keranjang.value.forEach((item, idx) => {
    pesan += `${idx + 1}. ${item.name} - Rp ${item.price}\n`
  })
  pesan += `\n*Total: Rp ${totalHarga.value}*`

  const encodedPesan = encodeURIComponent(pesan)
  const nomor = nomorPelanggan.value.replace(/\D/g, '')
  if (!nomor) {
    alert('Masukkan nomor pelanggan terlebih dahulu.')
    return
  }

  window.open(`https://wa.me/${nomor}?text=${encodedPesan}`, '_blank')

  resetForm()
}

// Reset keranjang dan nomor pelanggan
function resetForm() {
  keranjang.value = []
  nomorPelanggan.value = ''
}

// Panggil saat halaman pertama kali dimuat
onMounted(() => {
  fetchProduk()
})
</script>


<template>
  <div class="p-4 space-y-6">

    <h2 class="text-xl font-bold">Pilih Produk</h2>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Tampilkan daftar produk -->
      <div
        v-for="item in produkList"
        :key="item.id"
        class="card bg-base-100 shadow cursor-pointer hover:scale-105 transition"
        @click="tambahKeKeranjang(item)"
      >
        <figure>
          <img
            :src="item.foto_url || 'https://placehold.co/300x200?text=No+Image'"
            alt="Produk"
            class="w-full h-28 object-cover"
          />
        </figure>
        <div class="card-body p-2 text-center">
          <h3 class="text-sm font-semibold">{{ item.name }}</h3>
          <p class="text-primary font-bold">Rp {{ item.price }}</p>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <h2 class="text-xl font-bold">Keranjang</h2>

    <div v-if="keranjang.length === 0" class="text-gray-500">Belum ada produk dipilih.</div>

    <div v-else>
      <div class="form-control mb-4">
        <label class="label">Nomor WA Pelanggan</label>
        <input v-model="nomorPelanggan" type="text" class="input input-bordered" placeholder="contoh: 6281234567890" />
      </div>

      <table class="table w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Produk</th>
            <th>Harga</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in keranjang" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.name }}</td>
            <td>Rp {{ item.price }}</td>
            <td>
              <button class="btn btn-xs btn-error" @click="hapusDariKeranjang(index)">Hapus</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th colspan="2">Total</th>
            <th colspan="2">Rp {{ totalHarga }}</th>
          </tr>
        </tfoot>
      </table>

      <div class="flex flex-col md:flex-row gap-2 mt-4">
        <button class="btn btn-success flex-1" @click="simpanTransaksi">Simpan Transaksi</button>
        <button class="btn btn-primary flex-1" @click="kirimKeWhatsApp">Kirim Struk ke WA & Simpan</button>
      </div>
    </div>

  </div>
</template>
